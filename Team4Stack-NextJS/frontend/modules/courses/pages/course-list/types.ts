export interface Course {
  id: number | string;
  title?: string;
  name?: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  intro_video_url?: string;
}

export interface Progress {
  completed: number;
  total: number;
}

export interface CourseWithProgress extends Course {
  name: string;
  progress: Progress;
  canAccess: boolean;
  admissionStatus: 'approved' | 'pending';
}
