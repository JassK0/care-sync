# Fixing Vercel Deployment - Python Functions Not Working

## The Problem
Python serverless functions in `/api/` are returning 404 errors after deployment.

## Solution: Set Root Directory in Vercel Dashboard

The issue is that Vercel needs to know where your Next.js app is, but also needs access to Python functions at the project root.

### Step 1: Set Root Directory
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Find **Root Directory**
4. **Leave it empty** (project root) - this is important!
5. Save

### Step 2: Verify Configuration
Your `vercel.json` should be simple:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install"
}
```

### Step 3: Ensure Python Functions Are Detected
Vercel should auto-detect Python files in `/api/` directory. Make sure:
- ✅ Files are named correctly (e.g., `health.py`, `patients.py`)
- ✅ Each file has a `handler(request)` function
- ✅ `api/requirements.txt` exists with Python dependencies
- ✅ No `requirements.txt` in root (or it's in `.vercelignore`)

### Step 4: Check Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DRIFT_TIME_WINDOW_HOURS` - Time window (default: 12)

### Step 5: Redeploy
After making changes, redeploy:
```bash
git push
```
Or manually trigger a redeploy in Vercel dashboard.

## Why This Works

- **Root Directory = Project Root**: This allows Vercel to see both:
  - Next.js app in `frontend/` (via build commands)
  - Python functions in `api/` (auto-detected)
  
- **No Root Directory Set**: If you set root to `frontend/`, Vercel won't see `api/` at all

- **Simple vercel.json**: Let Vercel auto-detect Python functions instead of explicitly configuring them

## Testing After Deploy

1. Test health endpoint: `https://your-app.vercel.app/api/health`
2. Test patients: `https://your-app.vercel.app/api/patients`
3. Check Vercel function logs for any errors
