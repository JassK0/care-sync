# Quick Fix: Deploy to Test

`vercel dev` has known limitations with Python functions. Let's verify your code works by deploying:

## Deploy Command

```bash
vercel
```

This will:
1. Deploy your project to Vercel
2. Show you a preview URL
3. Test if Python functions work in production

## If It Works in Production

Then we know:
- ✅ Your code is correct
- ✅ Python functions are properly structured
- ❌ The issue is `vercel dev` local detection

## If It Doesn't Work

We'll see the actual errors and fix them.

## Set Environment Variables

After deploying, set these in Vercel dashboard:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DRIFT_TIME_WINDOW_HOURS` - Time window (default: 12)

Path: Vercel Dashboard → Your Project → Settings → Environment Variables

## Why This Approach?

`vercel dev` has limitations detecting Python functions when:
- There's a custom `devCommand`
- The project structure is complex
- Python functions are in `/api/` with a Next.js frontend

Deploying to production will tell us if the issue is with local dev or the code itself.
