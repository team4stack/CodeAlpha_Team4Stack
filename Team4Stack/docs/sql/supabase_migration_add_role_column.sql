-- Add role column to admin_users table
-- This migration adds a role column to support role-based access control
-- Safe to run multiple times - handles existing constraints

-- Step 1: Add the role column with a default value (safe to run multiple times)
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';

-- Step 2: Drop existing constraint if it exists, then add it again
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'admin_users_role_check' 
        AND conrelid = 'public.admin_users'::regclass
    ) THEN
        ALTER TABLE public.admin_users DROP CONSTRAINT admin_users_role_check;
    END IF;
    
    -- Add the constraint
    ALTER TABLE public.admin_users 
    ADD CONSTRAINT admin_users_role_check 
    CHECK (role IN ('super_admin', 'landing_admin', 'stackstore_admin', 'team_admin', 'courses_admin', 'admin'));
END $$;

-- Step 3: Create an index on role column for faster queries (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_admin_users_role 
ON public.admin_users USING btree (role);

-- Step 4: Update existing records to have 'admin' role if they don't have one
UPDATE public.admin_users 
SET role = 'admin' 
WHERE role IS NULL;

-- Verification query (run this to check the table structure)
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'admin_users' AND table_schema = 'public';

