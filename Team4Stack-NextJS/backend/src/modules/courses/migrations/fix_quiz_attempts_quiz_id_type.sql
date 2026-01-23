-- Fix quiz_attempts.quiz_id type to match quizzes.id type (UUID or INTEGER)
DO $$ 
DECLARE
  quiz_id_type TEXT;
  current_quiz_id_type TEXT;
  expected_type TEXT;
BEGIN
  -- Get quizzes.id type
  SELECT data_type INTO quiz_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'id';
  
  -- Get current quiz_attempts.quiz_id type
  SELECT data_type INTO current_quiz_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'quiz_id';
  
  -- Determine expected type
  expected_type := CASE WHEN quiz_id_type = 'uuid' THEN 'uuid' ELSE 'integer' END;
  
  RAISE NOTICE 'quizzes.id type: %, quiz_attempts.quiz_id type: %, expected: %', 
    quiz_id_type, current_quiz_id_type, expected_type;
  
  -- If types don't match, alter the column
  IF current_quiz_id_type != expected_type THEN
    RAISE NOTICE 'Fixing quiz_attempts.quiz_id type from % to %', current_quiz_id_type, expected_type;
    
    -- Drop foreign key constraint first
    ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_quiz_id_fkey;
    
    -- Alter column type
    IF expected_type = 'uuid' THEN
      ALTER TABLE quiz_attempts ALTER COLUMN quiz_id TYPE UUID USING quiz_id::TEXT::UUID;
    ELSE
      ALTER TABLE quiz_attempts ALTER COLUMN quiz_id TYPE INTEGER USING quiz_id::INTEGER;
    END IF;
    
    -- Recreate foreign key constraint
    ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_quiz_id_fkey 
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Successfully fixed quiz_attempts.quiz_id type';
  ELSE
    RAISE NOTICE 'quiz_attempts.quiz_id type is already correct';
  END IF;
END $$;
