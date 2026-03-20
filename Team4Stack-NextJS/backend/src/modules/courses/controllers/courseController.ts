import { Request, Response, NextFunction } from 'express';
import courseService from '../services/courseService';
import { COURSES_ADMIN_ROLES } from '../../../shared/middleware/authMiddleware';

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
          if (req.auth?.kind !== 'user' || req.auth.email !== em) {
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
      const uid = typeof body.user_id === 'string' ? body.user_id : String(body.user_id || '');
      if (isCoursesAdmin(req)) {
        const progress = await courseService.updateProgress(req.body);
        res.json({ success: true, data: progress });
        return;
      }
      if (req.auth?.kind === 'user' && uid && req.auth.sub === uid) {
        await courseService.assertEmailHasApprovedAdmission(req.auth.email);
        const progress = await courseService.updateProgress(req.body);
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
        if (u?.kind !== 'user' || u.email !== em) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(u.email);
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
        if (u?.kind !== 'user' || u.email !== em) {
          return res.status(403).json({ success: false, error: 'Access denied' });
        }
        await courseService.assertEmailHasApprovedAdmission(u.email);
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
