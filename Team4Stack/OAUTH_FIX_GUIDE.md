# Google OAuth Fix Guide - "Unable to exchange external code" Error

## Problem
Error: `Unable to exchange external code` - Ye error tab aata hai jab Supabase Google OAuth code ko exchange nahi kar pa raha.

## Root Cause
Supabase OAuth ke liye specific redirect URI chahiye jo Google Cloud Console aur Supabase dashboard dono mein properly configured hona chahiye.

---

## Step-by-Step Fix

### Step 1: Supabase Dashboard Configuration

1. **Supabase Dashboard** kholo: https://supabase.com/dashboard
2. Apni project select karo
3. **Authentication** → **URL Configuration** par jao
4. **Site URL** set karo:
   - Production: `https://team4stack.com` ya `https://www.team4stack.com`
   - Development: `http://localhost:3000` (agar local testing kar rahe ho)
5. **Redirect URLs** mein ye add karo:
   ```
   https://team4stack.com
   https://www.team4stack.com
   http://localhost:3000 (development ke liye)
   ```

### Step 2: Supabase Google OAuth Provider Setup

1. **Authentication** → **Providers** par jao
2. **Google** provider ko enable karo
3. **Client ID (for OAuth)** - Google Cloud Console se copy karo
4. **Client Secret (for OAuth)** - Google Cloud Console se copy karo
5. **Save** karo

**Important:** Client ID aur Secret Google Cloud Console se exact copy karo, koi space ya extra character nahi hona chahiye.

### Step 3: Google Cloud Console Configuration

1. **Google Cloud Console** kholo: https://console.cloud.google.com
2. Apni project select karo (team4stack)
3. **APIs & Services** → **Credentials** par jao
4. Apna **OAuth 2.0 Client ID** select karo (jo image mein dikhaya gaya hai)

5. **Authorized redirect URIs** mein ye URLs add karo (EXACT format mein):

   ```
   https://ppevavrwnebwofksiyrp.supabase.co/auth/v1/callback
   ```

   **Important Notes:**
   - Ye Supabase ka default callback URL hai
   - `ppevavrwnebwofksiyrp` apne Supabase project reference se replace karo
   - Supabase project reference kahan se milega:
     - Supabase Dashboard → Settings → API
     - Project URL mein: `https://ppevavrwnebwofksiyrp.supabase.co`
     - Is URL ko use karo: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`

6. **Save** karo

### Step 4: Verify Configuration

1. **Google Cloud Console** mein:
   - Client ID aur Secret verify karo
   - Redirect URI exactly match hona chahiye: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

2. **Supabase Dashboard** mein:
   - Google provider enabled hai
   - Client ID aur Secret sahi hai
   - Site URL production URL set hai
   - Redirect URLs mein website URLs add hain

### Step 5: Test

1. Website par jao: https://www.team4stack.com
2. Sign In button click karo
3. Google login try karo
4. Agar abhi bhi error aaye, to:
   - Browser console check karo (F12)
   - Supabase Dashboard → Authentication → Logs check karo
   - Detailed error message wahan milega

---

## Common Issues & Solutions

### Issue 1: "Redirect URI mismatch"
**Solution:** 
- Google Cloud Console mein redirect URI exactly match karo
- Format: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- No trailing slash, no extra characters

### Issue 2: "Invalid client credentials"
**Solution:**
- Supabase mein Client ID aur Secret verify karo
- Google Cloud Console se exact copy karo
- Spaces ya line breaks check karo

### Issue 3: "Site URL not configured"
**Solution:**
- Supabase Dashboard → Authentication → URL Configuration
- Site URL set karo: `https://team4stack.com`
- Redirect URLs mein website URLs add karo

### Issue 4: Localhost par kaam nahi kar raha
**Solution:**
- Supabase Redirect URLs mein add karo: `http://localhost:3000`
- Google Cloud Console mein bhi add karo (agar local testing kar rahe ho)

---

## Important Notes

1. **Supabase Callback URL** Google Cloud Console mein **MUST** add karna hai
   - Format: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
   - Ye Supabase ka internal callback URL hai

2. **Website URLs** Supabase Redirect URLs mein add karein
   - Ye woh URLs hain jahan user redirect hoga after successful login
   - Example: `https://team4stack.com`

3. **Client ID/Secret** dono jagah same hona chahiye:
   - Google Cloud Console
   - Supabase Dashboard

4. **Changes ke baad** kuch time wait karo (1-2 minutes) taake changes propagate ho jayein

---

## Verification Checklist

- [ ] Supabase Site URL set hai: `https://team4stack.com`
- [ ] Supabase Redirect URLs mein website URLs add hain
- [ ] Supabase Google Provider enabled hai
- [ ] Supabase mein Client ID sahi hai
- [ ] Supabase mein Client Secret sahi hai
- [ ] Google Cloud Console mein redirect URI add hai: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- [ ] Google Cloud Console mein Client ID verify kiya
- [ ] Code mein `VITE_SITE_URL` environment variable set hai (Vercel mein)

---

## Still Not Working?

1. **Clear browser cache** aur cookies
2. **Incognito mode** mein test karo
3. **Supabase Logs** check karo: Dashboard → Authentication → Logs
4. **Browser Console** check karo (F12) for JavaScript errors
5. **Network tab** check karo for failed requests

Agar phir bhi issue ho, to Supabase support se contact karo with logs.

