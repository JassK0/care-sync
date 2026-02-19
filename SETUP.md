# Care Sync Setup Instructions

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key

## Quick Setup

1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

   Or use the convenience script:
   ```bash
   npm run install:all
   ```

4. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory with:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   BACKEND_PORT=8000
   BACKEND_HOST=localhost
   NEXT_PUBLIC_API_URL=http://localhost:8000
   MAX_FACTS_PER_NOTE=20
   DRIFT_CONFIDENCE_THRESHOLD=0.7
   DRIFT_TIME_WINDOW_HOURS=24
   ```
   
   **Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key from https://platform.openai.com/api-keys

5. **Run the application**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API at http://localhost:8000
   - Frontend at http://localhost:3000

## Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed: `python --version`
- Install dependencies: `cd backend && pip install -r requirements.txt`
- Check that port 8000 is not in use

### Frontend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Install dependencies: `cd frontend && npm install`
- Check that port 3000 is not in use

### API calls failing
- Verify `.env.local` has your OpenAI API key
- Check that backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL

### No data showing
- Verify `data/synthetic_notes.json` exists and has content
- Check browser console for errors
- Verify backend API is responding: http://localhost:8000/api/health

## Development

### Backend Only
```bash
npm run dev:backend
```

### Frontend Only
```bash
npm run dev:frontend
```

### Both (Recommended)
```bash
npm run dev
```

## Project Structure

```
care-sync/
├── backend/           # FastAPI backend
│   ├── main.py
│   ├── routes/       # API endpoints
│   └── services/     # Business logic
├── frontend/         # Next.js frontend
│   └── app/          # Next.js app directory
├── data/             # Synthetic clinical notes
├── docs/             # Documentation
├── .env.local        # Environment variables (create this)
└── package.json      # Root package.json with scripts
```

## Next Steps

1. Add your OpenAI API key to `.env.local`
2. Run `npm run dev`
3. Open http://localhost:3000
4. Explore the dashboard, patients, notes, and alerts

## For Hackathon Demo

The system is ready to demo with:
- ✅ 21 synthetic clinical notes
- ✅ Multiple patients with documentation drift scenarios
- ✅ Dashboard showing all patients, notes, and alerts
- ✅ Patient detail pages with reconciliation briefs
- ✅ Evidence-linked drift alerts

See `/docs` for architecture, SDG alignment, and AI safety documentation.
