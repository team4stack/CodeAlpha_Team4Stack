// Courses API endpoints
import apiClient from './client';

export const coursesApi = {
  // Get all courses
  getAllCourses: async () => {
    return apiClient.get('/courses');
  },

  // Get course by ID
  getCourseById: async (id: number) => {
    return apiClient.get(`/courses/${id}`);
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

  // Get user progress
  getUserProgress: async (userId: string, courseId?: number) => {
    const query = courseId ? `?courseId=${courseId}` : '';
    return apiClient.get(`/courses/progress/${userId}${query}`);
  },

  // Update progress
  updateProgress: async (progress: any) => {
    return apiClient.post('/courses/progress', progress);
  },
};
