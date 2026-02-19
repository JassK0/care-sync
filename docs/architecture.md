# Care Sync Architecture

## System Overview

Care Sync is a hallucination-safe, enterprise-oriented AI system that detects clinical narrative drift across hospital roles. The system is designed as a 2-day hackathon MVP with enterprise-quality structure.

## Architecture Principles

1. **Separation of Concerns**: AI (GPT) handles messy NLP, deterministic code handles enterprise logic
2. **Hallucination Safety**: All facts must be traceable to source text
3. **No Clinical Inference**: System never diagnoses, recommends, or interprets
4. **Auditability**: All drift detection logic is deterministic and reviewable

## System Components

### Backend (FastAPI)

**Location**: `/backend`

**Components**:
- `main.py`: FastAPI application entry point
- `routes/`: API endpoints
  - `notes.py`: Clinical notes CRUD
  - `patients.py`: Patient management
  - `alerts.py`: Drift detection alerts
  - `summaries.py`: Patient reconciliation briefs
- `services/`: Business logic
  - `fact_extraction.py`: OpenAI GPT-based fact extraction
  - `drift_detection.py`: Deterministic drift detection rules

**API Endpoints**:
- `GET /api/notes`: Get all notes
- `GET /api/notes/{note_id}`: Get specific note
- `GET /api/notes/patient/{patient_id}`: Get patient notes
- `GET /api/patients`: Get all patients
- `GET /api/patients/{patient_id}`: Get patient details
- `GET /api/alerts`: Get all drift alerts
- `GET /api/alerts/patient/{patient_id}`: Get patient alerts
- `GET /api/summaries/patient/{patient_id}`: Get patient summary

### Frontend (Next.js)

**Location**: `/frontend`

**Components**:
- `app/page.tsx`: Dashboard home
- `app/patients/page.tsx`: Patient list
- `app/patients/[id]/page.tsx`: Patient detail with summary, notes, alerts
- `app/notes/page.tsx`: All clinical notes timeline
- `app/alerts/page.tsx`: All drift alerts

**Features**:
- Real-time dashboard statistics
- Patient management interface
- Clinical notes timeline view
- Drift alert visualization
- Evidence-linked reconciliation briefs

### Data Layer

**Location**: `/data`

- `synthetic_notes.json`: Synthetic clinical notes (no real patient data)
- Format: JSON array of note objects with:
  - `note_id`: Unique identifier
  - `patient_id`: Patient identifier
  - `timestamp`: ISO timestamp
  - `author_role`: MD, RN, PT, RT, etc.
  - `note_text`: Clinical note content

## Process Flow

### 1. Note Ingestion
- Notes loaded from JSON file (in production, would integrate with Cerner/Epic)
- Each note includes metadata: patient, timestamp, author role

### 2. Fact Extraction (AI)
- **Service**: `FactExtractionService`
- **Model**: OpenAI GPT-4o-mini
- **Purpose**: Extract explicitly stated facts only
- **Output**: Structured JSON with facts, types, values, source quotes
- **Constraints**:
  - No inference
  - No interpretation
  - Only explicitly stated facts
  - Every fact includes source quote

### 3. Drift Detection (Deterministic)
- **Service**: `DriftDetectionService`
- **Method**: Rule-based, code-only logic
- **Rules**:
  - Oxygen requirement drift (RN documents increase, MD documents decrease)
  - Vital sign drift (abnormal vitals without MD acknowledgement)
  - Functional status drift (PT documents decline, MD documents improvement)
  - Symptom acknowledgement (symptoms documented multiple times without MD response)
- **Output**: Alert objects with:
  - Alert type and severity
  - Roles involved
  - Conflicting facts
  - Time window
  - Source note IDs

### 4. Reconciliation Brief (AI - Grounded)
- **Service**: `generate_reconciliation_brief()`
- **Model**: OpenAI GPT-4o-mini
- **Purpose**: Generate neutral summary from extracted facts
- **Constraints**:
  - Only uses extracted facts
  - Neutral language
  - No interpretation
  - Explicitly states uncertainty
  - Communication artifact, not medical advice

## Technology Stack

- **Backend**: Python 3.9+, FastAPI, OpenAI API
- **Frontend**: Next.js 14, React 18, TypeScript
- **AI**: OpenAI GPT-4o-mini
- **Data**: JSON (synthetic)

## Integration Points

### Current (MVP)
- Static JSON file for notes

### Production (Future)
- Cerner/Epic EHR integration
- Real-time note streaming
- Database persistence
- Authentication/authorization
- Audit logging

## Safety Mechanisms

1. **Fact Extraction Guardrails**:
   - Extraction-only prompts
   - JSON schema validation
   - Source quote requirement
   - Low temperature (0.1) for consistency

2. **Drift Detection Guardrails**:
   - Pure code logic (no AI)
   - Rule-based, auditable
   - Time-window constraints
   - Role-based conflict detection

3. **Brief Generation Guardrails**:
   - Facts-only input
   - Neutral language enforcement
   - Uncertainty statements
   - No recommendations

## Scalability Considerations

- **Current**: Single-file JSON, in-memory processing
- **Future**: Database, caching, async processing, microservices

## Security Considerations

- API keys stored in environment variables
- CORS configured for local development
- No authentication in MVP (add for production)
- No real patient data (synthetic only)
