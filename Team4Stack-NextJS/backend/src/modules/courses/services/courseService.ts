import { supabaseAdmin } from '../../../config/supabase';
import bcrypt from 'bcryptjs';
import {
  pickAllowedKeys,
  updateByIdWithTimestampRetry,
  notFoundError,
  badRequestError
} from '../../../shared/utils/supabaseAdminWrite';
import {
  Course,
  Video,
  AdmissionForm,
  ProgressRecord,
  StudentCourseNotification,
  StudentCourseReportSummary,
  CertificateApplication,
  CourseAssignment,
  CourseAssignmentSubmission
} from '../types';

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
const ASSIGNMENT_KEYS = [
  'course_id',
  'video_id',
  'title',
  'instructions',
  'required_format',
  'max_file_size_mb',
  'total_marks',
  'template_file_url',
  'template_file_name',
  'template_file_type'
] as const;

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
  'date_of_birth',
  'age',
  'cnic',
  'image_attached',
  'payment_screenshot_url',
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
  'date_of_birth',
  'age',
  'cnic',
  'image_attached',
  'payment_screenshot_url'
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
  'date_of_birth',
  'age',
  'cnic',
  'image_attached',
  'payment_screenshot_url'
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

function isCourseReportCompleted(report: StudentCourseReportSummary): boolean {
  const lecturesDone =
    report.lectures.total > 0 && report.lectures.completed >= report.lectures.total;
  const quizzesDone =
    report.quizzes.total === 0 || report.quizzes.passed >= report.quizzes.total;
  return lecturesDone && quizzesDone;
}

function toValidDateMs(value?: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveAssignmentTitle(assignment: Record<string, unknown>): string {
  const title = assignment.title;
  if (typeof title !== 'string') return 'Assignment';
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : 'Assignment';
}

export class CourseService {
  private parseIsoDurationToSeconds(value: string): number {
    const match = /P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(value);
    if (!match) return 0;
    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  private async fetchYouTubeDurationSeconds(videoUrl?: string): Promise<number> {
    const videoId = this.extractYouTubeId(videoUrl);
    if (!videoId) return 0;

    const key = process.env.YOUTUBE_API_KEY?.trim();
    if (!key) return 0;

    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.set('part', 'contentDetails');
      url.searchParams.set('id', videoId);
      url.searchParams.set('key', key);

      const refererRaw =
        process.env.YOUTUBE_API_REFERER?.trim() ||
        process.env.FRONTEND_URL?.trim() ||
        process.env.CORS_ORIGIN?.trim() ||
        '';
      const referer = refererRaw ? (refererRaw.endsWith('/') ? refererRaw : `${refererRaw}/`) : '';

      const response = await fetch(url.toString(), {
        headers: referer ? { Referer: referer } : undefined
      });
      if (!response.ok) return 0;

      const json = (await response.json()) as {
        items?: Array<{ contentDetails?: { duration?: string } }>;
      };
      const durationIso = json.items?.[0]?.contentDetails?.duration || '';
      if (!durationIso) return 0;
      return this.parseIsoDurationToSeconds(durationIso);
    } catch {
      return 0;
    }
  }

  private extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    const input = String(url);
    const watchMatch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(input);
    if (watchMatch) return watchMatch[1];
    const shortMatch = /youtu\.be\/([a-zA-Z0-9_-]{11})/.exec(input);
    if (shortMatch) return shortMatch[1];
    const embedMatch = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.exec(input);
    if (embedMatch) return embedMatch[1];
    return null;
  }

  private normalizeVideoKey(url?: string): string {
    const raw = String(url || '').trim();
    const ytId = this.extractYouTubeId(raw);
    if (ytId) return `youtube:${ytId}`;
    return `url:${raw.toLowerCase()}`;
  }

  private async assertNoDuplicateCourseVideo(
    courseId: number,
    videoUrl?: string,
    ignoreVideoId?: number
  ): Promise<void> {
    const normalizedIncoming = this.normalizeVideoKey(videoUrl);
    if (!videoUrl || normalizedIncoming === 'url:') return;

    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('id, video_url')
      .eq('course_id', courseId);
    if (error) throw error;

    const rows = (data || []) as Array<{ id: number; video_url?: string }>;
    const duplicate = rows.find((row) => {
      if (ignoreVideoId && row.id === ignoreVideoId) return false;
      return this.normalizeVideoKey(row.video_url) === normalizedIncoming;
    });

    if (duplicate) {
      const err = new Error(
        'This video is already added in the same course. Please use a different video URL.'
      ) as Error & { status?: number };
      err.status = 409;
      throw err;
    }
  }

  private async resetVideoLearningState(videoId: number, courseId: number): Promise<void> {
    // 1) Reset lecture completion/progress for this video only.
    const { error: progressDeleteError } = await supabaseAdmin
      .from('progress_records')
      .delete()
      .eq('course_id', courseId)
      .eq('video_id', videoId);
    if (progressDeleteError) throw progressDeleteError;

    // 2) Reset quiz attempts tied to this video (so changed lecture/quiz must be retaken).
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('id')
      .eq('video_id', videoId);
    if (quizzesError) throw quizzesError;
    const quizIds = ((quizzes || []) as Array<{ id: number | string }>).map((q) => q.id);
    if (quizIds.length === 0) return;

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id')
      .in('quiz_id', quizIds);
    if (attemptsError) throw attemptsError;
    const attemptIds = ((attempts || []) as Array<{ id: number | string }>).map((a) => a.id);

    if (attemptIds.length > 0) {
      const { error: answersDeleteError } = await supabaseAdmin
        .from('quiz_attempt_answers')
        .delete()
        .in('attempt_id', attemptIds);
      if (answersDeleteError) throw answersDeleteError;
    }

    const { error: attemptsDeleteError } = await supabaseAdmin
      .from('quiz_attempts')
      .delete()
      .in('quiz_id', quizIds);
    if (attemptsDeleteError) throw attemptsDeleteError;
  }

  private computeAgeFromDateOfBirth(value: unknown): number | null {
    if (typeof value !== 'string') return null;
    const dobStr = value.trim();
    if (!dobStr) return null;
    const t = Date.parse(dobStr.includes('T') ? dobStr : `${dobStr}T12:00:00`);
    if (Number.isNaN(t)) return null;
    const d = new Date(t);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const md = now.getMonth() - d.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < d.getDate())) age -= 1;
    return Math.max(0, age);
  }

  private async insertAdmissionFormWithDateFallback(insert: Record<string, unknown>): Promise<AdmissionForm> {
    let { data, error } = await supabaseAdmin.from('admission_forms').insert(insert).select().single();

    // Older DBs may not have date_of_birth yet — retry with age only.
    if (error && insert.date_of_birth !== undefined) {
      const msg = String((error as { message?: string }).message || '').toLowerCase();
      if (msg.includes('date_of_birth') || msg.includes('column') || msg.includes('schema')) {
        const retry = { ...insert };
        delete retry.date_of_birth;
        ({ data, error } = await supabaseAdmin.from('admission_forms').insert(retry).select().single());
      }
    }

    if (error) throw error;
    return data as AdmissionForm;
  }

  private normalizeStaleProgressRows(
    progressRows: ProgressRecord[],
    videoUpdatedAtById: Map<number, number>
  ): ProgressRecord[] {
    return progressRows.map((row) => {
      const videoId = Number(row.video_id || 0);
      const videoUpdatedAt = videoUpdatedAtById.get(videoId);
      if (!videoUpdatedAt) return row;
      const progressAt = toValidDateMs(row.updated_at || row.created_at || null);
      if (progressAt <= 0 || progressAt >= videoUpdatedAt) return row;
      return { ...row, completed: false, score: 0 };
    });
  }

  private async getQuizReportStats(args: {
    userId: string;
    videoIds: number[];
    videoUpdatedAtById: Map<number, number>;
  }): Promise<{
    total: number;
    passed: number;
    totalMarks: number;
    obtainedMarks: number;
  }> {
    if (args.videoIds.length === 0) {
      return { total: 0, passed: 0, totalMarks: 0, obtainedMarks: 0 };
    }

    const { data: quizzesData, error: quizzesError } = await supabaseAdmin
      .from('quizzes')
      .select('id, video_id, total_marks, updated_at, created_at')
      .in('video_id', args.videoIds);
    if (quizzesError) throw quizzesError;

    const quizzes = (quizzesData || []) as Array<{
      id: number | string;
      video_id?: number;
      total_marks?: number;
      updated_at?: string | null;
      created_at?: string | null;
    }>;
    const total = quizzes.length;
    const totalMarks = quizzes.reduce((sum, quiz) => sum + (quiz.total_marks || 0), 0);
    const quizIds = quizzes.map((quiz) => quiz.id);
    if (quizIds.length === 0) {
      return { total, passed: 0, totalMarks, obtainedMarks: 0 };
    }

    const quizContentUpdatedAtById = new Map<string, number>();
    quizzes.forEach((quiz) => {
      const quizUpdatedAt = toValidDateMs(quiz.updated_at || quiz.created_at || null);
      const videoUpdatedAt = quiz.video_id ? args.videoUpdatedAtById.get(Number(quiz.video_id)) || 0 : 0;
      quizContentUpdatedAtById.set(String(quiz.id), Math.max(quizUpdatedAt, videoUpdatedAt));
    });

    const { data: attemptsData, error: attemptsError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('quiz_id, score, passed, submitted_at, created_at')
      .eq('user_id', args.userId)
      .in('quiz_id', quizIds);
    if (attemptsError) throw attemptsError;

    const attempts = (attemptsData || []) as Array<{
      quiz_id: number | string;
      score?: number;
      passed?: boolean;
      submitted_at?: string | null;
      created_at?: string | null;
    }>;

    const bestByQuiz = new Map<string, { score: number; passed: boolean }>();
    attempts.forEach((attempt) => {
      const key = String(attempt.quiz_id);
      const contentUpdatedAt = quizContentUpdatedAtById.get(key) || 0;
      const attemptAt = toValidDateMs(attempt.submitted_at || attempt.created_at || null);
      if (contentUpdatedAt > 0 && (attemptAt <= 0 || attemptAt < contentUpdatedAt)) return;

      const score = attempt.score || 0;
      const passed = attempt.passed === true;
      const existing = bestByQuiz.get(key);
      if (!existing || score > existing.score) {
        bestByQuiz.set(key, { score, passed });
      } else if (!existing.passed && passed) {
        bestByQuiz.set(key, { ...existing, passed: true });
      }
    });

    const passed = [...bestByQuiz.values()].filter((entry) => entry.passed).length;
    const obtainedMarks = [...bestByQuiz.values()].reduce((sum, entry) => sum + entry.score, 0);
    return { total, passed, totalMarks, obtainedMarks };
  }

  private async getAssignmentReportStats(
    userId: string,
    courseId: number
  ): Promise<{ total: number; uploaded: number; totalMarks: number; obtainedMarks: number }> {
    const assignments = await this.listAssignmentsByCourse(courseId);
    if (assignments.length === 0) {
      return { total: 0, uploaded: 0, totalMarks: 0, obtainedMarks: 0 };
    }
    const assignmentIds = assignments.map((a) => a.id);
    const { data: submissionData, error: submissionError } = await supabaseAdmin
      .from('course_assignment_submissions')
      .select('assignment_id, awarded_marks')
      .eq('user_id', userId)
      .in('assignment_id', assignmentIds);
    if (submissionError) throw submissionError;
    const submissions = (submissionData || []) as Array<{ assignment_id: number; awarded_marks?: number | null }>;
    const uploaded = submissions.length;
    const obtainedMarks = submissions.reduce((sum, row) => sum + Number(row.awarded_marks || 0), 0);
    const totalMarks = assignments.reduce((sum, row) => sum + Number(row.total_marks || 0), 0);
    return { total: assignments.length, uploaded, totalMarks, obtainedMarks };
  }

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

  async updateAdminPassword(args: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<{ updated: boolean }> {
    const email = args.email.toLowerCase().trim();
    if (!email) {
      const err: Error & { status?: number } = new Error('Admin email is required');
      err.status = 400;
      throw err;
    }
    if (!args.currentPassword || !args.newPassword) {
      const err: Error & { status?: number } = new Error('Current and new password are required');
      err.status = 400;
      throw err;
    }
    if (args.newPassword.length < 6) {
      const err: Error & { status?: number } = new Error('Password must be at least 6 characters');
      err.status = 400;
      throw err;
    }

    const { data: verifyData, error: verifyError } = await supabaseAdmin.rpc(
      'verify_admin_password',
      {
        p_email: email,
        p_password: args.currentPassword
      }
    );
    if (verifyError) {
      const err: Error & { status?: number } = new Error(
        verifyError.message || 'Failed to verify current password'
      );
      err.status = 400;
      throw err;
    }
    if (!verifyData || (verifyData as any).valid !== true) {
      const err: Error & { status?: number } = new Error(
        (verifyData as any)?.error || 'Invalid current password'
      );
      err.status = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(args.newPassword, 10);
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', email);
    if (updateError) throw updateError;

    return { updated: true };
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
    const courseId = Number(video.course_id);
    if (!Number.isNaN(courseId) && courseId > 0) {
      await this.assertNoDuplicateCourseVideo(courseId, video.video_url);
    }
    const insert = pickAllowedKeys(video, VIDEO_KEYS);
    const insertDuration = typeof insert.duration === 'number' ? insert.duration : undefined;
    const insertVideoUrl = typeof insert.video_url === 'string' ? insert.video_url : undefined;
    if ((!insertDuration || insertDuration <= 0) && insertVideoUrl) {
      const fetchedDuration = await this.fetchYouTubeDurationSeconds(insertVideoUrl);
      if (fetchedDuration > 0) {
        insert.duration = fetchedDuration;
      }
    }
    const { data, error } = await supabaseAdmin.from('videos').insert(insert).select().single();

    if (error) throw error;
    return data;
  }

  async updateVideo(id: number, video: Partial<Video>): Promise<Video> {
    const existing = await supabaseAdmin.from('videos').select('id, course_id, video_url').eq('id', id).maybeSingle();
    if (existing.error) throw existing.error;
    const existingRow = existing.data as { id: number; course_id: number; video_url?: string } | null;
    if (!existingRow) {
      throw notFoundError('Video not found');
    }
    const targetCourseId = Number(video.course_id || existingRow.course_id);
    const targetUrl = video.video_url || existingRow.video_url;
    const oldVideoKey = this.normalizeVideoKey(existingRow.video_url);
    const newVideoKey = this.normalizeVideoKey(targetUrl);
    const shouldResetLearningState = oldVideoKey !== newVideoKey;
    if (!Number.isNaN(targetCourseId) && targetCourseId > 0) {
      await this.assertNoDuplicateCourseVideo(targetCourseId, targetUrl, id);
    }

    const patch = pickAllowedKeys(video, VIDEO_KEYS);
    const patchVideoUrl = typeof patch.video_url === 'string' ? patch.video_url : undefined;
    const patchDuration = typeof patch.duration === 'number' ? patch.duration : undefined;
    if (patchVideoUrl) {
      const shouldFetchDuration = !patchDuration || patchDuration <= 0 || shouldResetLearningState;
      if (shouldFetchDuration) {
        const fetchedDuration = await this.fetchYouTubeDurationSeconds(patchVideoUrl);
        if (fetchedDuration > 0) {
          patch.duration = fetchedDuration;
        }
      }
    }
    if (shouldResetLearningState && (patch.duration === undefined || patch.duration === null)) {
      // Ensure old duration is not shown after URL changes.
      patch.duration = 0;
    }
    const row = await updateByIdWithTimestampRetry('videos', id, patch, { notFoundMessage: 'Video not found' });
    if (shouldResetLearningState && !Number.isNaN(targetCourseId) && targetCourseId > 0) {
      await this.resetVideoLearningState(id, targetCourseId);
    }
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
    let query = supabaseAdmin.from('admission_forms').select('*');

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
    const { data, error } = await supabaseAdmin.from('admission_forms').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createAdmissionForm(form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const insert: Record<string, unknown> = { ...pickAllowedKeys(form, ADMISSION_APPLICANT_KEYS) };

    // Form sends date_of_birth but not age; DB typically requires integer age.
    if (insert.age === undefined || insert.age === null) {
      const computedAge = this.computeAgeFromDateOfBirth(insert.date_of_birth);
      if (computedAge !== null) insert.age = computedAge;
    }
    if (insert.age === undefined || insert.age === null) {
      throw badRequestError('Valid date of birth (or age) is required');
    }

    const email = String(insert.email || '').toLowerCase().trim();
    if (email) {
      const { data: existing, error } = await supabaseAdmin
        .from('admission_forms')
        .select('id')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (existing?.id) {
        const row = await updateByIdWithTimestampRetry('admission_forms', Number(existing.id), insert, {
          notFoundMessage: 'Admission form not found'
        });
        return row as unknown as AdmissionForm;
      }
    }

    return this.insertAdmissionFormWithDateFallback(insert);
  }

  async updateAdmissionForm(id: number, form: Partial<AdmissionForm>): Promise<AdmissionForm> {
    const patch = pickAllowedKeys(form, ADMISSION_KEYS);
    const row = await updateByIdWithTimestampRetry('admission_forms', id, patch, {
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
    const row = await updateByIdWithTimestampRetry('admission_forms', id, patch, {
      notFoundMessage: 'Admission form not found'
    });
    return row as unknown as AdmissionForm;
  }

  async deleteAdmissionForm(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('admission_forms').delete().eq('id', id);

    if (error) throw error;
  }

  async getUserProgress(userId: string, courseId?: number): Promise<ProgressRecord[]> {
    let query = supabaseAdmin.from('progress_records').select('*').eq('user_id', userId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data || []) as ProgressRecord[];
    return rows;
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

  async listAssignmentsByCourse(courseId: number): Promise<CourseAssignment[]> {
    const { data, error } = await supabaseAdmin
      .from('course_assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('video_id', { ascending: true })
      .order('id', { ascending: false });
    if (error) throw error;
    return (data || []) as CourseAssignment[];
  }

  async listAssignmentsByVideo(videoId: number): Promise<CourseAssignment[]> {
    const { data, error } = await supabaseAdmin
      .from('course_assignments')
      .select('*')
      .eq('video_id', videoId)
      .order('id', { ascending: false });
    if (error) throw error;
    return (data || []) as CourseAssignment[];
  }

  async createAssignment(input: Partial<CourseAssignment>): Promise<CourseAssignment> {
    const payload = pickAllowedKeys(input, ASSIGNMENT_KEYS);
    const { data, error } = await supabaseAdmin.from('course_assignments').insert(payload).select('*').single();
    if (error) throw error;
    return data as CourseAssignment;
  }

  async updateAssignment(id: number, patch: Partial<CourseAssignment>): Promise<CourseAssignment> {
    const safePatch = pickAllowedKeys(patch, ASSIGNMENT_KEYS);
    const row = await updateByIdWithTimestampRetry('course_assignments', id, safePatch, {
      notFoundMessage: 'Assignment not found'
    });
    return row as unknown as CourseAssignment;
  }

  async deleteAssignment(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('course_assignments').delete().eq('id', id);
    if (error) throw error;
  }

  async submitAssignment(input: {
    assignmentId: number;
    userId: string;
    fileUrl: string;
    fileName: string;
    fileType?: string;
    studentNotes?: string;
  }): Promise<CourseAssignmentSubmission> {
    const payload = {
      assignment_id: input.assignmentId,
      user_id: input.userId,
      file_url: input.fileUrl,
      file_name: input.fileName,
      file_type: input.fileType || null,
      student_notes: input.studentNotes || null,
      status: 'submitted',
      awarded_marks: null,
      admin_feedback: null
    };
    const { data, error } = await supabaseAdmin
      .from('course_assignment_submissions')
      .upsert(payload, { onConflict: 'assignment_id,user_id' })
      .select('*')
      .single();
    if (error) throw error;
    return data as CourseAssignmentSubmission;
  }

  async listAssignmentSubmissionsByVideo(videoId: number): Promise<Array<CourseAssignmentSubmission & { assignment_title: string }>> {
    const { data, error } = await supabaseAdmin
      .from('course_assignment_submissions')
      .select('*, course_assignments!inner(id,title,video_id)')
      .eq('course_assignments.video_id', videoId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as Array<Record<string, unknown>>).map((row) => {
      const assignment = row.course_assignments as Record<string, unknown>;
      return {
        ...(row as unknown as CourseAssignmentSubmission),
        assignment_title: resolveAssignmentTitle(assignment)
      };
    });
  }

  async listAssignmentSubmissions(filters?: {
    userId?: string;
    courseId?: number;
    videoId?: number;
  }): Promise<
    Array<
      CourseAssignmentSubmission & {
        assignment_title: string;
        course_id: number;
        video_id: number;
      }
    >
  > {
    let query = supabaseAdmin
      .from('course_assignment_submissions')
      .select('*, course_assignments!inner(id,title,course_id,video_id)')
      .order('submitted_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.courseId) {
      query = query.eq('course_assignments.course_id', filters.courseId);
    }
    if (filters?.videoId) {
      query = query.eq('course_assignments.video_id', filters.videoId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return ((data || []) as Array<Record<string, unknown>>).map((row) => {
      const assignment = (row.course_assignments || {}) as Record<string, unknown>;
      return {
        ...(row as unknown as CourseAssignmentSubmission),
        assignment_title: resolveAssignmentTitle(assignment),
        course_id: Number(assignment.course_id || 0),
        video_id: Number(assignment.video_id || 0)
      };
    });
  }

  async updateAssignmentSubmission(
    id: number,
    patch: Partial<Pick<CourseAssignmentSubmission, 'status' | 'awarded_marks' | 'admin_feedback'>> & {
      allowResubmit?: boolean;
    }
  ): Promise<CourseAssignmentSubmission | { deleted: true }> {
    const existingResult = await supabaseAdmin
      .from('course_assignment_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (existingResult.error) throw existingResult.error;
    const existing = existingResult.data as CourseAssignmentSubmission | null;
    if (!existing) {
      throw notFoundError('Assignment submission not found');
    }

    const safePatch: Record<string, unknown> = {};
    const allowedStatuses = new Set(['submitted', 'reviewed', 'accepted', 'rejected']);
    if (typeof patch.status === 'string' && allowedStatuses.has(patch.status)) {
      safePatch.status = patch.status;
    }
    if (typeof patch.awarded_marks === 'number' || patch.awarded_marks === null) {
      safePatch.awarded_marks = patch.awarded_marks;
    }
    if (typeof patch.admin_feedback === 'string' || patch.admin_feedback === null) {
      safePatch.admin_feedback = patch.admin_feedback || null;
    }
    const shouldReject = safePatch.status === 'rejected';
    if (shouldReject && existing.file_url) {
      try {
        await this.tryDeleteCloudinaryFile(existing.file_url);
      } catch {
        /* ignore delete errors */
      }
    }

    if (shouldReject && patch.allowResubmit) {
      await supabaseAdmin.from('course_assignment_submissions').delete().eq('id', id);
      return { deleted: true };
    }

    const row = await updateByIdWithTimestampRetry('course_assignment_submissions', id, safePatch, {
      notFoundMessage: 'Assignment submission not found'
    });
    return row as unknown as CourseAssignmentSubmission;
  }

  private parseCloudinaryPublicId(fileUrl: string): { publicId: string; resourceType: 'raw' | 'image' } | null {
    try {
      const parsed = new URL(fileUrl);
      const path = decodeURIComponent(parsed.pathname || '');
      const rawIndex = path.indexOf('/raw/upload/');
      const imageIndex = path.indexOf('/image/upload/');
      let start = rawIndex >= 0 ? rawIndex + '/raw/upload/'.length : -1;
      let resourceType: 'raw' | 'image' = 'raw';
      if (start < 0 && imageIndex >= 0) {
        start = imageIndex + '/image/upload/'.length;
        resourceType = 'image';
      }
      if (start < 0) return null;
      const remainder = path.slice(start).replace(/^\/+/, '');
      if (!remainder) return null;
      const segments = remainder.split('/').filter(Boolean);
      if (segments.length === 0) return null;
      if (/^v\d+$/.test(segments[0])) {
        segments.shift();
      }
      if (segments.length === 0) return null;
      const last = segments.pop() as string;
      const lastNoExt = last.includes('.') ? last.slice(0, last.lastIndexOf('.')) : last;
      const publicId = [...segments, lastNoExt].join('/');
      if (!publicId) return null;
      return { publicId, resourceType };
    } catch {
      return null;
    }
  }

  private async tryDeleteCloudinaryFile(fileUrl: string): Promise<void> {
    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim() || '';
    if (!cloudinaryUrl.startsWith('cloudinary://')) return;
    const parsed = new URL(cloudinaryUrl);
    const apiKey = parsed.username;
    const apiSecret = parsed.password;
    const cloudName = parsed.hostname;
    if (!apiKey || !apiSecret || !cloudName) return;
    const parsedId = this.parseCloudinaryPublicId(fileUrl);
    if (!parsedId) return;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${parsedId.resourceType}/upload`;
    const body = new URLSearchParams({ 'public_ids[]': parsedId.publicId }).toString();
    await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }).catch(() => {});
  }

  async getStudentCourseAssignmentsWithSubmissions(
    userId: string,
    courseId: number
  ): Promise<Array<CourseAssignment & { submission: CourseAssignmentSubmission | null }>> {
    const assignments = await this.listAssignmentsByCourse(courseId);
    if (assignments.length === 0) return [];
    const assignmentIds = assignments.map((a) => a.id);
    const { data, error } = await supabaseAdmin
      .from('course_assignment_submissions')
      .select('*')
      .eq('user_id', userId)
      .in('assignment_id', assignmentIds);
    if (error) throw error;
    const byAssignment = new Map<number, CourseAssignmentSubmission>();
    ((data || []) as CourseAssignmentSubmission[]).forEach((s) => {
      byAssignment.set(Number(s.assignment_id), s);
    });
    return assignments.map((assignment) => ({
      ...assignment,
      submission: byAssignment.get(assignment.id) || null
    }));
  }

  async getStudentCourseReport(userId: string, courseId: number): Promise<StudentCourseReportSummary> {
    const course = await this.getCourseById(courseId);
    if (!course) {
      const err = new Error('Course not found') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    const videos = await this.getCourseVideos(courseId);
    const videoIds = videos.map((video) => video.id);

    let progressRows: ProgressRecord[] = [];
    if (videoIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('progress_records')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .in('video_id', videoIds);
      if (error) throw error;
      progressRows = (data || []) as ProgressRecord[];
    }

    const completedLectures = progressRows.filter((row) => row.completed === true && row.video_id).length;
    const totalCourseTimeSeconds = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const watchedTimeSeconds = progressRows.reduce((sum, row) => sum + (row.score || 0), 0);
    const totalLectures = videos.length;
    const lectureProgress =
      totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    const quizStats = await this.getQuizReportStats({
      userId,
      videoIds,
      videoUpdatedAtById: new Map()
    });

    const { data: applicationData, error: applicationError } = await supabaseAdmin
      .from('course_certificate_applications')
      .select('id, status, certificate_url')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (applicationError) throw applicationError;

    const assignmentStats = await this.getAssignmentReportStats(userId, courseId);

    const provisionalReport: StudentCourseReportSummary = {
      course: {
        id: course.id,
        title: course.title || course.name || 'Course',
        description: course.description,
        thumbnail_url: course.thumbnail_url
      },
      lectures: {
        total: totalLectures,
        completed: completedLectures,
        progress_percentage: lectureProgress,
        total_time_seconds: totalCourseTimeSeconds,
        watched_time_seconds: watchedTimeSeconds
      },
      quizzes: {
        total: quizStats.total,
        passed: quizStats.passed,
        total_marks: quizStats.totalMarks,
        obtained_marks: quizStats.obtainedMarks
      },
      assignments: {
        total: assignmentStats.total,
        uploaded: assignmentStats.uploaded,
        unuploaded: Math.max(assignmentStats.total - assignmentStats.uploaded, 0),
        total_marks: assignmentStats.totalMarks,
        obtained_marks: assignmentStats.obtainedMarks
      },
      certificate: {
        eligible: false,
        application_status: 'not_applied',
        application_id: undefined as number | undefined,
        certificate_url: null as string | null
      }
    };

    provisionalReport.certificate.eligible = isCourseReportCompleted(provisionalReport);
    if (applicationData) {
      const status = String((applicationData as { status?: string }).status || 'pending');
      const safeStatus =
        status === 'approved' || status === 'rejected' || status === 'sent'
          ? status
          : 'pending';
      provisionalReport.certificate.application_status = safeStatus;
      provisionalReport.certificate.application_id = Number(
        (applicationData as { id?: number }).id || 0
      );
      provisionalReport.certificate.certificate_url =
        (applicationData as { certificate_url?: string | null }).certificate_url || null;
    }

    return provisionalReport;
  }

  async createCertificateApplication(args: {
    userId: string;
    courseId: number;
    fullName: string;
    cnic: string;
    email: string;
    phoneNumber: string;
    rollNumber: string;
  }): Promise<CertificateApplication> {
    const report = await this.getStudentCourseReport(args.userId, args.courseId);
    if (!report.certificate.eligible) {
      const err = new Error('Course is not complete yet. Certificate application is not allowed.') as Error & {
        status?: number;
      };
      err.status = 400;
      throw err;
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('course_certificate_applications')
      .select('id, status')
      .eq('user_id', args.userId)
      .eq('course_id', args.courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing && String((existing as { status?: string }).status || '') !== 'rejected') {
      const err = new Error('Certificate request already exists for this course.') as Error & {
        status?: number;
      };
      err.status = 409;
      throw err;
    }

    const payload = {
      user_id: args.userId,
      course_id: args.courseId,
      full_name: args.fullName.trim(),
      cnic: args.cnic.trim(),
      email: args.email.trim().toLowerCase(),
      phone_number: args.phoneNumber.trim(),
      roll_number: args.rollNumber.trim(),
      status: 'pending'
    };

    if (existing && String((existing as { status?: string }).status || '') === 'rejected') {
      const { data, error } = await supabaseAdmin
        .from('course_certificate_applications')
        .update({
          ...payload,
          admin_notes: null,
          certificate_url: null
        })
        .eq('id', Number((existing as { id?: number }).id || 0))
        .select('*')
        .single();
      if (error) throw error;
      return data as CertificateApplication;
    }

    const { data, error } = await supabaseAdmin
      .from('course_certificate_applications')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data as CertificateApplication;
  }

  async listCertificateApplications(filters?: {
    userId?: string;
    courseId?: number;
    status?: string;
  }): Promise<CertificateApplication[]> {
    let query = supabaseAdmin.from('course_certificate_applications').select('*');
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.courseId) {
      query = query.eq('course_id', filters.courseId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CertificateApplication[];
  }

  async updateCertificateApplication(
    id: number,
    patch: Partial<Pick<CertificateApplication, 'status' | 'admin_notes' | 'certificate_url'>>
  ): Promise<CertificateApplication> {
    const allowedStatuses = new Set(['pending', 'approved', 'rejected', 'sent']);
    const safePatch: Record<string, unknown> = {};
    if (typeof patch.status === 'string' && allowedStatuses.has(patch.status)) {
      safePatch.status = patch.status;
    }
    if (typeof patch.admin_notes === 'string' || patch.admin_notes === null) {
      safePatch.admin_notes = patch.admin_notes || null;
    }
    if (typeof patch.certificate_url === 'string' || patch.certificate_url === null) {
      safePatch.certificate_url = patch.certificate_url || null;
    }
    const row = await updateByIdWithTimestampRetry('course_certificate_applications', id, safePatch, {
      notFoundMessage: 'Certificate application not found'
    });
    return row as unknown as CertificateApplication;
  }

  async updateProgress(progress: Partial<ProgressRecord>): Promise<ProgressRecord> {
    const progressKeys = ['user_id', 'course_id', 'video_id', 'completed', 'score'] as const;
    const row = pickAllowedKeys(progress, progressKeys);

    const userId = String(row.user_id || '').trim();
    const courseId = Number(row.course_id || 0);
    const videoId = Number(row.video_id || 0);
    if (!userId || !Number.isFinite(courseId) || courseId <= 0 || !Number.isFinite(videoId) || videoId <= 0) {
      throw badRequestError('user_id, course_id, and video_id are required');
    }

    const { data: videoRow, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('duration')
      .eq('id', videoId)
      .maybeSingle();
    if (videoError) throw videoError;

    const rawDuration = (videoRow as { duration?: number | string } | null)?.duration;
    let safeDuration = 0;
    if (typeof rawDuration === 'number') {
      safeDuration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 0;
    } else if (typeof rawDuration === 'string') {
      const trimmed = rawDuration.trim();
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric) && numeric > 0) {
        safeDuration = numeric;
      } else {
        const parts = trimmed.split(':').map((part) => Number(part));
        if (!parts.some((part) => Number.isNaN(part))) {
          if (parts.length === 3) safeDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
          if (parts.length === 2) safeDuration = parts[0] * 60 + parts[1];
        }
      }
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('progress_records')
      .select('score, completed')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('video_id', videoId)
      .maybeSingle();
    if (existingError) throw existingError;

    const incomingScore = Number(row.score || 0);
    const safeIncoming = Number.isFinite(incomingScore) && incomingScore > 0 ? incomingScore : 0;
    const previousScore = Number((existing as { score?: number } | null)?.score || 0);
    const nextScoreRaw = Math.max(previousScore, safeIncoming);
    const nextScore = safeDuration > 0 ? Math.min(nextScoreRaw, safeDuration) : nextScoreRaw;
    const completed = safeDuration > 0 ? nextScore >= safeDuration * 0.9 : false;

    const payload = {
      user_id: userId,
      course_id: courseId,
      video_id: videoId,
      score: Math.round(nextScore),
      completed
    };

    const { data, error } = await supabaseAdmin
      .from('progress_records')
      .upsert(payload, { onConflict: 'user_id,course_id,video_id' })
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
