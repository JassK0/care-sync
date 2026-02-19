# Vercel Root Directory Configuration

## The Issue

Vercel is looking for Next.js in the root directory, but your Next.js app is in the `frontend/` directory.

## Solution: Set Root Directory in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Find **Root Directory**
4. Set it to: `frontend`
5. Save

This tells Vercel:
- The Next.js app is in `frontend/`
- Look for `package.json` in `frontend/package.json`
- Build from `frontend/` directory
- Python functions in `/api/` are still at the project root (they'll work fine)

## Alternative: Update vercel.json

If you can't access the dashboard, we can try configuring it in `vercel.json`, but the dashboard setting is more reliable.

## After Setting Root Directory

Once you set the root directory to `frontend`:
- Vercel will detect Next.js correctly
- The build should succeed
- Python functions in `/api/` will still work (they're relative to project root)
