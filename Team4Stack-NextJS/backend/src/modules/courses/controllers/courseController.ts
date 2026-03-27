import { Request, Response, NextFunction } from 'express';
import courseService from '../services/courseService';
import { COURSES_ADMIN_ROLES } from '../../../shared/middleware/authMiddleware';
import userService from '../../../shared/modules/users/services/userService';

function parseNumericId(param: string): number | null {
  const id = parseInt(param, 10);
  if (Number.isNaN(id)) return null;
  return id;
}

function isCoursesAdmin(req: Request): boolean {
  const roles = COURSES_ADMIN_ROLES as readonly string[];
  return req.auth?.kind === 'admin' && roles.includes(req.auth.role);
}

export class CourseController {
  // Get all courses
  getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await courseService.getAllCourses();
      res.json({ success: true, data: courses });
    } catch (error: any) {
      next(error);
    }
  };

  // Get course by ID
  getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      const course = await courseService.getCourseById(id);
      if (!course) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
      res.json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Create course
  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const course = await courseService.createCourse(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Update course
  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      const course = await courseService.updateCourse(id, req.body);
      res.json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete course
  deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      await courseService.deleteCourse(id);
      res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get course videos
  getCourseVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseNumericId(req.params.courseId);
      if (courseId === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      const videos = await courseService.getCourseVideos(courseId);
      res.json({ success: true, data: videos });
    } catch (error: any) {
      next(error);
    }
  };

  // Create video
  createVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const video = await courseService.createVideo(req.body);
      res.status(201).json({ success: true, data: video });
    } catch (error: any) {
      next(error);
    }
  };

  // Update video
  updateVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }
      const video = await courseService.updateVideo(id, req.body);
      res.json({ success: true, data: video });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete video
  deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }
      await courseService.deleteVideo(id);
      res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get admission forms
  getAdmissionForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, approved, course_name } = req.query;
      const filters: Record<string, unknown> = {};
      if (email) filters.email = email as string;
      if (approved !== undefined) filters.approved = approved === 'true';
      if (course_name) filters.course_name = course_name as string;

      const admin = isCoursesAdmin(req);
      if (filters.email) {
        const em = String(filters.email).toLowerCase().trim();
        if (!admin) {
          // User JWT: query email must match token email and/or public.users profile (edge cases).
          // Admin API token: allow only when querying that same email (non–courses-admin tabs).
          let userOk = req.auth?.kind === 'user' && req.auth.email === em;
          if (!userOk && req.auth?.kind === 'user' && req.auth.sub) {
            try {
              const profile = await userService.getUserById(req.auth.sub);
              const profileEmail = String(profile?.email || '')
                .toLowerCase()
                .trim();
              if (profileEmail === em) userOk = true;
            } catch {
              /* ignore */
            }
          }
          const adminSelfOk =
            req.auth?.kind === 'admin' && req.auth.email.toLowerCase().trim() === em;
          if (!userOk && !adminSelfOk) {
            return res.status(403).json({ success: false, error: 'Access denied' });
          }
        }
      } else {
        if (!admin) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
      }

      const forms = await courseService.getAdmissionForms(filters as any);
      res.json({ success: true, data: forms });
    } catch (error: any) {
      next(error);
    }
  };

  // Create admission form
  createAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await courseService.createAdmissionForm(req.body);
      res.status(201).json({ success: true, data: form });
    } catch (error: any) {
      next(error);
    }
  };

  // Update admission form
  updateAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid admission form id' });
      }
      if (isCoursesAdmin(req)) {
        const form = await courseService.updateAdmissionForm(id, req.body);
        res.json({ success: true, data: form });
        return;
      }
      if (req.auth?.kind === 'user' && req.auth.email) {
        const form = await courseService.updateAdmissionFormAsOwner(id, req.body, req.auth.email);
        res.json({ success: true, data: form });
        return;
      }
      return res.status(401).json({ success: false, error: 'Authentication required' });
    } catch (error: any) {
      next(error);
    }
  };

  // Delete admission form
  deleteAdmissionForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid admission form id' });
      }
      await courseService.deleteAdmissionForm(id);
      res.json({ success: true, message: 'Admission form deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get user progress
  getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { courseId } = req.query;
      const admin = isCoursesAdmin(req);
      if (!admin) {
        if (req.auth?.kind !== 'user' || req.auth.sub !== userId) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(req.auth.email);
      }
      const progress = await courseService.getUserProgress(
        userId,
        courseId ? parseInt(courseId as string) : undefined
      );
      res.json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  };

  // Update progress
  updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body || {};
      if (body.score === undefined && body.watched_seconds !== undefined) {
        body.score = body.watched_seconds;
      }
      const uid = typeof body.user_id === 'string' ? body.user_id : String(body.user_id || '');
      if (isCoursesAdmin(req)) {
        const progress = await courseService.updateProgress(body);
        res.json({ success: true, data: progress });
        return;
      }
      if (req.auth?.kind === 'user' && uid && req.auth.sub === uid) {
        await courseService.assertEmailHasApprovedAdmission(req.auth.email);
        const progress = await courseService.updateProgress(body);
        res.json({ success: true, data: progress });
        return;
      }
      return res.status(403).json({ success: false, error: 'Access denied' });
    } catch (error: any) {
      next(error);
    }
  };

  // Get all progress records (for admin)
  getAllProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const { courseId, userId, completed } = req.query;
      const filters: any = {};
      if (courseId) filters.courseId = courseId as string;
      if (userId) filters.userId = userId as string;
      if (completed !== undefined) filters.completed = completed === 'true';

      const progress = await courseService.getAllProgress(filters);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  };

  listAssignmentsByCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseNumericId(req.params.courseId);
      if (courseId === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      const admin = isCoursesAdmin(req);
      if (admin) {
        const data = await courseService.listAssignmentsByCourse(courseId);
        return res.json({ success: true, data });
      }
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      await courseService.assertEmailHasApprovedAdmission(req.auth.email);
      const data = await courseService.getStudentCourseAssignmentsWithSubmissions(req.auth.sub, courseId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  listAssignmentsByVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const videoId = parseNumericId(req.params.videoId);
      if (videoId === null) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }
      const data = await courseService.listAssignmentsByVideo(videoId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  createAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const courseId = parseNumericId(String(req.body?.course_id || ''));
      const videoId = parseNumericId(String(req.body?.video_id || ''));
      const title = String(req.body?.title || '').trim();
      if (courseId === null || videoId === null || !title) {
        return res.status(400).json({ success: false, error: 'course_id, video_id and title are required' });
      }
      const data = await courseService.createAssignment({
        course_id: courseId,
        video_id: videoId,
        title,
        instructions: typeof req.body?.instructions === 'string' ? req.body.instructions : null,
        required_format: typeof req.body?.required_format === 'string' ? req.body.required_format : null,
        max_file_size_mb: parseNumericId(String(req.body?.max_file_size_mb || '')) || 10,
        total_marks: parseNumericId(String(req.body?.total_marks || '')) || 0,
        template_file_url: typeof req.body?.template_file_url === 'string' ? req.body.template_file_url : null,
        template_file_name: typeof req.body?.template_file_name === 'string' ? req.body.template_file_name : null,
        template_file_type: typeof req.body?.template_file_type === 'string' ? req.body.template_file_type : null
      });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid assignment id' });
      }
      const data = await courseService.updateAssignment(id, req.body || {});
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid assignment id' });
      }
      await courseService.deleteAssignment(id);
      return res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error: any) {
      return next(error);
    }
  };

  submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      await courseService.assertEmailHasApprovedAdmission(req.auth.email);
      const assignmentId = parseNumericId(req.params.id);
      if (assignmentId === null) {
        return res.status(400).json({ success: false, error: 'Invalid assignment id' });
      }
      const fileUrl = String(req.body?.file_url || '').trim();
      const fileName = String(req.body?.file_name || '').trim();
      if (!fileUrl || !fileName) {
        return res.status(400).json({ success: false, error: 'file_url and file_name are required' });
      }
      let parsed: URL;
      try {
        parsed = new URL(fileUrl);
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid file_url' });
      }
      if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('res.cloudinary.com')) {
        return res.status(400).json({ success: false, error: 'Only Cloudinary HTTPS URLs are allowed' });
      }

      const data = await courseService.submitAssignment({
        assignmentId,
        userId: req.auth.sub,
        fileUrl,
        fileName,
        fileType: typeof req.body?.file_type === 'string' ? req.body.file_type : undefined,
        studentNotes: typeof req.body?.student_notes === 'string' ? req.body.student_notes : undefined
      });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  listAssignmentSubmissionsByVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const videoId = parseNumericId(req.params.videoId);
      if (videoId === null) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }
      const data = await courseService.listAssignmentSubmissionsByVideo(videoId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  listAssignmentSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
      const courseIdRaw = typeof req.query.courseId === 'string' ? req.query.courseId.trim() : '';
      const videoIdRaw = typeof req.query.videoId === 'string' ? req.query.videoId.trim() : '';
      const courseId = courseIdRaw ? parseNumericId(courseIdRaw) : undefined;
      const videoId = videoIdRaw ? parseNumericId(videoIdRaw) : undefined;
      if (courseIdRaw && courseId === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      if (videoIdRaw && videoId === null) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }
      const data = await courseService.listAssignmentSubmissions({
        userId: userId || undefined,
        courseId: courseId ?? undefined,
        videoId: videoId ?? undefined
      });
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  updateAssignmentSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid submission id' });
      }
      const data = await courseService.updateAssignmentSubmission(id, {
        status: typeof req.body?.status === 'string' ? req.body.status : undefined,
        awarded_marks:
          typeof req.body?.awarded_marks === 'number' || req.body?.awarded_marks === null
            ? req.body.awarded_marks
            : undefined,
        admin_feedback:
          typeof req.body?.admin_feedback === 'string' || req.body?.admin_feedback === null
            ? req.body.admin_feedback
            : undefined
      });
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  getCertificateApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = isCoursesAdmin(req);
      const queryUserId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
      const queryCourseId = parseNumericId(String(req.query.courseId || ''));
      const queryStatus = typeof req.query.status === 'string' ? req.query.status.trim() : '';

      if (!admin) {
        if (req.auth?.kind !== 'user') {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        await courseService.assertEmailHasApprovedAdmission(req.auth.email);
        const data = await courseService.listCertificateApplications({ userId: req.auth.sub });
        return res.json({ success: true, data });
      }

      const data = await courseService.listCertificateApplications({
        userId: queryUserId || undefined,
        courseId: queryCourseId === null ? undefined : queryCourseId,
        status: queryStatus || undefined
      });
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  createCertificateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      await courseService.assertEmailHasApprovedAdmission(req.auth.email);

      const courseId = parseNumericId(String(req.body?.course_id || ''));
      if (courseId === null) {
        return res.status(400).json({ success: false, error: 'Invalid course_id' });
      }

      const fullName = String(req.body?.full_name || '').trim();
      const cnic = String(req.body?.cnic || '').trim();
      const email = String(req.body?.email || '').trim().toLowerCase();
      const phoneNumber = String(req.body?.phone_number || '').trim();
      const rollNumber = String(req.body?.roll_number || '').trim();

      if (!fullName || !cnic || !email || !phoneNumber || !rollNumber) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const data = await courseService.createCertificateApplication({
        userId: req.auth.sub,
        courseId,
        fullName,
        cnic,
        email,
        phoneNumber,
        rollNumber
      });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  updateCertificateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid certificate application id' });
      }
      const data = await courseService.updateCertificateApplication(id, {
        status: typeof req.body?.status === 'string' ? req.body.status : undefined,
        admin_notes:
          typeof req.body?.admin_notes === 'string' || req.body?.admin_notes === null
            ? req.body.admin_notes
            : undefined,
        certificate_url:
          typeof req.body?.certificate_url === 'string' || req.body?.certificate_url === null
            ? req.body.certificate_url
            : undefined
      });
      return res.json({ success: true, data });
    } catch (error: any) {
      return next(error);
    }
  };

  // Get single-course report for one student
  getStudentCourseReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseNumericId(req.params.courseId);
      if (courseId === null) {
        return res.status(400).json({ success: false, error: 'Invalid course id' });
      }
      const userId = String(req.params.userId || '').trim();
      if (!userId) {
        return res.status(400).json({ success: false, error: 'Invalid user id' });
      }

      const admin = isCoursesAdmin(req);
      if (!admin) {
        if (req.auth?.kind !== 'user' || req.auth.sub !== userId) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(req.auth.email);
      }

      const report = await courseService.getStudentCourseReport(userId, courseId);
      return res.json({ success: true, data: report });
    } catch (error: any) {
      return next(error);
    }
  };

  /** Student: list notifications for their email (same pattern as admissions). */
  getStudentNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
      if (!email) {
        return res.status(400).json({ success: false, error: 'email query is required' });
      }
      const em = email.toLowerCase().trim();
      const admin = isCoursesAdmin(req);
      if (!admin) {
        const u = req.auth;
        const userOk = u?.kind === 'user' && u.email === em;
        const adminSelfOk =
          u?.kind === 'admin' && u.email.toLowerCase().trim() === em;
        if (!userOk && !adminSelfOk) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(em);
      }
      const data = await courseService.listStudentNotifications(em);
      res.json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  };

  /** Student: mark one notification read. */
  markStudentNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid notification id' });
      }
      const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
      if (!email) {
        return res.status(400).json({ success: false, error: 'email is required in body' });
      }
      const em = email.toLowerCase().trim();
      const admin = isCoursesAdmin(req);
      if (!admin) {
        const u = req.auth;
        const userOk = u?.kind === 'user' && u.email === em;
        const adminSelfOk =
          u?.kind === 'admin' && u.email.toLowerCase().trim() === em;
        if (!userOk && !adminSelfOk) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(em);
      }
      const data = await courseService.markStudentNotificationRead(id, em);
      res.json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  };

  /** Courses / super admin: send notifications to approved students or explicit emails. */
  createStudentNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isCoursesAdmin(req) || req.auth?.kind !== 'admin') {
        return res.status(403).json({ success: false, error: 'Courses admin access required' });
      }
      const { adminEmail, title, body, audience, emails } = req.body || {};
      if (!adminEmail || typeof adminEmail !== 'string') {
        return res.status(400).json({ success: false, error: 'adminEmail is required' });
      }
      const tokenEmail = req.auth.email.toLowerCase().trim();
      if (adminEmail.toLowerCase().trim() !== tokenEmail) {
        return res.status(403).json({ success: false, error: 'adminEmail must match authenticated admin' });
      }
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'title is required' });
      }
      await courseService.assertCanSendCourseNotifications(adminEmail);

      let recipients: string[] = [];
      if (audience === 'all_approved') {
        recipients = await courseService.getDistinctApprovedStudentEmails();
      } else if (audience === 'emails' && Array.isArray(emails)) {
        recipients = emails.map((e: unknown) => String(e).toLowerCase().trim()).filter(Boolean);
      } else {
        return res.status(400).json({
          success: false,
          error: 'audience must be all_approved or emails (with emails array)'
        });
      }

      const sent = await courseService.createBulkStudentNotifications({
        recipients,
        title: title.trim(),
        body: typeof body === 'string' ? body : '',
        createdByEmail: adminEmail
      });

      res.json({ success: true, data: { sent, recipientCount: recipients.length } });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new CourseController();
