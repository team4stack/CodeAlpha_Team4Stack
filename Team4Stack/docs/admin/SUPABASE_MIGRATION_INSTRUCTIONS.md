# Supabase Migration: Add Role Column to admin_users Table

## Steps to Add Role Column

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL query:

```sql
-- Add role column to admin_users table
-- Safe to run multiple times - handles existing constraints

-- Step 1: Add the role column with a default value
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

-- Step 3: Create an index on role column for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_role 
ON public.admin_users USING btree (role);

-- Step 4: Update existing records to have 'admin' role if they don't have one
UPDATE public.admin_users 
SET role = 'admin' 
WHERE role IS NULL;
```

4. Click **Run** to execute the query

### Option 2: Using SQL File

1. Open the file: `supabase_migration_add_role_column.sql`
2. Copy all the SQL commands
3. Paste them in Supabase SQL Editor
4. Run the query

## Valid Role Values

The following roles are supported:
- `super_admin` - Full system access
- `landing_admin` - Landing page admin access
- `stackstore_admin` - StackStore admin access
- `team_admin` - Team admin access
- `courses_admin` - Courses admin access
- `admin` - Default admin (legacy, redirects to landing admin)

## After Migration

1. **Update existing admins:**
   ```sql
   -- Set a specific user as super admin
   UPDATE public.admin_users 
   SET role = 'super_admin' 
   WHERE email = 'your-email@example.com';
   ```

2. **Verify the migration:**
   ```sql
   SELECT email, role, created_at 
   FROM public.admin_users 
   ORDER BY created_at DESC;
   ```

## Notes

- All existing admins will automatically get `'admin'` role (default)
- You can update any admin's role using the UPDATE query above
- The role column is nullable by default, but you can make it NOT NULL if needed

