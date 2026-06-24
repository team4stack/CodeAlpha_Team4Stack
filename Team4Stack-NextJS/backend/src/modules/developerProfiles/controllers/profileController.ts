import { Request, Response, NextFunction } from 'express';
import {
  getProfileActor,
  getDeveloperProfileForUser,
  isProfileAdmin,
} from '../middleware/access';
import {
  listPublishedProfiles,
  getPublishedBySlug,
  listAllProfiles,
  assignDeveloperProfile,
  updateOwnProfile,
  isValidSlug,
} from '../services/profileService';
import {
  startConversation,
  listMessagesForConversation,
  replyToConversation,
  listConversationsForActor,
} from '../services/conversationService';
import {
  submitApplication,
  listApplications,
  reviewApplication,
} from '../services/applicationService';
import { isMissingTableError } from '../utils/errors';

function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

export class DeveloperProfileController {
  listPublic = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await listPublishedProfiles();
      res.json({ success: true, data });
    } catch (error: unknown) {
      if (isMissingTableError(error)) {
        return res.json({ success: true, data: [], schemaPending: true });
      }
      next(error);
    }
  };

  getPublicBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = String(req.params.slug || '').toLowerCase().trim();
      if (!isValidSlug(slug)) {
        return res.status(400).json({ success: false, error: 'Invalid slug' });
      }
      const data = await getPublishedBySlug(slug);
      if (!data) return res.status(404).json({ success: false, error: 'Developer not found' });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  startConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required to message a developer' });
      }
      const slug = String(req.params.slug || '').toLowerCase().trim();
      const data = await startConversation(slug, actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (isMissingTableError(error)) {
        return res.status(503).json({
          success: false,
          error: 'Messaging is temporarily unavailable. Please try again later.',
        });
      }
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  submitApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      const data = await submitApplication(actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  adminListApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!isProfileAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const data = await listApplications();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  adminReviewApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!isProfileAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid id' });
      const approved = Boolean(req.body?.approved);
      const slug = req.body?.slug ? String(req.body.slug) : undefined;
      const data = await reviewApplication(id, actor!.email, approved, slug);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  listMyConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const data = await listConversationsForActor(actor);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  listMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid conversation id' });
      const data = await listMessagesForConversation(id, actor);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  reply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid conversation id' });
      const data = await replyToConversation(id, actor, req.body?.message);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  getMyDeveloperProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const data = await getDeveloperProfileForUser(actor);
      if (!data) {
        return res.status(404).json({ success: false, error: 'No developer profile assigned' });
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateMyDeveloperProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!actor || actor.kind !== 'user') {
        return res.status(401).json({ success: false, error: 'Sign in required' });
      }
      const profile = await getDeveloperProfileForUser(actor);
      if (!profile) {
        return res.status(404).json({ success: false, error: 'No developer profile assigned' });
      }
      const data = await updateOwnProfile(profile.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  adminList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!isProfileAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const data = await listAllProfiles();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  adminAssign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = getProfileActor(req);
      if (!isProfileAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      const data = await assignDeveloperProfile({
        slug: req.body?.slug,
        user_email: req.body?.user_email,
        user_id: req.body?.user_id || null,
        name: req.body?.name,
        role: req.body?.role,
        assigned_by_admin: actor!.email,
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };
}

export default new DeveloperProfileController();
