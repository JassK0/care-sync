import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface Note {
  note_id: string;
  patient_id: string;
  patient_name: string;
  mrn: string;
  timestamp: string;
  author_role: string;
  note_text: string;
}

export interface Patient {
  patient_id: string;
  name: string;
  mrn: string;
  note_count: number;
  roles: string[];
  latest_note: string | null;
}

export function getDataPath(): string {
  // In Next.js API routes, process.cwd() is the project root (care-sync/)
  // Try multiple possible paths
  const paths = [
    join(process.cwd(), 'data'), // Project root/data
    join(process.cwd(), '..', 'data'), // One level up
    join(process.cwd(), 'frontend', 'data'), // Frontend/data
  ];
  
  for (const path of paths) {
    if (existsSync(path)) {
      console.log(`Found data directory at: ${path}`);
      return path;
    }
  }
  
  // Fallback to project root
  console.warn(`Data directory not found, using fallback: ${join(process.cwd(), 'data')}`);
  return join(process.cwd(), 'data');
}

export function getNotesHash(): string {
  try {
    const dataPath = getDataPath();
    const notesFile = join(dataPath, 'synthetic_notes.json');
    
    if (!existsSync(notesFile)) {
      return '';
    }
    
    const fileContent = readFileSync(notesFile, 'utf-8');
    const stats = statSync(notesFile);
    // Create hash from content + modification time
    const hash = createHash('md5').update(fileContent + stats.mtimeMs.toString()).digest('hex');
    return hash;
  } catch (error: any) {
    console.error('Error generating notes hash:', error);
    return '';
  }
}

export function loadNotes(): Note[] {
  try {
    const dataPath = getDataPath();
    const notesFile = join(dataPath, 'synthetic_notes.json');
    
    console.log(`Attempting to load notes from: ${notesFile}`);
    
    if (!existsSync(notesFile)) {
      console.error(`Notes file not found at: ${notesFile}`);
      console.log(`Current working directory: ${process.cwd()}`);
      return [];
    }
    
    const fileContent = readFileSync(notesFile, 'utf-8');
    const data = JSON.parse(fileContent);

    // Handle nested structure: { "patients": [ { "patient_id": "...", "notes": [...] } ] }
    if (data && typeof data === 'object' && 'patients' in data) {
      const flattenedNotes: Note[] = [];
      const patientCount = (data.patients || []).length;
      console.log(`Found ${patientCount} patients in data file`);
      
      for (const patient of data.patients || []) {
        const patientId = patient.patient_id || '';
        const patientName = patient.patient_name || '';
        const mrn = patient.mrn || '';
        const noteCount = (patient.notes || []).length;
        
        console.log(`Processing patient ${patientId} (${patientName}) with ${noteCount} notes`);

        // Add patient info to each note
        for (const note of patient.notes || []) {
          flattenedNotes.push({
            ...note,
            patient_id: patientId, // Always use the patient's ID from the parent
            patient_name: patientName,
            mrn: mrn,
          });
        }
      }
      console.log(`Loaded ${flattenedNotes.length} notes from ${patientCount} patients`);
      return flattenedNotes;
    }

    // Handle flat structure: [ { "note_id": "...", ... } ]
    if (Array.isArray(data)) {
      console.log(`Loaded ${data.length} notes from flat structure`);
      return data;
    }

    console.warn('Unknown data structure, returning empty array');
    return [];
  } catch (error: any) {
    console.error('Error loading notes:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      path: error.path,
    });
    return [];
  }
}

export function jsonResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status: number = 500) {
  return Response.json({ error: message }, { status });
}
