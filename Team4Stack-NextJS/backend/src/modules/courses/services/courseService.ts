import { supabaseAdmin } from '../../../config/supabase';
import { Course, Video, AdmissionForm, ProgressRecord } from '../types';

export class CourseService {
  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
      .order('id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get course by ID
  async getCourseById(id: number): Promise<Course | null> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create course
  async createCourse(course: Partial<Course>): Promise<Course> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update course
  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ ...course, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete course
  async deleteCourse(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get videos for a course
  async getCourseVideos(courseId: number): Promise<Video[]> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create video
  async createVideo(video: Partial<Video>): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update video
  async updateVideo(id: number, video: Partial<Video>): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({ ...video, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete video
  async deleteVideo(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get admission forms
  async getAdmissionForms(filters?: {
    email?: string;
    approved?: boolean;
    course_name?: string;
  }): Promise<AdmissionForm[]> {
    let query = supabaseAdmin.from('admission_form').select('*');

    if (filters?.email) {
      query = query.eq('email', filters.email.toLowerCase().trim());
    }
    if (filters?.approved !== undefined) {
      query = query.eq('approved', filters.approved);
    }
    if (filters?.course_name) {
      query = query.eq('course_name', filters.course_name);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create admission form
  async createAdmissionForm(form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const { data, error } = await supabaseAdmin
      .from('admission_form')
      .insert(form)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update admission form
  async updateAdmissionForm(id: number, form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const { data, error } = await supabaseAdmin
      .from('admission_form')
      .update(form)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user progress
  async getUserProgress(userId: string, courseId?: number): Promise<ProgressRecord[]> {
    let query = supabaseAdmin
      .from('progress_records')
      .select('*')
      .eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Update progress
  async updateProgress(progress: Partial<ProgressRecord>): Promise<ProgressRecord> {
    const { data, error } = await supabaseAdmin
      .from('progress_records')
      .upsert(progress, { onConflict: 'user_id,course_id,video_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default new CourseService();
