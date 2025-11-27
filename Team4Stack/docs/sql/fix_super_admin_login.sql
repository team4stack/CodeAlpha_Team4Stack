-- ============================================
-- COMPLETE FIX FOR SUPER ADMIN LOGIN
-- ============================================

-- Step 1: Enable pgcrypto extension (for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create or Replace verify_admin_password function
-- This function verifies passwords using bcrypt
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
    -- crypt() function compares plain password with stored hash
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

-- Step 3: Delete existing superadmin if exists (to start fresh)
DELETE FROM public.admin_users WHERE email = 'superadmin@gmail.com';

-- Step 4: Insert Super Admin with bcrypt hashed password
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'superadmin@gmail.com',
    crypt('password123', gen_salt('bf')),  -- Password: password123
    'super_admin'
);

-- Step 5: Verify the admin was created
SELECT 
    email, 
    role, 
    LEFT(password_hash, 30) as hash_preview,
    created_at 
FROM public.admin_users 
WHERE email = 'superadmin@gmail.com';

-- ============================================
-- IMPORTANT: After running this query
-- ============================================
-- 1. Add to .env file:
--    VITE_ALLOWED_ADMIN_EMAILS=superadmin@gmail.com
--
-- 2. Restart your dev server
--
-- 3. Try login at: http://localhost:3000/supadmin/login
--    Email: superadmin@gmail.com
--    Password: password123

