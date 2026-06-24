import { Request, Response, NextFunction } from 'express';
import { getWorkspaceActor } from '../middleware/workspaceAccess';
import {
  listNotificationsForActor,
  markNotificationRead,
} from '../services/notificationService';

function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

function requireUserActor(req: Request, res: Response) {
  const actor = getWorkspaceActor(req);
  if (!actor || actor.kind !== 'user') {
    res.status(401).json({ success: false, error: 'Sign in required' });
    return null;
  }
  return actor;
}

export class NotificationController {
  listMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireUserActor(req, res);
      if (!actor) return;
      const data = await listNotificationsForActor(actor.email, actor.userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireUserActor(req, res);
      if (!actor) return;
      const id = parseId(req.params.id);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid id' });
      const data = await markNotificationRead(id, actor.email, actor.userId);
      if (!data) return res.status(404).json({ success: false, error: 'Notification not found' });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationController();
