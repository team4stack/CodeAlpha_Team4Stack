// Courses API endpoints
import apiClient from './client';
import { cachedPublicGet } from '@/lib/performance/functionalExperienceCache';

export const coursesApi = {
  // Get all courses
  getAllCourses: async () => {
    return cachedPublicGet('courses:all', 2 * 60 * 1000, () => apiClient.get('/courses'));
  },

  // Get course by ID
  getCourseById: async (id: number) => {
    return cachedPublicGet(`courses:byId:${id}`, 90 * 1000, () => apiClient.get(`/courses/${id}`));
  },

  // Public: upload image to Cloudinary via backend proxy
  uploadImageToCloudinary: async (fileDataUrl: string, folder?: string) => {
    return apiClient.post('/public/uploads/cloudinary', { fileDataUrl, folder });
  },

  // Public: upload assignment file (pdf/doc/docx) to Cloudinary via backend proxy
  uploadAssignmentFileToCloudinary: async (fileDataUrl: string, fileName: string, folder?: string) => {
    return apiClient.post('/public/uploads/cloudinary-file', { fileDataUrl, fileName, folder });
  },

  // Create course
  createCourse: async (course: any) => {
    return apiClient.post('/courses', course);
  },

  // Update course
  updateCourse: async (id: number, course: any) => {
    return apiClient.put(`/courses/${id}`, course);
  },

  // Delete course
  deleteCourse: async (id: number) => {
    return apiClient.delete(`/courses/${id}`);
  },

  // Get course videos
  getCourseVideos: async (courseId: number) => {
    return apiClient.get(`/courses/${courseId}/videos`);
  },

  // Create video
  createVideo: async (video: any) => {
    return apiClient.post('/courses/videos', video);
  },

  // Update video
  updateVideo: async (id: number, video: any) => {
    return apiClient.put(`/courses/videos/${id}`, video);
  },

  // Delete video
  deleteVideo: async (id: number) => {
    return apiClient.delete(`/courses/videos/${id}`);
  },

  // Assignments
  getAssignmentsByCourse: async (courseId: number) => {
    // Student view must never read admin_session data (prevents mixed submissions).
    return apiClient.get(`/courses/assignments/course/${courseId}`, { authMode: 'user-only' });
  },

  getAssignmentsByVideo: async (videoId: number) => {
    // Student view must never read admin_session data (prevents mixed submissions).
    return apiClient.get(`/courses/assignments/video/${videoId}`, { authMode: 'user-only' });
  },
  getAssignmentsByVideoAdmin: async (videoId: number) => {
    return apiClient.get(`/courses/assignments/video/${videoId}`);
  },

  createAssignment: async (payload: any) => {
    return apiClient.post('/courses/assignments', payload);
  },

  updateAssignment: async (id: number, payload: any) => {
    return apiClient.put(`/courses/assignments/${id}`, payload);
  },

  deleteAssignment: async (id: number) => {
    return apiClient.delete(`/courses/assignments/${id}`);
  },

  submitAssignment: async (assignmentId: number, payload: any) => {
    return apiClient.post(`/courses/assignments/${assignmentId}/submit`, payload, { authMode: 'user-only' });
  },

  getAssignmentSubmissionsByVideo: async (videoId: number) => {
    return apiClient.get(`/courses/assignments/video/${videoId}/submissions`);
  },

  getAssignmentSubmissions: async (filters?: { userId?: string; courseId?: number; videoId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (typeof filters?.courseId === 'number') params.append('courseId', String(filters.courseId));
    if (typeof filters?.videoId === 'number') params.append('videoId', String(filters.videoId));
    const query = params.toString();
    return apiClient.get(`/courses/assignments/submissions${query ? `?${query}` : ''}`);
  },

  updateAssignmentSubmission: async (id: number, patch: any) => {
    return apiClient.patch(`/courses/assignments/submissions/${id}`, patch, { authMode: 'user-only' });
  },

  // Get admission forms
  getAdmissionForms: async (filters?: { email?: string; approved?: boolean; course_name?: string }) => {
    const params = new URLSearchParams();
    if (filters?.email) params.append('email', filters.email);
    if (filters?.approved !== undefined) params.append('approved', String(filters.approved));
    if (filters?.course_name) params.append('course_name', filters.course_name);

    const query = params.toString();
    // Student self-lookup by email must use Supabase JWT, not admin_session (otherwise 403 for non–courses-admin admins).
    const studentSelfQuery = Boolean(filters?.email && String(filters.email).trim());
    return apiClient.get(`/courses/admissions${query ? `?${query}` : ''}`, {
      ...(studentSelfQuery ? { authMode: 'user-only' as const } : {}),
    });
  },

  // Create admission form
  createAdmissionForm: async (form: any) => {
    return apiClient.post('/courses/admissions', form);
  },

  // Update admission form
  updateAdmissionForm: async (id: number, form: any) => {
    return apiClient.put(`/courses/admissions/${id}`, form);
  },

  // Delete admission form
  deleteAdmissionForm: async (id: number) => {
    return apiClient.delete(`/courses/admissions/${id}`);
  },

  // Get all progress records (for admin)
  getAllProgress: async (filters?: { courseId?: string; userId?: string; completed?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    
    const query = params.toString();
    return apiClient.get(`/courses/progress${query ? `?${query}` : ''}`);
  },

  // Get user progress
  getUserProgress: async (userId: string, courseId?: number) => {
    const query = courseId ? `?courseId=${courseId}` : '';
    // Use user-only so `admin_session` in sessionStorage can't override student auth.
    return apiClient.get(`/courses/progress/${userId}${query}`, { authMode: 'user-only' });
  },

  // Get single-course report for one student
  getStudentCourseReport: async (courseId: number | string, userId: string) => {
    return apiClient.get(`/courses/reports/${courseId}/${userId}`);
  },

  applyForCertificate: async (payload: {
    course_id: number | string;
    full_name: string;
    cnic: string;
    email: string;
    phone_number: string;
    roll_number: string;
  }) => {
    return apiClient.post('/courses/certificates/apply', payload);
  },

  getCertificateApplications: async (filters?: {
    userId?: string;
    courseId?: number | string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.courseId !== undefined) params.append('courseId', String(filters.courseId));
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return apiClient.get(`/courses/certificates${query ? `?${query}` : ''}`);
  },

  updateCertificateApplication: async (
    id: number | string,
    patch: { status?: string; admin_notes?: string | null; certificate_url?: string | null }
  ) => {
    return apiClient.patch(`/courses/certificates/${id}`, patch);
  },

  // Update progress
  updateProgress: async (progress: any) => {
    // Student progress updates must be authenticated as user.
    return apiClient.post('/courses/progress', progress, { authMode: 'user-only' });
  },

  // Quiz APIs
  getQuizByVideoId: async (videoId: number) => {
    return apiClient.get(`/courses/quizzes/video/${videoId}`);
  },

  createQuiz: async (quiz: any) => {
    return apiClient.post('/courses/quizzes', quiz);
  },

  updateQuiz: async (id: number, quiz: any) => {
    return apiClient.put(`/courses/quizzes/${id}`, quiz);
  },

  deleteQuiz: async (id: number) => {
    return apiClient.delete(`/courses/quizzes/${id}`);
  },

  createQuestion: async (question: any) => {
    return apiClient.post('/courses/quizzes/questions', question);
  },

  updateQuestion: async (id: number, question: any) => {
    return apiClient.put(`/courses/quizzes/questions/${id}`, question);
  },

  deleteQuestion: async (id: number) => {
    return apiClient.delete(`/courses/quizzes/questions/${id}`);
  },

  createOption: async (option: any) => {
    return apiClient.post('/courses/quizzes/options', option);
  },

  updateOption: async (id: number, option: any) => {
    return apiClient.put(`/courses/quizzes/options/${id}`, option);
  },

  deleteOption: async (id: number) => {
    return apiClient.delete(`/courses/quizzes/options/${id}`);
  },

  startQuizAttempt: async (quizId: number | string, userId: string, videoId: number) => {
    return apiClient.post('/courses/quizzes/attempts/start', {
      quiz_id: quizId,
      user_id: userId,
      video_id: videoId
    }, { authMode: 'user-only' });
  },

  submitQuizAttempt: async (
    attemptId: number | string,
    answers: Array<{ question_id: number | string; selected_option_id: number | string }>
  ) => {
    return apiClient.post(`/courses/quizzes/attempts/${attemptId}/submit`, { answers }, { authMode: 'user-only' });
  },

  getUserQuizAttempts: async (videoId: number, userId: string) => {
    return apiClient.get(`/courses/quizzes/attempts/${videoId}/${userId}`, { authMode: 'user-only' });
  },

  hasUserPassedQuiz: async (videoId: number, userId: string) => {
    return apiClient.get(`/courses/quizzes/check/${videoId}/${userId}`, { authMode: 'user-only' });
  },

  getStudentNotifications: async (email: string) => {
    const q = encodeURIComponent(email.trim());
    return apiClient.get(`/courses/student-notifications?email=${q}`);
  },

  markStudentNotificationRead: async (id: number, email: string) => {
    return apiClient.patch(`/courses/student-notifications/${id}/read`, { email: email.trim() });
  },

  /** Courses admin: broadcast to approved students or explicit email list. */
  sendStudentNotifications: async (payload: {
    adminEmail: string;
    title: string;
    body?: string;
    audience: 'all_approved' | 'emails';
    emails?: string[];
  }) => {
    return apiClient.post('/courses/student-notifications', payload);
  },
};
