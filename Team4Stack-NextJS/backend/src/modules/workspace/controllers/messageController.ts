import { Request, Response, NextFunction } from 'express';
import { getWorkspaceActor } from '../middleware/workspaceAccess';
import { userCanAccessProject } from '../services/projectService';
import { createMessage, listMessages } from '../services/messageService';

function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

function requireActor(req: Request, res: Response) {
  const actor = getWorkspaceActor(req);
  if (!actor) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return actor;
}

export class MessageController {
  listByProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const projectId = parseId(req.params.id);
      if (projectId === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const allowed = await userCanAccessProject(projectId, actor);
      if (!allowed) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      const data = await listMessages(projectId, actor);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const projectId = parseId(req.params.id);
      if (projectId === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const allowed = await userCanAccessProject(projectId, actor);
      if (!allowed) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      const data = await createMessage(projectId, actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default new MessageController();
