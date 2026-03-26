export type Quiz = {
  id: number | string;
  video_id: number;
  title: string;
  description?: string;
  total_marks: number;
  passing_percentage: number;
  time_limit_minutes: number;
  questions?: QuizQuestion[];
};

export type QuizQuestion = {
  id: number | string;
  question_text: string;
  order_index: number;
  marks: number;
  options?: QuizOption[];
};

export type QuizOption = {
  id: number | string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
};

export type QuizAttempt = {
  id: number | string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds?: number;
};
