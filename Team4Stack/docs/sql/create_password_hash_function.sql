-- ============================================
-- CREATE PASSWORD HASHING FUNCTION
-- ============================================
-- This function helps hash passwords for admin users
-- Run this in Supabase SQL Editor

-- Enable pgcrypto extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to hash password
CREATE OR REPLACE FUNCTION hash_admin_password(p_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Hash password using bcrypt
    RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

-- Create function to add admin with hashed password
CREATE OR REPLACE FUNCTION add_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_role TEXT DEFAULT 'admin'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_password_hash TEXT;
    v_admin_id UUID;
BEGIN
    -- Hash the password
    v_password_hash := crypt(p_password, gen_salt('bf'));
    
    -- Insert admin user
    INSERT INTO admin_users (email, password_hash, role)
    VALUES (LOWER(TRIM(p_email)), v_password_hash, p_role)
    RETURNING id INTO v_admin_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Admin user created successfully',
        'id', v_admin_id,
        'email', LOWER(TRIM(p_email))
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email already exists'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Example usage:
-- SELECT add_admin_user('newadmin@example.com', 'password123', 'landing_admin');

