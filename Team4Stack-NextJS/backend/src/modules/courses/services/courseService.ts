import { supabaseAdmin } from '../../../config/supabase';
import {
  pickAllowedKeys,
  updateByIdWithTimestampRetry,
  notFoundError
} from '../../../shared/utils/supabaseAdminWrite';
import { Course, Video, AdmissionForm, ProgressRecord } from '../types';

const COURSE_KEYS = [
  'name',
  'title',
  'description',
  'thumbnail_url',
  'image_url',
  'level',
  'duration',
  'price',
  'note',
  'features',
  'gradient',
  'order_index',
  'active'
] as const;

const VIDEO_KEYS = ['course_id', 'title', 'description', 'video_url', 'duration', 'order_index'] as const;

const ADMISSION_KEYS = [
  'name',
  'father_name',
  'phone',
  'email',
  'address',
  'course_name',
  'course_name_2',
  'message',
  'gender',
  'age',
  'cnic',
  'image_attached',
  'viewed',
  'approved',
  'approved_1',
  'approved_2',
  'rejection_message',
  'rejection_message_1',
  'rejection_message_2',
  'roll_number'
] as const;

export class CourseService {
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

  async getCourseById(id: number): Promise<Course | null> {
    const { data, error } = await supabaseAdmin.from('courses').select('*').eq('id', id).maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const insert = pickAllowedKeys(course, COURSE_KEYS);
    const { data, error } = await supabaseAdmin.from('courses').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course> {
    const patch = pickAllowedKeys(course, COURSE_KEYS);
    const row = await updateByIdWithTimestampRetry('courses', id, patch, { notFoundMessage: 'Course not found' });
    return row as unknown as Course;
  }

  async deleteCourse(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);

    if (error) throw error;
  }

  async getCourseVideos(courseId: number): Promise<Video[]> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createVideo(video: Partial<Video>): Promise<Video> {
    const insert = pickAllowedKeys(video, VIDEO_KEYS);
    const { data, error } = await supabaseAdmin.from('videos').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  async updateVideo(id: number, video: Partial<Video>): Promise<Video> {
    const patch = pickAllowedKeys(video, VIDEO_KEYS);
    const row = await updateByIdWithTimestampRetry('videos', id, patch, { notFoundMessage: 'Video not found' });
    return row as unknown as Video;
  }

  async deleteVideo(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('videos').delete().eq('id', id);

    if (error) throw error;
  }

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

  async createAdmissionForm(form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const insert = pickAllowedKeys(form, ADMISSION_KEYS);
    const { data, error } = await supabaseAdmin.from('admission_form').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  async updateAdmissionForm(id: number, form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const patch = pickAllowedKeys(form, ADMISSION_KEYS);
    const row = await updateByIdWithTimestampRetry('admission_form', id, patch, {
      notFoundMessage: 'Admission form not found'
    });
    return row as unknown as AdmissionForm;
  }

  async deleteAdmissionForm(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('admission_form').delete().eq('id', id);

    if (error) throw error;
  }

  async getUserProgress(userId: string, courseId?: number): Promise<ProgressRecord[]> {
    let query = supabaseAdmin.from('progress_records').select('*').eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getAllProgress(filters?: { courseId?: string; userId?: string; completed?: boolean }): Promise<ProgressRecord[]> {
    try {
      let query = supabaseAdmin.from('progress_records').select('*');

      if (filters?.courseId) {
        query = query.eq('course_id', filters.courseId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.completed !== undefined) {
        query = query.eq('completed', filters.completed);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching progress records:', error);
        throw error;
      }
      return data || [];
    } catch (error: any) {
      console.error('getAllProgress error:', error);
      throw error;
    }
  }

  async updateProgress(progress: Partial<ProgressRecord>): Promise<ProgressRecord> {
    const progressKeys = ['user_id', 'course_id', 'video_id', 'completed', 'score'] as const;
    const row = pickAllowedKeys(progress, progressKeys);
    const { data, error } = await supabaseAdmin
      .from('progress_records')
      .upsert(row, { onConflict: 'user_id,course_id,video_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw notFoundError('Progress record not found');
    return data as ProgressRecord;
  }
}

export default new CourseService();
