# Debugging Vercel Dev with Python Functions

## Current Issue
`vercel dev` is only serving the frontend, not the Python serverless functions.

## What to Check

When you run `vercel dev`, check the terminal output for:

1. **Python function detection**: Look for messages like:
   - "Python runtime detected"
   - "Building functions..."
   - "Installing Python dependencies..."

2. **Function listing**: Vercel should list detected functions

3. **Errors**: Any errors about Python or dependencies

## Common Issues

### Issue 1: Python functions not detected
**Solution**: Make sure:
- Python files are in `/api/*.py` (not nested)
- `requirements.txt` exists in `/api/` directory
- Files have a `handler(request)` function

### Issue 2: devCommand only runs frontend
**Solution**: The `devCommand` in `vercel.json` might be preventing Python detection. Try temporarily removing it or ensuring Vercel can detect both.

### Issue 3: Rewrites not working
**Solution**: Vercel should auto-detect Python files, but rewrites might help route requests. Try adding them back.

## Test Commands

1. **Test if Python functions are accessible**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check what Vercel detects**:
   Look at the terminal output when running `vercel dev` - it should show detected functions.

3. **Verify file structure**:
   ```bash
   ls -la api/*.py
   ```

## Next Steps

If `vercel dev` still doesn't detect Python functions, we may need to:
1. Check Vercel CLI version
2. Try a different configuration approach
3. Use explicit function configuration
