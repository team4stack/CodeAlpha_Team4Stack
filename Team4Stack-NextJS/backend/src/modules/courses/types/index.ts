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
