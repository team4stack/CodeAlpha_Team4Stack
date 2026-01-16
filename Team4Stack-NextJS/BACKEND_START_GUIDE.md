# Backend Server Start Guide

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Create `.env` file** (if not exists):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Verify server is running:**
   - Check console for: `🚀 Server is running on port 5000`
   - Visit: `http://localhost:5000/health`
   - Should see: `{"status":"ok","message":"Team4Stack Backend API is running"}`

## Frontend Configuration

Make sure `frontend/.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Error: "Failed to fetch"
- **Cause**: Backend server is not running
- **Solution**: Start backend with `npm run dev` in backend directory

### Error: "CORS policy"
- **Cause**: Frontend URL not in CORS config
- **Solution**: Check `FRONTEND_URL` in backend `.env` matches your frontend URL

### Error: "Missing Supabase environment variables"
- **Cause**: Supabase keys not configured
- **Solution**: Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` to backend `.env`

### Error: "Route not found" (404)
- **Cause**: Route not defined or wrong order
- **Solution**: Check route files in `backend/src/modules/*/routes/`

### Error: "Internal server error" (500)
- **Cause**: Backend code error
- **Solution**: Check backend console logs for detailed error message
