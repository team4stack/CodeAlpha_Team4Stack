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

  // Get admission forms
  getAdmissionForms: async (filters?: { email?: string; approved?: boolean; course_name?: string }) => {
    const params = new URLSearchParams();
    if (filters?.email) params.append('email', filters.email);
    if (filters?.approved !== undefined) params.append('approved', String(filters.approved));
    if (filters?.course_name) params.append('course_name', filters.course_name);
    
    const query = params.toString();
    return apiClient.get(`/courses/admissions${query ? `?${query}` : ''}`);
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
    return apiClient.get(`/courses/progress/${userId}${query}`);
  },

  // Update progress
  updateProgress: async (progress: any) => {
    return apiClient.post('/courses/progress', progress);
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

  startQuizAttempt: async (quizId: number, userId: string, videoId: number) => {
    return apiClient.post('/courses/quizzes/attempts/start', {
      quiz_id: quizId,
      user_id: userId,
      video_id: videoId
    });
  },

  submitQuizAttempt: async (attemptId: number, answers: Array<{ question_id: number; selected_option_id: number }>) => {
    return apiClient.post(`/courses/quizzes/attempts/${attemptId}/submit`, { answers });
  },

  getUserQuizAttempts: async (videoId: number, userId: string) => {
    return apiClient.get(`/courses/quizzes/attempts/${videoId}/${userId}`);
  },

  hasUserPassedQuiz: async (videoId: number, userId: string) => {
    return apiClient.get(`/courses/quizzes/check/${videoId}/${userId}`);
  },
};
