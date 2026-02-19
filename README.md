# Care Sync - Clinical Narrative Drift Detector

A hallucination-safe, enterprise-oriented AI system that detects clinical narrative drift across hospital roles (physicians, nurses, allied health) using synthetic data only.

## 🎯 Project Goal

Care Sync ingests time-stamped, role-labeled clinical notes, extracts explicitly stated clinical facts, detects cross-role inconsistencies, and generates neutral, evidence-grounded reconciliation briefs.

**This system does NOT perform diagnosis, prognosis, or treatment recommendations.**

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

**Quick start:**
1. Install dependencies: `npm run install:all`
2. Create `.env.local` with your OpenAI API key (see SETUP.md)
3. Run: `npm run dev`

This will start both the backend (FastAPI on port 8000) and frontend (Next.js on port 3000).

## 🏗️ Architecture

- **Backend**: Python FastAPI with deterministic drift detection
- **Frontend**: Next.js with React dashboard
- **AI**: OpenAI GPT API (constrained to fact extraction only)
- **Data**: Synthetic clinical notes (no real patient data)

## 📁 Project Structure

```
/care-sync
  /backend          # FastAPI backend
  /frontend         # Next.js frontend
  /data             # Synthetic clinical notes
  /docs             # Documentation
  README.md
```

## 🛡️ Safety & Constraints

- NO clinical inference
- NO hallucinated facts
- All outputs traceable to source text
- Deterministic drift detection (code-based)
- LLM used only for structured fact extraction

## 📚 Documentation

See `/docs` for:
- `architecture.md` - System architecture
- `sdg.md` - UN SDG alignment
- `ai_safety.md` - AI safety and hallucination mitigation

## 🏆 Hackathon Context

Built for IBM Z Sheridan – BYTE: Enterprise AI Hackathon (TMU Tech Week 2026)
