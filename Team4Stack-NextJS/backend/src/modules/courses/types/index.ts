export interface Course {
  id: number;
  name?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  level?: string;
  duration?: string;
  price?: string;
  note?: string;
  features?: string[] | any;
  gradient?: string;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Video {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  duration?: number;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdmissionForm {
  id: number;
  name: string;
  father_name: string;
  phone: string;
  email: string;
  address?: string;
  course_name: string;
  course_name_2?: string;
  message?: string;
  gender: string;
  /** ISO date string (YYYY-MM-DD) from application form */
  date_of_birth?: string;
  age: number;
  cnic?: string;
  image_attached?: boolean;
  viewed?: boolean;
  approved?: boolean;
  approved_1?: boolean;
  approved_2?: boolean;
  rejection_message?: string;
  rejection_message_1?: string;
  rejection_message_2?: string;
  roll_number?: string;
  created_at?: string;
}

export interface ProgressRecord {
  id: number;
  user_id: string;
  course_id: number;
  video_id?: number;
  completed: boolean;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentCourseNotification {
  id: number;
  student_email: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
  created_by_email: string | null;
}

export interface Quiz {
  id: number | string;
  video_id: number;
  title: string;
  description?: string;
  total_marks: number;
  passing_percentage: number;
  time_limit_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number | string;
  quiz_id: number | string;
  question_text: string;
  order_index: number;
  marks: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizOption {
  id: number | string;
  question_id: number | string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at?: string;
}

export interface QuizAttempt {
  id: number | string;
  quiz_id: number | string;
  user_id: string;
  video_id: number;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  submitted_at?: string;
  time_taken_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizAttemptAnswer {
  id: number | string;
  attempt_id: number | string;
  question_id: number | string;
  selected_option_id: number | string;
  is_correct: boolean;
  created_at?: string;
}

export interface StudentCourseReportSummary {
  course: {
    id: number;
    title: string;
    description?: string;
    thumbnail_url?: string;
  };
  lectures: {
    total: number;
    completed: number;
    progress_percentage: number;
    total_time_seconds: number;
    watched_time_seconds: number;
  };
  quizzes: {
    total: number;
    passed: number;
    total_marks: number;
    obtained_marks: number;
  };
  assignments: {
    total: number;
    uploaded: number;
    unuploaded: number;
    total_marks: number;
    obtained_marks: number;
  };
  certificate: {
    eligible: boolean;
    application_status: 'not_applied' | 'pending' | 'approved' | 'rejected' | 'sent';
    application_id?: number;
    certificate_url?: string | null;
  };
}

export interface CertificateApplication {
  id: number;
  user_id: string;
  course_id: number;
  full_name: string;
  cnic: string;
  email: string;
  phone_number: string;
  roll_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  admin_notes?: string | null;
  certificate_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseAssignment {
  id: number;
  course_id: number;
  video_id: number;
  title: string;
  instructions?: string | null;
  required_format?: string | null;
  max_file_size_mb: number;
  total_marks: number;
  template_file_url?: string | null;
  template_file_name?: string | null;
  template_file_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseAssignmentSubmission {
  id: number;
  assignment_id: number;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type?: string | null;
  student_notes?: string | null;
  status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  awarded_marks?: number | null;
  admin_feedback?: string | null;
  submitted_at?: string;
  updated_at?: string;
}
