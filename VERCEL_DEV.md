# Running Vercel Dev Server

To start the development server with Vercel serverless functions:

```bash
vercel dev
```

**Do NOT use `npm run dev`** - it causes a recursive invocation error because Vercel detects the `dev` script and tries to run it.

## What happens

When you run `vercel dev`:
1. Vercel reads `vercel.json` and uses the `devCommand` to start the Next.js frontend
2. Vercel automatically detects Python files in `/api/*.py` and serves them as serverless functions
3. The `rewrites` in `vercel.json` route `/api/*` requests to the Python functions
4. Everything runs on a single port (usually 3000)

## Alternative: Add a wrapper script

If you want to use `npm run dev`, you can create a simple wrapper:

```bash
#!/bin/bash
# Run vercel dev directly (not through npm to avoid recursion)
vercel dev
```

Save this as `dev.sh`, make it executable (`chmod +x dev.sh`), and update package.json:
```json
"dev": "./dev.sh"
```

But the simplest approach is to just run `vercel dev` directly.
