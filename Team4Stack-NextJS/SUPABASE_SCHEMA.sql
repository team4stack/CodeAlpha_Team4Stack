-- ============================================
-- Team4Stack Supabase Database Schema
-- ============================================
-- Run this SQL in Supabase SQL Editor to create all required tables and columns
-- This script will create missing tables and add missing columns to existing tables
-- ============================================

-- ============================================
-- 1. ADMISSION_FORM TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admission_form (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  course_name TEXT NOT NULL,
  message TEXT,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  image_attached BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT false,
  approved BOOLEAN,
  rejection_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'rejection_message') THEN
    ALTER TABLE admission_form ADD COLUMN rejection_message TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'approved') THEN
    ALTER TABLE admission_form ADD COLUMN approved BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'course_name_2') THEN
    ALTER TABLE admission_form ADD COLUMN course_name_2 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'approved_1') THEN
    ALTER TABLE admission_form ADD COLUMN approved_1 BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'approved_2') THEN
    ALTER TABLE admission_form ADD COLUMN approved_2 BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'rejection_message_1') THEN
    ALTER TABLE admission_form ADD COLUMN rejection_message_1 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_form' AND column_name = 'rejection_message_2') THEN
    ALTER TABLE admission_form ADD COLUMN rejection_message_2 TEXT;
  END IF;
END $$;

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_blocked') THEN
    ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE users ADD COLUMN name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- ============================================
-- 3. COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  level TEXT,
  duration TEXT,
  price TEXT,
  note TEXT,
  features JSONB,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration') THEN
    ALTER TABLE courses ADD COLUMN duration TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'price') THEN
    ALTER TABLE courses ADD COLUMN price TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'note') THEN
    ALTER TABLE courses ADD COLUMN note TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'features') THEN
    ALTER TABLE courses ADD COLUMN features JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'order_index') THEN
    ALTER TABLE courses ADD COLUMN order_index INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'active') THEN
    ALTER TABLE courses ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- 4. VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration INTEGER,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PROGRESS_RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_id BIGINT REFERENCES videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INTEGER, -- Store watched time in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, video_id)
);

-- Add score column if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progress_records' AND column_name = 'score') THEN
    ALTER TABLE progress_records ADD COLUMN score INTEGER;
  END IF;
END $$;

-- ============================================
-- 6. ADMIN_USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. SITE_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'status') THEN
    ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- ============================================
-- 9. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_id TEXT,
  github_url TEXT,
  image_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  emoji TEXT,
  gradient_color TEXT,
  contact TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. TEAM_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role_text TEXT,
  image_url TEXT,
  is_head BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  banner_image_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  primary_tag TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. MENTOR_PROFILE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mentor_profile (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role_text TEXT,
  image_url TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  primary_tag TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. SUPPORT_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS support_requests (
  id BIGSERIAL PRIMARY KEY,
  reason TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'closed')),
  viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. ORDERS TABLE (StackStore)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. PRODUCTS TABLE (StackStore)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category_id UUID,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. DELETED_ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deleted_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  email TEXT,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on tables (optional, adjust as needed)
-- Uncomment these lines if you want to enable RLS
-- ALTER TABLE admission_form ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE progress_records ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your security requirements)
-- Note: CREATE POLICY doesn't support IF NOT EXISTS, so we drop first if they exist
-- Uncomment these if you enable RLS above

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own admission forms" ON admission_form;
DROP POLICY IF EXISTS "Users can view own progress" ON progress_records;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;

-- Create policies (uncomment if RLS is enabled)
-- CREATE POLICY "Users can view own admission forms" ON admission_form
--   FOR SELECT USING (auth.uid()::text = (SELECT id::text FROM users WHERE email = admission_form.email));
--
-- CREATE POLICY "Users can view own progress" ON progress_records
--   FOR SELECT USING (auth.uid()::text = user_id::text);
--
-- CREATE POLICY "Public can view active courses" ON courses
--   FOR SELECT USING (active = true);

-- ============================================
-- END OF SCHEMA
-- ============================================
