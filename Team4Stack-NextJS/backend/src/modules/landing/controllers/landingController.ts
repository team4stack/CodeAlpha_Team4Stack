import { Request, Response, NextFunction } from 'express';
import landingService from '../services/landingService';

function parseNumericId(param: string): number | null {
  const id = parseInt(param, 10);
  if (Number.isNaN(id)) return null;
  return id;
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
      const review = await landingService.createReview(req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      const id = parseInt(req.params.id, 10);
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
      const project = await landingService.createProject(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
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
      const id = parseInt(req.params.id, 10);
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
      const service = await landingService.createService(req.body);
      res.status(201).json({ success: true, data: service });
    } catch (error: any) {
      next(error);
    }
  };

  updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      const setting = await landingService.upsertSiteSetting(key, value);
      res.json({ success: true, data: setting });
    } catch (error: any) {
      next(error);
    }
  };

  upsertSiteSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      const keyArray = (keys as string).split(',');
      await landingService.deleteSiteSettings(keyArray);
      res.json({ success: true, message: 'Site settings deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Support Requests
  getSupportRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, status, viewed } = req.query;
      const filters: any = {};
      if (user_id) filters.user_id = user_id as string;
      if (status) filters.status = status as string;
      if (viewed !== undefined) filters.viewed = viewed === 'true';

      const requests = await landingService.getSupportRequests(filters);
      res.json({ success: true, data: requests });
    } catch (error: any) {
      next(error);
    }
  };

  createSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await landingService.createSupportRequest(req.body);
      res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      next(error);
    }
  };

  updateSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid support request id' });
      }
      const request = await landingService.updateSupportRequest(id, req.body);
      res.json({ success: true, data: request });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new LandingController();
