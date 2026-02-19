# Debugging Connection Issues

## Quick Checks

1. **Backend is running?**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status":"healthy","service":"care-sync-backend"}`

2. **Frontend is running?**
   ```bash
   curl http://localhost:3000
   ```
   Should return HTML

3. **Check browser console**
   - Open DevTools (F12)
   - Look for:
     - `🔧 API_URL configured as: ...`
     - Any CORS errors
     - Network tab: Check if requests are being made

4. **Check environment variables**
   - Make sure `.env.local` exists in root directory
   - Should contain: `NEXT_PUBLIC_API_URL=http://localhost:8000`
   - **Important**: Restart Next.js dev server after changing `.env.local`

5. **Test connection page**
   - Visit: http://localhost:3000/test-connection
   - This shows detailed connection diagnostics

## Common Issues

### Issue: "Cannot connect to backend"
**Solution:**
- Make sure backend is running: `npm run dev:backend`
- Check port 8000 is free: `lsof -ti:8000`
- Kill stuck processes: `npm run kill:port`

### Issue: CORS errors in browser
**Solution:**
- Backend CORS is set to allow all origins (`*`)
- If still seeing CORS errors, check browser console for exact error
- Try accessing backend directly: http://localhost:8000/api/health

### Issue: Environment variable not loading
**Solution:**
- Next.js caches environment variables
- **Must restart Next.js dev server** after changing `.env.local`
- Check `next.config.js` has the env configuration
- Check browser console for the API_URL log message

### Issue: Multiple backend processes
**Solution:**
```bash
npm run kill:port
npm run dev:backend
```

## Manual Test

Test the backend directly:
```bash
# Health check
curl http://localhost:8000/api/health

# Get patients
curl http://localhost:8000/api/patients

# Get notes
curl http://localhost:8000/api/notes
```

If these work but the frontend doesn't, it's a CORS or frontend configuration issue.
