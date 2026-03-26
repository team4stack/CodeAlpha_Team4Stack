export interface Video {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  order_index: number;
  duration?: number;
}

export interface Course {
  id: number;
  name?: string;
  title?: string;
  description?: string;
}

export interface ProgressRecord {
  id: number;
  user_id: string;
  course_id: number;
  video_id: number;
  completed: boolean;
  score?: number;
}

export interface QuizScore {
  score: number;
  total_marks: number;
  percentage: number;
}
