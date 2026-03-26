-- Certificate applications per student per course
CREATE TABLE IF NOT EXISTS course_certificate_applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cnic TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  admin_notes TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_cert_apps_status ON course_certificate_applications(status);
CREATE INDEX IF NOT EXISTS idx_course_cert_apps_course_id ON course_certificate_applications(course_id);
CREATE INDEX IF NOT EXISTS idx_course_cert_apps_user_id ON course_certificate_applications(user_id);
