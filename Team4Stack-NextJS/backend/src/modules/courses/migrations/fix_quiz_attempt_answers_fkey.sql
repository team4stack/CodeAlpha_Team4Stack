-- Fix Foreign Key Constraint for quiz_attempt_answers
-- This script fixes the type mismatch between quiz_attempts.id and quiz_attempt_answers.attempt_id
-- Run this if you get the foreign key constraint error

DO $$ 
DECLARE
  attempt_id_type TEXT;
  answer_attempt_id_type TEXT;
  constraint_exists BOOLEAN;
BEGIN
  -- Check if quiz_attempt_answers table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_attempt_answers') THEN
    
    -- Get quiz_attempts.id type
    SELECT data_type INTO attempt_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'quiz_attempts' 
      AND column_name = 'id';
    
    -- Get quiz_attempt_answers.attempt_id type
    SELECT data_type INTO answer_attempt_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'quiz_attempt_answers' 
      AND column_name = 'attempt_id';
    
    RAISE NOTICE 'quiz_attempts.id type: %', attempt_id_type;
    RAISE NOTICE 'quiz_attempt_answers.attempt_id type: %', answer_attempt_id_type;
    
    -- Check if foreign key constraint exists
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'quiz_attempt_answers_attempt_id_fkey'
    ) INTO constraint_exists;
    
    -- If types don't match, fix it
    IF attempt_id_type != answer_attempt_id_type THEN
      RAISE NOTICE 'Types mismatch detected. Fixing...';
      
      -- Drop existing foreign key constraint if exists
      IF constraint_exists THEN
        ALTER TABLE quiz_attempt_answers 
        DROP CONSTRAINT quiz_attempt_answers_attempt_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint';
      END IF;
      
      -- Alter column type to match quiz_attempts.id
      IF attempt_id_type = 'uuid' THEN
        -- Convert to UUID
        ALTER TABLE quiz_attempt_answers 
        ALTER COLUMN attempt_id TYPE UUID USING attempt_id::text::uuid;
        RAISE NOTICE 'Changed attempt_id to UUID type';
      ELSIF attempt_id_type = 'integer' OR attempt_id_type = 'bigint' THEN
        -- Convert to INTEGER
        ALTER TABLE quiz_attempt_answers 
        ALTER COLUMN attempt_id TYPE INTEGER USING attempt_id::integer;
        RAISE NOTICE 'Changed attempt_id to INTEGER type';
      END IF;
      
      -- Recreate foreign key constraint
      ALTER TABLE quiz_attempt_answers
      ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;
      
      RAISE NOTICE 'Recreated foreign key constraint';
    ELSE
      RAISE NOTICE 'Types already match. No changes needed.';
      
      -- If constraint doesn't exist but types match, create it
      IF NOT constraint_exists THEN
        ALTER TABLE quiz_attempt_answers
        ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created missing foreign key constraint';
      END IF;
    END IF;
  ELSE
    RAISE NOTICE 'quiz_attempt_answers table does not exist. Run create_quiz_tables.sql first.';
  END IF;
END $$;
