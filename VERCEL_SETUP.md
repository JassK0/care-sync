# Vercel Serverless Setup

This project uses Vercel serverless functions instead of a separate FastAPI backend server.

## Setup

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**:
   - Create `.env.local` in the root directory
   - Add your `OPENAI_API_KEY` and `DRIFT_TIME_WINDOW_HOURS`

4. **Run locally**:
   ```bash
   npm run dev
   ```
   
   This runs Vercel's dev server which:
   - Starts Next.js frontend (port 3000)
   - Handles Python serverless functions in `/api/*`
   - No separate backend server needed!
   
   The `start-dev.sh` script avoids the recursive invocation issue.

## How It Works

- **API Routes**: All backend logic is in `/api/*.py` files (Vercel serverless functions)
- **No Separate Server**: Everything runs through Vercel's dev server
- **Same Python Code**: Services (`fact_extraction.py`, `drift_detection.py`) are in `/api/services/`
- **Relative URLs**: Frontend uses relative URLs (no CORS issues)

## API Endpoints

All endpoints are available at `/api/*`:
- `GET /api/health` - Health check
- `GET /api/notes` - All notes
- `GET /api/notes/{note_id}` - Specific note
- `GET /api/notes/patient/{patient_id}` - Notes for a patient
- `POST /api/notes/by-ids` - Get notes by IDs
- `GET /api/patients` - All patients
- `GET /api/patients/{patient_id}` - Specific patient
- `GET /api/alerts` - All alerts
- `GET /api/alerts/patient/{patient_id}` - Alerts for a patient
- `GET /api/summaries/patient/{patient_id}` - Patient summary

## Deployment

Deploy to Vercel:
```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Benefits

✅ No separate backend server to manage  
✅ Single command to run everything (`npm run dev`)  
✅ Automatic scaling with Vercel  
✅ No CORS issues (same origin)  
✅ Keep all your Python code  
✅ Time window configurable via `DRIFT_TIME_WINDOW_HOURS` in `.env.local`

## Troubleshooting

If you get "recursive invocation" error:
- Make sure you're running `npm run dev` from the root directory
- The `--yes` flag prevents Vercel from asking about dev command

If API calls fail:
- Make sure Vercel CLI is installed: `npm install -g vercel`
- Check that `.env.local` has `OPENAI_API_KEY` set
- Verify Python dependencies are installed: `pip3 install -r requirements.txt`
