-- ============================================
-- Team4Stack - Final Database Update Query
-- ============================================
-- Run this query to add ALL missing columns based on your codebase
-- Safe to run multiple times - only adds missing columns
-- ============================================

-- ============================================
-- ADMISSION_FORM - Add missing columns
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admission_form' AND column_name = 'rejection_message') THEN
    ALTER TABLE admission_form ADD COLUMN rejection_message TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admission_form' AND column_name = 'approved') THEN
    ALTER TABLE admission_form ADD COLUMN approved BOOLEAN;
  END IF;
END $$;

-- ============================================
-- USERS - Add missing columns
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_blocked') THEN
    ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE users ADD COLUMN name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- ============================================
-- COURSES - Add missing columns
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'duration') THEN
    ALTER TABLE courses ADD COLUMN duration TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'price') THEN
    ALTER TABLE courses ADD COLUMN price TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'note') THEN
    ALTER TABLE courses ADD COLUMN note TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'features') THEN
    ALTER TABLE courses ADD COLUMN features JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'order_index') THEN
    ALTER TABLE courses ADD COLUMN order_index INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'active') THEN
    ALTER TABLE courses ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- REVIEWS - Add status column if missing
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'status') THEN
    ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- ============================================
-- CREATE INDEXES (if not exist)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admission_form_email ON admission_form(email);
CREATE INDEX IF NOT EXISTS idx_admission_form_approved ON admission_form(approved);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_progress_records_user_id ON progress_records(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_records_course_id ON progress_records(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- ============================================
-- VERIFICATION: Check what was added
-- ============================================
-- Run this after the update to verify:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('admission_form', 'users', 'courses', 'reviews')
-- ORDER BY table_name, ordinal_position;
