# Troubleshooting: Super Admin Login Issues

## Error: "Invalid email or password"

### Step 1: Check Environment Variable

The email **MUST** be in your environment variable `VITE_ALLOWED_ADMIN_EMAILS`.

**Check your `.env` file:**
```env
VITE_ALLOWED_ADMIN_EMAILS=superadmin@gmail.com,other-admin@example.com
```

**Important:**
- Email must be lowercase: `superadmin@gmail.com` (not `SuperAdmin@gmail.com`)
- Multiple emails separated by commas
- Restart your dev server after changing `.env`

### Step 2: Verify Admin Exists in Supabase

Run this query in Supabase SQL Editor:

```sql
SELECT email, role, created_at 
FROM public.admin_users 
WHERE email = 'superadmin@gmail.com';
```

**If no results:**
- Admin doesn't exist in database
- Run the `add_super_admin.sql` query again

### Step 3: Check Password Hash Method

The `verify_admin_password` RPC function might use a different hashing method than bcrypt.

**Option A: Check your verify_admin_password function**

Run this in Supabase SQL Editor to see the function:

```sql
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'verify_admin_password';
```

**Option B: Use the same hash method as existing admins**

If you have other working admins, check their password_hash format:

```sql
SELECT email, LEFT(password_hash, 20) as hash_preview 
FROM public.admin_users 
LIMIT 5;
```

### Step 4: Create verify_admin_password Function (if missing)

If the function doesn't exist, create it:

```sql
-- Create verify_admin_password function using bcrypt
CREATE OR REPLACE FUNCTION verify_admin_password(
    p_email TEXT,
    p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_valid BOOLEAN;
BEGIN
    -- Get user from admin_users table
    SELECT * INTO v_user
    FROM admin_users
    WHERE email = LOWER(TRIM(p_email));
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid email or password');
    END IF;
    
    -- Verify password using bcrypt
    v_valid := (v_user.password_hash = crypt(p_password, v_user.password_hash));
    
    IF v_valid THEN
        RETURN json_build_object('valid', true, 'message', 'Password verified');
    ELSE
        RETURN json_build_object('valid', false, 'error', 'Invalid email or password');
    END IF;
END;
$$;
```

**Make sure pgcrypto extension is enabled:**
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Step 5: Re-add Super Admin with Correct Hash

After verifying the hash method, re-add the super admin:

```sql
-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Delete old entry (if exists)
DELETE FROM public.admin_users WHERE email = 'superadmin@gmail.com';

-- Insert with bcrypt hash
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'superadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'super_admin'
);
```

### Step 6: Test Login Flow

1. **Check environment variable:**
   - Open browser console
   - Run: `console.log(import.meta.env.VITE_ALLOWED_ADMIN_EMAILS)`
   - Should show: `"superadmin@gmail.com"` or include your email

2. **Check Supabase query:**
   - Open browser Network tab
   - Try login
   - Check if `admin_users` query returns data

3. **Check RPC call:**
   - In Network tab, look for `verify_admin_password` call
   - Check response for errors

## Quick Fix Checklist

- [ ] Email added to `.env` file: `VITE_ALLOWED_ADMIN_EMAILS=superadmin@gmail.com`
- [ ] Dev server restarted after `.env` change
- [ ] Admin exists in Supabase `admin_users` table
- [ ] Admin has `role = 'super_admin'` in database
- [ ] `verify_admin_password` RPC function exists
- [ ] Password hash matches the function's expected format
- [ ] Email is lowercase in both `.env` and database

## Alternative: Temporary Bypass for Testing

If you need to test quickly, you can temporarily comment out the environment check in `LoginPage.tsx`:

```typescript
// Temporarily comment this for testing
// if (!isEmailAllowedForAdmin(loginEmail)) {
//   setError('Invalid email or password.')
//   setLoading(false)
//   return
// }
```

**⚠️ Remember to uncomment it after testing!**

