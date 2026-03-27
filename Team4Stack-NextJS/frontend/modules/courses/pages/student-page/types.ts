export interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
}

export interface Progress {
  completed: number;
  total: number;
}

export interface StudentCourse extends Course {
  progress: Progress;
  canAccess: boolean;
  admissionStatus: 'approved' | 'pending';
}

export interface StudentStats {
  totalCourses: number;
  averageProgress: number;
  totalCompleted: number;
  totalItems: number;
  overallPercentage: number;
}
