import { Request, Response, NextFunction } from 'express';
import landingService from '../services/landingService';
import { COURSES_ADMIN_ROLES, LANDING_ADMIN_ROLES } from '../../../shared/middleware/authMiddleware';
import { areAllPublicOtpSettingKeys, isPublicOtpSettingKey } from '../../../shared/utils/landingSettingsPolicy';
import { parsePublicLandingReviewBody } from '../utils/publicReviewSubmit';

function parseNumericId(param: string): number | null {
  const id = Number.parseInt(param, 10);
  if (Number.isNaN(id)) return null;
  return id;
}

function isLandingAdmin(req: Request): boolean {
  return req.auth?.kind === 'admin' && (LANDING_ADMIN_ROLES as readonly string[]).includes(req.auth.role);
}

function isCoursesAdmin(req: Request): boolean {
  return req.auth?.kind === 'admin' && (COURSES_ADMIN_ROLES as readonly string[]).includes(req.auth.role);
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class LandingController {
  // Reviews
  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const reviews = await landingService.getReviews(status as string);
      res.json({ success: true, data: reviews });
    } catch (error: any) {
      next(error);
    }
  };

  createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isLandingAdmin(req)) {
        const review = await landingService.createReview(req.body);
        res.status(201).json({ success: true, data: review });
        return;
      }

      // Public review submission (marketing site): validate server-side; always pending for moderation.
      const parsed = parsePublicLandingReviewBody(req.body);
      if (!parsed.ok) {
        return res.status(parsed.statusCode).json({ success: false, error: parsed.error });
      }

      const review = await landingService.createReview({
        ...parsed.value,
        status: 'pending'
      });
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid review id' });
      }
      const review = await landingService.updateReview(id, req.body);
      res.json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid review id' });
      }
      await landingService.deleteReview(id);
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Projects
  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await landingService.getProjects();
      res.json({ success: true, data: projects });
    } catch (error: any) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const project = await landingService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, data: project });
    } catch (error: any) {
      next(error);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const project = await landingService.createProject(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const project = await landingService.updateProject(id, req.body);
      res.json({ success: true, data: project });
    } catch (error: any) {
      if (error?.status === 404) {
        return res.status(404).json({ success: false, error: error.message || 'Project not found' });
      }
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      await landingService.deleteProject(id);
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Services
  getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const services = await landingService.getServices();
      res.json({ success: true, data: services });
    } catch (error: any) {
      next(error);
    }
  };

  createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const service = await landingService.createService(req.body);
      res.status(201).json({ success: true, data: service });
    } catch (error: any) {
      next(error);
    }
  };

  updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid service id' });
      }
      const service = await landingService.updateService(id, req.body);
      res.json({ success: true, data: service });
    } catch (error: any) {
      next(error);
    }
  };

  deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid service id' });
      }
      await landingService.deleteService(id);
      res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Site Settings
  getSiteSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { keys } = req.query;
      const keyArray = keys ? (keys as string).split(',') : undefined;
      const settings = await landingService.getSiteSettings(keyArray);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      next(error);
    }
  };

  upsertSiteSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value } = req.body;
      const keyStr = typeof key === 'string' ? key : '';
      if (!isPublicOtpSettingKey(keyStr) && !isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const setting = await landingService.upsertSiteSetting(key, value);
      res.json({ success: true, data: setting });
    } catch (error: any) {
      next(error);
    }
  };

  upsertSiteSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      const { entries } = req.body;
      if (!Array.isArray(entries)) {
        return res.status(400).json({ success: false, error: 'Entries must be an array' });
      }
      const settings = await landingService.upsertSiteSettings(entries);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      next(error);
    }
  };

  deleteSiteSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { keys } = req.query;
      if (!keys) {
        return res.status(400).json({ success: false, error: 'Keys parameter is required' });
      }
      const keyArray = (keys as string)
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      if (!areAllPublicOtpSettingKeys(keyArray) && !isLandingAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Landing admin access required' });
      }
      await landingService.deleteSiteSettings(keyArray);
      res.json({ success: true, message: 'Site settings deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Support Requests
  getSupportRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const landingAdmin = isLandingAdmin(req);
      const coursesAdmin = isCoursesAdmin(req);
      if (!landingAdmin && !coursesAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const { user_id, status, viewed } = req.query;
      const filters: any = {};
      if (user_id) filters.user_id = user_id as string;
      if (status) filters.status = status as string;
      if (viewed !== undefined) filters.viewed = viewed === 'true';
      const requestedArea = normalizeText(req.query?.target_area);
      if (requestedArea === 'site' || requestedArea === 'course') {
        filters.target_area = requestedArea;
      }

      // Courses admin can only access course-related requests.
      if (!landingAdmin && coursesAdmin) {
        filters.target_area = 'course';
      }

      const requests = await landingService.getSupportRequests(filters);
      res.json({ success: true, data: requests });
    } catch (error: any) {
      next(error);
    }
  };

  createSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reason = normalizeText(req.body?.reason) || 'contact_team';
      const targetAreaInput = normalizeText(req.body?.target_area || req.body?.related_to);
      const targetArea = targetAreaInput === 'course' ? 'course' : 'site';
      const email = normalizeText(req.body?.email).toLowerCase();
      const subject = normalizeText(req.body?.subject);
      const message = normalizeText(req.body?.message);
      const screenshotUrlRaw = normalizeText(req.body?.screenshot_url);

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      }
      if (!subject || subject.length < 3 || subject.length > 160) {
        return res.status(400).json({ success: false, error: 'Subject must be between 3 and 160 characters' });
      }
      if (!message || message.length < 10 || message.length > 3000) {
        return res.status(400).json({ success: false, error: 'Message must be between 10 and 3000 characters' });
      }
      if (reason.length > 80) {
        return res.status(400).json({ success: false, error: 'Reason is too long' });
      }

      let screenshotUrl: string | undefined;
      if (screenshotUrlRaw) {
        try {
          const parsed = new URL(screenshotUrlRaw);
          const isHttps = parsed.protocol === 'https:';
          const isCloudinary = parsed.hostname.endsWith('res.cloudinary.com');
          if (!isHttps || !isCloudinary) {
            return res.status(400).json({
              success: false,
              error: 'Screenshot URL must be a valid Cloudinary HTTPS URL'
            });
          }
          screenshotUrl = parsed.toString();
        } catch {
          return res.status(400).json({ success: false, error: 'Invalid screenshot URL format' });
        }
      }

      const request = await landingService.createSupportRequest({
        reason,
        target_area: targetArea,
        email,
        subject,
        message,
        ...(screenshotUrl ? { screenshot_url: screenshotUrl } : {})
      });
      res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      next(error);
    }
  };

  updateSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const landingAdmin = isLandingAdmin(req);
      const coursesAdmin = isCoursesAdmin(req);
      if (!landingAdmin && !coursesAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid support request id' });
      }
      if (coursesAdmin && !landingAdmin) {
        const existing = await landingService.getSupportRequestById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Support request not found' });
        }
        if ((existing.target_area || 'site') !== 'course') {
          return res.status(403).json({ success: false, error: 'Courses admin can only update course support requests' });
        }
      }
      const request = await landingService.updateSupportRequest(id, req.body);
      res.json({ success: true, data: request });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new LandingController();
