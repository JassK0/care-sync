"""
Fact Extraction Service
Uses OpenAI GPT API to extract explicitly stated clinical facts from notes.
NO inference, NO interpretation, NO medical judgment.
"""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
import json

# Load .env.local from project root (parent directory)
# Try multiple paths to find .env.local
possible_paths = [
    Path(__file__).parent.parent.parent / ".env.local",  # From api/services/
    Path(__file__).parent.parent / ".env.local",  # From api/
    Path.cwd() / ".env.local",  # Current working directory
    Path.cwd().parent / ".env.local",  # Parent of current directory
]

env_loaded = False
for env_path in possible_paths:
    if env_path.exists():
        try:
            # Use override=True to ensure .env.local values take precedence
            load_dotenv(env_path, override=True)
            env_loaded = True
            print(f"Loaded .env.local from: {env_path}")
            break
        except Exception as e:
            print(f"Warning: Could not load .env.local from {env_path}: {e}")
            continue

# Also try loading regular .env as fallback (but don't override .env.local values)
if not env_loaded:
    load_dotenv()

class FactExtractionService:
    """
    Extracts structured facts from clinical notes using OpenAI GPT.
    All facts must be explicitly stated in the source text.
    """
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables. Please check your .env.local file.")
        
        # Strip whitespace and remove quotes if present
        api_key = api_key.strip().strip('"').strip("'")
        
        # Check if it's still the placeholder value
        if api_key == "your_openai_api_key_here" or not api_key.startswith("sk-"):
            raise ValueError(f"OPENAI_API_KEY appears to be invalid. Current value: {api_key[:10]}... (should start with 'sk-')")
        
        # Initialize OpenAI client with timeout
        self.client = OpenAI(
            api_key=api_key,
            timeout=30.0  # 30 second timeout per request
        )
        self.model = "gpt-4o-mini"  # Using mini for cost efficiency in MVP
    
    def extract_facts(self, note_text: str, note_id: str, author_role: str) -> Dict[str, Any]:
        """
        Extract explicitly stated facts from a clinical note.
        
        Returns:
            {
                "note_id": str,
                "facts": [
                    {
                        "type": str,
                        "value": str,
                        "details": str,
                        "source_quote": str  # Exact excerpt from note
                    }
                ]
            }
        """
        
        prompt = f"""You are a clinical fact extraction system. Your ONLY job is to extract facts that are EXPLICITLY STATED in the following clinical note.

CRITICAL RULES:
1. Extract ONLY facts that are explicitly written in the text
2. Do NOT infer, interpret, or summarize
3. Do NOT add any medical judgment
4. If a fact is not clearly stated, DO NOT include it
5. Include the exact quote from the text for each fact

Clinical Note:
{note_text}

Author Role: {author_role}

Extract facts in the following categories (only if explicitly stated):
- vital_signs: Heart rate, blood pressure, temperature, respiratory rate, oxygen saturation
- oxygen_requirement: Changes in oxygen delivery, flow rates, delivery method
- functional_status: Mobility, ambulation, activity tolerance
- symptoms: Patient-reported or observed symptoms
- medication_changes: New medications, dose changes, discontinuations
- lab_results: Laboratory values mentioned
- other: Any other explicitly stated clinical observations

Output ONLY valid JSON in this exact format:
{{
    "note_id": "{note_id}",
    "facts": [
        {{
            "type": "vital_sign",
            "value": "tachycardia",
            "details": "HR 118 with ambulation",
            "source_quote": "Patient tachycardic to 118 with ambulation"
        }}
    ]
}}

If no facts can be extracted, return: {{"note_id": "{note_id}", "facts": []}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a fact extraction system. Extract only explicitly stated facts. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for consistency
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            # Validate and add source quotes if missing
            if "facts" in result:
                for fact in result["facts"]:
                    if "source_quote" not in fact:
                        fact["source_quote"] = fact.get("details", "")
            
            return result
            
        except Exception as e:
            print(f"Error extracting facts: {e}")
            return {
                "note_id": note_id,
                "facts": []
            }
    
    def extract_facts_batch(self, notes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract facts from multiple notes."""
        results = []
        total = len(notes)
        for idx, note in enumerate(notes, 1):
            if idx % 5 == 0:
                print(f"Processing note {idx}/{total}...")
            try:
                facts = self.extract_facts(
                    note.get("note_text", ""),
                    note.get("note_id", ""),
                    note.get("author_role", "")
                )
                results.append(facts)
            except Exception as e:
                print(f"Error extracting facts from note {note.get('note_id', 'unknown')}: {e}")
                # Return empty facts for this note
                results.append({
                    "note_id": note.get("note_id", ""),
                    "facts": []
                })
        return results
