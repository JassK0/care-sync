# Testing Vercel Serverless Functions

Since `vercel dev` has limitations detecting Python functions locally, let's deploy to Vercel to verify everything works in production.

## Quick Deploy

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   This will:
   - Deploy your project
   - Show you a preview URL
   - Test if Python functions work in production

2. **If it works in production**, then we know:
   - Your code is correct
   - The issue is with `vercel dev` local detection
   - We can work on fixing local dev

3. **If it doesn't work**, we'll see the errors and fix them.

## What to Check After Deploy

1. Visit the preview URL
2. Check if `/api/health` works: `https://your-url.vercel.app/api/health`
3. Check if patients/notes/alerts load

## Environment Variables

Make sure to set environment variables in Vercel:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DRIFT_TIME_WINDOW_HOURS` - Time window for drift detection (default: 12)

You can set these via:
- Vercel dashboard → Project Settings → Environment Variables
- Or during `vercel` command (it will prompt)
