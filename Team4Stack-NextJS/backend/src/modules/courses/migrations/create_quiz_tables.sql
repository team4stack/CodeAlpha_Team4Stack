-- Quiz System Tables Migration
-- This script handles existing tables and fixes foreign key constraints
-- Run this SQL in Supabase SQL Editor

-- 1. Create quizzes table (if not exists) and add missing columns
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Quiz',
  description TEXT,
  total_marks INTEGER NOT NULL DEFAULT 10,
  passing_percentage INTEGER NOT NULL DEFAULT 80,
  time_limit_minutes INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(video_id) -- One quiz per video
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add total_marks if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'total_marks'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN total_marks INTEGER NOT NULL DEFAULT 10;
  END IF;
  
  -- Add passing_percentage if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'passing_percentage'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN passing_percentage INTEGER NOT NULL DEFAULT 80;
  END IF;
  
  -- Add time_limit_minutes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'time_limit_minutes'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN time_limit_minutes INTEGER NOT NULL DEFAULT 10;
  END IF;
  
  -- Add description if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN description TEXT;
  END IF;
  
  -- Add updated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 2. Create quiz_questions table (if not exists) and add missing columns
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  marks INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add order_index if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_questions' 
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  -- Add marks if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_questions' 
    AND column_name = 'marks'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN marks INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  -- Add updated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_questions' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 3. Create quiz_options table (if not exists) and add missing columns
CREATE TABLE IF NOT EXISTS quiz_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add order_index if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_options' 
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE quiz_options ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 4. Create quiz_attempts table (if not exists) and add missing columns
-- Note: quiz_id type will be dynamically detected and matched to quizzes.id type
DO $$ 
DECLARE
  quiz_id_type TEXT;
  table_exists BOOLEAN;
  create_sql TEXT;
BEGIN
  -- Check if quiz_attempts table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'quiz_attempts'
  ) INTO table_exists;
  
  -- Get quizzes.id type
  SELECT data_type INTO quiz_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'id';
  
  -- Create table if not exists
  IF NOT table_exists THEN
    -- Build CREATE TABLE statement dynamically based on quizzes.id type
    create_sql := 'CREATE TABLE quiz_attempts (
      id SERIAL PRIMARY KEY,
      quiz_id ' || 
      CASE WHEN quiz_id_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END || 
      ' NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      score INTEGER NOT NULL DEFAULT 0,
      total_marks INTEGER NOT NULL DEFAULT 10,
      percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
      passed BOOLEAN NOT NULL DEFAULT FALSE,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      submitted_at TIMESTAMP WITH TIME ZONE,
      time_taken_seconds INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    EXECUTE create_sql;
  ELSE
    -- Table exists - check and fix quiz_id type if needed
    DECLARE
      current_quiz_id_type TEXT;
      expected_type TEXT;
    BEGIN
      -- Get current quiz_id type
      SELECT data_type INTO current_quiz_id_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'quiz_attempts' 
        AND column_name = 'quiz_id';
      
      -- Determine expected type
      expected_type := CASE WHEN quiz_id_type = 'uuid' THEN 'uuid' ELSE 'integer' END;
      
      -- If types don't match, alter the column
      IF current_quiz_id_type != expected_type THEN
        -- Drop foreign key constraint first
        EXECUTE 'ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_quiz_id_fkey';
        
        -- Alter column type
        EXECUTE 'ALTER TABLE quiz_attempts ALTER COLUMN quiz_id TYPE ' || 
                CASE WHEN expected_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END ||
                ' USING quiz_id::' || 
                CASE WHEN expected_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END;
        
        -- Recreate foreign key constraint
        EXECUTE 'ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_quiz_id_fkey 
                 FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE';
      END IF;
    END;
  END IF;
END $$;

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add score if not exists (CRITICAL - this was missing!)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'score'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN score INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  -- Add total_marks if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'total_marks'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN total_marks INTEGER NOT NULL DEFAULT 10;
  END IF;
  
  -- Add percentage if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'percentage'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN percentage DECIMAL(5,2) NOT NULL DEFAULT 0;
  END IF;
  
  -- Add passed if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'passed'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN passed BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  
  -- Add started_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'started_at'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add submitted_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add time_taken_seconds if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'time_taken_seconds'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN time_taken_seconds INTEGER;
  END IF;
  
  -- Add updated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quiz_attempts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 5. Create quiz_attempt_answers table based on existing table id types
DO $$ 
DECLARE
  attempt_id_type TEXT;
  question_id_type TEXT;
  option_id_type TEXT;
  table_exists BOOLEAN;
  create_sql TEXT;
BEGIN
  -- Check if quiz_attempt_answers table exists
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'quiz_attempt_answers'
  ) INTO table_exists;
  
  -- Get all id types
  SELECT data_type INTO attempt_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'id';
  
  SELECT data_type INTO question_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quiz_questions' 
    AND column_name = 'id';
  
  SELECT data_type INTO option_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'quiz_options' 
    AND column_name = 'id';
  
  -- Create or alter quiz_attempt_answers table
  IF NOT table_exists THEN
    -- Build CREATE TABLE statement dynamically based on types
    create_sql := 'CREATE TABLE quiz_attempt_answers (
      id SERIAL PRIMARY KEY,
      attempt_id ' || 
      CASE WHEN attempt_id_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END || 
      ' NOT NULL,
      question_id ' ||
      CASE WHEN question_id_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END ||
      ' NOT NULL,
      selected_option_id ' ||
      CASE WHEN option_id_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END ||
      ' NOT NULL,
      is_correct BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    EXECUTE create_sql;
    
    -- Add foreign key constraints
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;
    
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE;
    
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_selected_option_id_fkey
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options(id) ON DELETE CASCADE;
  ELSE
    -- Table exists, fix all column types and foreign keys if needed
    -- Drop existing foreign keys
    ALTER TABLE quiz_attempt_answers 
    DROP CONSTRAINT IF EXISTS quiz_attempt_answers_attempt_id_fkey;
    ALTER TABLE quiz_attempt_answers 
    DROP CONSTRAINT IF EXISTS quiz_attempt_answers_question_id_fkey;
    ALTER TABLE quiz_attempt_answers 
    DROP CONSTRAINT IF EXISTS quiz_attempt_answers_selected_option_id_fkey;
    
    -- Fix attempt_id type
    IF attempt_id_type = 'uuid' THEN
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'attempt_id';
        
        IF current_type != 'uuid' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN attempt_id TYPE UUID USING attempt_id::text::uuid;
        END IF;
      END;
    ELSE
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'attempt_id';
        
        IF current_type != 'integer' AND current_type != 'bigint' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN attempt_id TYPE INTEGER USING attempt_id::integer;
        END IF;
      END;
    END IF;
    
    -- Fix question_id type
    IF question_id_type = 'uuid' THEN
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'question_id';
        
        IF current_type != 'uuid' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN question_id TYPE UUID USING question_id::text::uuid;
        END IF;
      END;
    ELSE
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'question_id';
        
        IF current_type != 'integer' AND current_type != 'bigint' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN question_id TYPE INTEGER USING question_id::integer;
        END IF;
      END;
    END IF;
    
    -- Fix selected_option_id type
    IF option_id_type = 'uuid' THEN
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'selected_option_id';
        
        IF current_type != 'uuid' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN selected_option_id TYPE UUID USING selected_option_id::text::uuid;
        END IF;
      END;
    ELSE
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'quiz_attempt_answers' 
          AND column_name = 'selected_option_id';
        
        IF current_type != 'integer' AND current_type != 'bigint' THEN
          ALTER TABLE quiz_attempt_answers 
          ALTER COLUMN selected_option_id TYPE INTEGER USING selected_option_id::integer;
        END IF;
      END;
    END IF;
    
    -- Recreate foreign key constraints with correct types
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_attempt_id_fkey
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE;
    
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE;
    
    ALTER TABLE quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_selected_option_id_fkey
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_video_id ON quizzes(video_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_video_id ON quiz_attempts(video_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt_id ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_question_id ON quiz_attempt_answers(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow all on quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow all on quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Allow all on quiz_options" ON quiz_options;
DROP POLICY IF EXISTS "Allow all on quiz_attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Allow all on quiz_attempt_answers" ON quiz_attempt_answers;

CREATE POLICY "Allow all on quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_questions" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_options" ON quiz_options FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_attempts" ON quiz_attempts FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_attempt_answers" ON quiz_attempt_answers FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
DROP TRIGGER IF EXISTS update_quiz_questions_updated_at ON quiz_questions;
DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON quiz_attempts;

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_attempts_updated_at BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
