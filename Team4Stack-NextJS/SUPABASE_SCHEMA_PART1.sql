-- ============================================
-- Team4Stack Supabase Database Schema - PART 1
-- ============================================
-- Run this SQL in Supabase SQL Editor FIRST
-- This creates core tables: admission_form, users, courses
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

-- Indexes for Part 1
CREATE INDEX IF NOT EXISTS idx_admission_form_email ON admission_form(email);
CREATE INDEX IF NOT EXISTS idx_admission_form_approved ON admission_form(approved);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
