-- ============================================
-- QUERY TO ADD SUPER ADMIN
-- ============================================
-- Replace 'your-email@example.com' and 'your_password_here' with your values

-- Method 1: Using bcrypt (if pgcrypto extension is enabled)
-- First enable pgcrypto if not already enabled:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Then insert super admin with hashed password:
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'superadmin@gmail.com',  -- Replace with your email
    crypt('password123', gen_salt('bf')),  -- Replace 'password123' with your desired password
    'super_admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'super_admin',
    password_hash = crypt('password123', gen_salt('bf')),  -- Update password hash too
    updated_at = NOW();

-- ============================================
-- Method 2: Update existing admin to super_admin
-- ============================================
-- If admin already exists, just update the role:
UPDATE public.admin_users 
SET role = 'super_admin', 
    updated_at = NOW()
WHERE email = 'existing-admin@example.com';  -- Replace with existing admin email

-- ============================================
-- Method 3: Manual password hash (if you know the hash)
-- ============================================
-- If you already have a password hash from your verify_admin_password function:
-- INSERT INTO public.admin_users (email, password_hash, role)
-- VALUES (
--     'superadmin@gmail.com',
--     'your_existing_password_hash_here',
--     'super_admin'
-- )
-- ON CONFLICT (email) 
-- DO UPDATE SET 
--     role = 'super_admin',
--     updated_at = NOW();

-- ============================================
-- VERIFY SUPER ADMIN WAS ADDED
-- ============================================
-- Run this to check:
SELECT email, role, created_at, updated_at 
FROM public.admin_users 
WHERE role = 'super_admin';

