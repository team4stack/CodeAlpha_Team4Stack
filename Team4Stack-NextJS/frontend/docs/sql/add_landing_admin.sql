-- ============================================
-- ADD LANDING ADMIN TO SUPABASE
-- ============================================
-- This query adds landing admin user with landing_admin role
-- Password: password123

-- Step 1: Enable pgcrypto extension (for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create or Replace verify_admin_password function (if not exists)
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
    -- Get user from admin_users table (case-insensitive)
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
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('valid', false, 'error', 'An error occurred during verification');
END;
$$;

-- Step 3: Delete existing landing admin (if exists)
DELETE FROM public.admin_users 
WHERE email = 'landingadmin@gmail.com';

-- Step 4: Insert Landing Admin
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'landingadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'landing_admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'landing_admin',
    password_hash = crypt('password123', gen_salt('bf')),
    updated_at = NOW();

-- Step 5: Verify landing admin was created
SELECT 
    email, 
    role, 
    created_at 
FROM public.admin_users 
WHERE email = 'landingadmin@gmail.com';

-- ============================================
-- LANDING ADMIN CREDENTIALS
-- ============================================
-- Email: landingadmin@gmail.com
-- Password: password123
-- Role: landing_admin
-- Access URL: /adminlandingt4s
