# How to Add a Super Admin

## Method 1: Using Supabase Dashboard (Easiest)

1. Go to Supabase Dashboard → **Table Editor** → `admin_users`
2. Click **Insert** → **Insert row**
3. Fill in:
   - **email**: `superadmin@gmail.com` (or your email)
   - **password_hash**: (You need to hash the password - see below)
   - **role**: `super_admin`
4. Click **Save**

## Method 2: Using SQL Query

### Step 1: Hash Your Password

You need to hash your password first. You can:

**Option A: Use your application's password hashing**
- Check how passwords are hashed in your `verify_admin_password` RPC function
- Use the same hashing method

**Option B: Use Supabase RPC (if available)**
```sql
-- If you have a hash_password function
SELECT hash_password('your_password_here');
```

**Option C: Use bcrypt (if pgcrypto extension is enabled)**
```sql
-- Enable pgcrypto extension first (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash password
SELECT crypt('password123', gen_salt('bf'));
```

### Step 2: Insert Super Admin

```sql
-- Replace 'hashed_password_here' with the actual hash from Step 1
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'superadmin@gmail.com',
    'hashed_password_here',
    'super_admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'super_admin',
    updated_at = NOW();
```

## Method 3: Update Existing Admin to Super Admin

If an admin already exists and you just want to change their role:

```sql
UPDATE public.admin_users 
SET role = 'super_admin', 
    updated_at = NOW()
WHERE email = 'existing-admin@example.com';
```

## Method 4: Using Application Code (Recommended)

If you have access to your application code, you can create a script to add super admin:

1. Use the same password hashing method as your `verify_admin_password` RPC function
2. Insert into database with role `'super_admin'`

## Verify Super Admin

After adding, verify with:

```sql
SELECT email, role, created_at 
FROM public.admin_users 
WHERE role = 'super_admin';
```

## Important Notes

⚠️ **Password Hashing**: Make sure to use the same hashing method that your `verify_admin_password` RPC function uses. Otherwise, login won't work.

⚠️ **Email Uniqueness**: The email must be unique. If you try to insert a duplicate email, it will update the existing record (due to `ON CONFLICT`).

⚠️ **Environment Variable**: Make sure the email is also added to your environment variable whitelist (`VITE_ALLOWED_ADMIN_EMAILS`) for the login to work.

## Example: Complete Flow

1. **Hash password** (using your app's method or bcrypt)
2. **Insert into database**:
   ```sql
   INSERT INTO public.admin_users (email, password_hash, role)
   VALUES ('superadmin@gmail.com', 'hashed_password', 'super_admin')
   ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
   ```
3. **Add to environment variable**: Add email to `VITE_ALLOWED_ADMIN_EMAILS`
4. **Test login**: Go to `/supadmin/login` and login with the credentials

