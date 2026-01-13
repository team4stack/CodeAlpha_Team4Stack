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
