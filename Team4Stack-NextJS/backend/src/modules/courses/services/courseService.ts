import { supabaseAdmin } from '../../../config/supabase';
import {
  pickAllowedKeys,
  updateByIdWithTimestampRetry,
  notFoundError
} from '../../../shared/utils/supabaseAdminWrite';
import { Course, Video, AdmissionForm, ProgressRecord, StudentCourseNotification } from '../types';

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

/** Fields applicants may set on create / limited self-service edits (no approval / staff fields). */
export const ADMISSION_APPLICANT_KEYS = [
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
  'image_attached'
] as const;

/** Owner may update these only (email frozen — use admin to change). */
export const ADMISSION_OWNER_PATCH_KEYS = [
  'name',
  'father_name',
  'phone',
  'address',
  'course_name',
  'course_name_2',
  'message',
  'gender',
  'age',
  'cnic',
  'image_attached'
] as const;

export function isAdmissionFormApproved(app: AdmissionForm | Record<string, unknown>): boolean {
  const a = app as Record<string, unknown>;
  const hasNew = a.approved_1 !== undefined || a.approved_2 !== undefined;
  if (hasNew) {
    const hasCourse1 = Boolean(a.course_name);
    const hasCourse2 = Boolean(a.course_name_2);
    if (hasCourse1 && hasCourse2) return a.approved_1 === true || a.approved_2 === true;
    if (hasCourse1) return a.approved_1 === true;
    return false;
  }
  return a.approved === true;
}

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

  /** Mirrors StudentRouteGuard: at least one application row for this email is “approved”. */
  async assertEmailHasApprovedAdmission(email: string): Promise<void> {
    const forms = await this.getAdmissionForms({ email });
    const ok = forms.some((f) => isAdmissionFormApproved(f));
    if (!ok) {
      const err = new Error('Student access denied: admission not approved') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
  }

  async getAdmissionFormById(id: number): Promise<AdmissionForm | null> {
    const { data, error } = await supabaseAdmin.from('admission_form').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createAdmissionForm(form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const insert = pickAllowedKeys(form, ADMISSION_APPLICANT_KEYS);
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

  async updateAdmissionFormAsOwner(id: number, form: Partial<AdmissionForm>, ownerEmail: string): Promise<AdmissionForm> {
    const existing = await this.getAdmissionFormById(id);
    if (!existing) {
      const err = new Error('Admission form not found') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    const em = ownerEmail.toLowerCase().trim();
    if (String(existing.email || '').toLowerCase().trim() !== em) {
      const err = new Error('Forbidden') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    const patch = pickAllowedKeys(form, ADMISSION_OWNER_PATCH_KEYS);
    if (Object.keys(patch).length === 0) {
      return existing;
    }
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

  async getDistinctApprovedStudentEmails(): Promise<string[]> {
    const forms = await this.getAdmissionForms({});
    const set = new Set<string>();
    for (const f of forms) {
      if (isAdmissionFormApproved(f) && f.email) {
        set.add(String(f.email).toLowerCase().trim());
      }
    }
    return [...set];
  }

  async assertCanSendCourseNotifications(adminEmail: string): Promise<void> {
    const email = adminEmail.toLowerCase().trim();
    const { data, error } = await supabaseAdmin.from('admin_users').select('email, role').eq('email', email).maybeSingle();
    if (error) throw error;
    if (!data) {
      const err = new Error('Forbidden: not an admin') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    const role = String((data as { role?: string }).role || '');
    if (role !== 'courses_admin' && role !== 'super_admin') {
      const err = new Error('Forbidden: courses notifications require courses or super admin') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
  }

  async listStudentNotifications(studentEmail: string): Promise<StudentCourseNotification[]> {
    const em = studentEmail.toLowerCase().trim();
    const { data, error } = await supabaseAdmin
      .from('student_course_notifications')
      .select('*')
      .eq('student_email', em)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []) as StudentCourseNotification[];
  }

  async markStudentNotificationRead(id: number, studentEmail: string): Promise<StudentCourseNotification> {
    const em = studentEmail.toLowerCase().trim();
    const { data: row, error: e1 } = await supabaseAdmin
      .from('student_course_notifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (e1) throw e1;
    if (!row || String((row as StudentCourseNotification).student_email).toLowerCase() !== em) {
      const err = new Error('Notification not found') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    const { data: updated, error } = await supabaseAdmin
      .from('student_course_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated as StudentCourseNotification;
  }

  async createBulkStudentNotifications(opts: {
    recipients: string[];
    title: string;
    body: string;
    createdByEmail: string;
  }): Promise<number> {
    const title = opts.title.trim();
    if (!title) throw new Error('Title is required');
    const by = opts.createdByEmail.toLowerCase().trim();
    const uniq = [...new Set(opts.recipients.map((e) => e.toLowerCase().trim()).filter(Boolean))];
    if (uniq.length === 0) return 0;
    const rows = uniq.map((student_email) => ({
      student_email,
      title,
      body: opts.body?.trim() || null,
      created_by_email: by
    }));
    const { error } = await supabaseAdmin.from('student_course_notifications').insert(rows);
    if (error) throw error;
    return rows.length;
  }
}

export default new CourseService();
