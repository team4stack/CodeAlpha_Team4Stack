export type ProgressRecord = {
  id: string
  user_id: string
  course_id: string
  video_id?: string
  completed: boolean
  score?: number
  created_at: string
  updated_at?: string
}

export type Course = {
  id: string
  name?: string
  title?: string
}

export type User = {
  id: string
  email: string | null
  name: string | null
}

export type StudentEnrolledCourseProgress = {
  courseId: string
  courseName: string
  totalVideos: number
  completedVideos: number
  progressPercentage: number
}

export type StudentProgress = {
  userId: string
  userName: string
  userEmail: string
  rollNumber?: string
  cnic?: string
  enrolledCourses: StudentEnrolledCourseProgress[]
  totalCourses: number
  totalVideosCompleted: number
}

export type StudentListItem = {
  userId: string
  userName: string
  userEmail: string
  rollNumber: string
  cnic?: string
  totalCourses: number
  totalVideosCompleted: number
  overallProgress: number
}

export type ProgressSummary = {
  courseId: string
  courseName: string
  totalStudents: number
  completedStudents: number
  averageScore: number
  totalProgress: number
}

export type ProgressFilter = 'all' | 'high' | 'medium' | 'low'
