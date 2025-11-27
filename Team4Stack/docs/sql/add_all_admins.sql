-- ============================================
-- ADD ALL ADMINS TO SUPABASE
-- ============================================
-- This query adds all admin users with their respective roles
-- All admins have password: password123

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

-- Step 3: Delete existing admins (to start fresh)
DELETE FROM public.admin_users 
WHERE email IN (
    'superadmin@gmail.com',
    'stackstoreadmin@gmail.com',
    'teamadmin@gmail.com',
    'courseadmin@gmail.com'
);

-- Step 4: Insert all admins with their roles
-- Password for all: password123

-- Super Admin
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'superadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'super_admin'
);

-- StackStore Admin
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'stackstoreadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'stackstore_admin'
);

-- Team Admin
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'teamadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'team_admin'
);

-- Courses Admin
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
    'courseadmin@gmail.com',
    crypt('password123', gen_salt('bf')),
    'courses_admin'
);

-- Step 5: Verify all admins were created
SELECT 
    email, 
    role, 
    created_at 
FROM public.admin_users 
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'stackstore_admin' THEN 2
        WHEN 'team_admin' THEN 3
        WHEN 'courses_admin' THEN 4
        ELSE 5
    END,
    email;

-- ============================================
-- ADMIN CREDENTIALS SUMMARY
-- ============================================
-- Super Admin:
--   Email: superadmin@gmail.com
--   Password: password123
--   Access: /supadmin
--
-- StackStore Admin:
--   Email: stackstoreadmin@gmail.com
--   Password: password123
--   Access: /adminstackt4s
--
-- Team Admin:
--   Email: teamadmin@gmail.com
--   Password: password123
--   Access: /adminteamt4s
--
-- Courses Admin:
--   Email: courseadmin@gmail.com
--   Password: password123
--   Access: /admincourset4s

