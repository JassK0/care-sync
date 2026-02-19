# Fixing .vercelignore for Python Functions

## The Problem

Vercel logs show:
```
Removed 2 ignored files defined in .vercelignore
  /api/requirements.txt
  /requirements.txt
```

This means BOTH requirements.txt files are being ignored, but we need `api/requirements.txt` for Python serverless functions to work!

## The Fix

Updated `.vercelignore` to:
- Ignore root `/requirements.txt` (has FastAPI, not needed)
- **NOT ignore** `api/requirements.txt` (needed for serverless functions)

The pattern `/requirements.txt` (with leading slash) only matches the root file, not files in subdirectories.

## Why This Matters

- `api/requirements.txt` contains dependencies for Python serverless functions (openai, python-dotenv)
- Without it, Vercel can't install Python dependencies
- Python functions won't work (404 errors)

## After This Fix

1. Commit and push the updated `.vercelignore`
2. Redeploy
3. Vercel should now:
   - Ignore root `requirements.txt` (prevents FastAPI detection)
   - Use `api/requirements.txt` (installs Python dependencies)
   - Deploy Python serverless functions correctly
