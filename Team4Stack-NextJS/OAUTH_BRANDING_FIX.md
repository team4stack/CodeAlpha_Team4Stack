# Google OAuth Consent Screen - Supabase Domain Hide Karne Ka Solution

## Problem
Google OAuth consent screen par `ppevavrwnebwofksiyrp.supabase.co` show ho raha hai instead of `team4stack.com` ya aapka custom domain.

## Solutions

### Solution 1: Supabase Dashboard - Site URL Update (Recommended First Step)

1. **Supabase Dashboard** mein jao:
   - https://supabase.com/dashboard
   - Apna project select karo

2. **Authentication → URL Configuration**:
   - **Site URL** update karo: `https://team4stack.com` (ya aapka production domain)
   - **Redirect URLs** mein add karo:
     - `https://team4stack.com/**` (production)
     - `http://localhost:3000/**` (development)

3. **Save** karo

**Note:** Yeh step important hai kyunki Supabase is URL ko OAuth redirects mein use karta hai.

---

### Solution 2: Google Cloud Console - OAuth App Branding (Required)

1. **Google Cloud Console** mein jao:
   - https://console.cloud.google.com
   - Apna project select karo

2. **APIs & Services → OAuth consent screen**:
   - **User Type** select karo (Internal ya External)
   - **App name** enter karo: `Team4Stack` (ya aapka app name)
   - **User support email** select karo
   - **App logo** upload karo (optional but recommended)
   - **App domain**:
     - **Application home page**: `https://team4stack.com`
     - **Privacy policy link**: `https://team4stack.com/privacy`
     - **Terms of service link**: `https://team4stack.com/terms`
   - **Authorized domains**:
     - Add karo: `team4stack.com` (without https://)
     - Add karo: `supabase.co` (Supabase domain - required for OAuth to work)

3. **Scopes** section:
   - Ensure these scopes are added:
     - `openid`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`

4. **Test users** (agar External app hai):
   - Test users add karo for development

5. **Save and Continue** → **Back to Dashboard**

**Important:** 
- Agar app **External** hai, to Google verification ke liye submit karna hoga
- Verification ke baad hi app name properly show hoga
- Verification process 1-2 weeks le sakta hai

---

### Solution 3: Supabase Custom Domain (Best Solution - May Require Paid Plan)

Agar Supabase Pro plan hai, to custom domain setup kar sakte ho:

1. **Supabase Dashboard → Settings → Custom Domain**
2. Custom domain add karo: `auth.team4stack.com` (ya koi subdomain)
3. DNS records configure karo
4. Domain verify karo

**Benefits:**
- OAuth consent screen par custom domain show hoga
- Better branding
- Professional look

---

### Solution 4: Code Level - Redirect URI Update (If Custom Domain Available)

Agar custom domain setup hai, to backend code mein update karo:

```typescript
// backend/src/shared/modules/auth/services/authService.ts
async initiateOAuth(provider: 'google' | 'github', redirectTo: string) {
  // Use custom domain if available
  const customDomain = process.env.SUPABASE_CUSTOM_DOMAIN; // e.g., auth.team4stack.com
  const redirectUri = customDomain 
    ? `https://${customDomain}/auth/v1/callback`
    : redirectTo;
    
  // ... rest of code
}
```

---

## Quick Fix Steps (Do Immediately)

1. ✅ **Supabase Dashboard**:
   - Authentication → URL Configuration
   - Site URL: `https://team4stack.com` (ya aapka domain)
   - Save

2. ✅ **Google Cloud Console**:
   - OAuth consent screen → App name: `Team4Stack`
   - Authorized domains: `team4stack.com` + `supabase.co`
   - Save

3. ✅ **Test**:
   - Google button click karo
   - Check karo ki app name properly show ho raha hai

---

## Important Notes

- **Domain completely hide nahi ho sakta** kyunki OAuth flow mein Supabase redirect URI required hai
- **App name** Google Console mein set karne se better branding milega
- **Verification** ke baad hi full branding show hogi
- **Custom domain** best solution hai but paid plan chahiye

---

## Current Implementation Status

✅ Backend OAuth endpoint already implemented
✅ Frontend backend ke through OAuth call kar raha hai
✅ Security concerns addressed

**Next Steps:**
1. Supabase Dashboard settings update karo
2. Google Console branding setup karo
3. Test karo
