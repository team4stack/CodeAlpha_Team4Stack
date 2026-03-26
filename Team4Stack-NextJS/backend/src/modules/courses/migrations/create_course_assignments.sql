-- Course assignment templates created by admin (per lecture/video)
CREATE TABLE IF NOT EXISTS course_assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  required_format TEXT,
  max_file_size_mb INTEGER NOT NULL DEFAULT 10 CHECK (max_file_size_mb >= 1 AND max_file_size_mb <= 100),
  total_marks INTEGER NOT NULL DEFAULT 0 CHECK (total_marks >= 0),
  template_file_url TEXT,
  template_file_name TEXT,
  template_file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_assignments_course_id ON course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_video_id ON course_assignments(video_id);

-- One latest submission per student per assignment (can be replaced by re-submit)
CREATE TABLE IF NOT EXISTS course_assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  student_notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'accepted', 'rejected')),
  awarded_marks INTEGER CHECK (awarded_marks IS NULL OR awarded_marks >= 0),
  admin_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_assignment_submissions_assignment_id
  ON course_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_course_assignment_submissions_user_id
  ON course_assignment_submissions(user_id);
