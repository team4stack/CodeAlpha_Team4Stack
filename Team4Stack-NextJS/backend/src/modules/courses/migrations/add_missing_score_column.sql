-- Quick fix: Add missing 'score' column to quiz_attempts table
-- Run this in Supabase SQL Editor if score column is missing

DO $$ 
BEGIN
  -- Add score column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'score'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN score INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added score column to quiz_attempts';
  ELSE
    RAISE NOTICE 'score column already exists in quiz_attempts';
  END IF;
END $$;

-- Refresh Supabase schema cache (this might require Supabase dashboard action)
-- After running this, you may need to:
-- 1. Go to Supabase Dashboard > Settings > API
-- 2. Click "Reload schema" or wait a few seconds for cache to refresh
