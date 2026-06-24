import { Request, Response, NextFunction } from 'express';
import { getWorkspaceActor, isWorkspaceAdmin } from '../middleware/workspaceAccess';
import { userCanAccessProject } from '../services/projectService';
import {
  createMilestone,
  listMilestones,
  updateMilestone,
  clientRespondMilestone,
} from '../services/milestoneService';

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

export class MilestoneController {
  listByProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const projectId = parseId(req.params.id);
      if (projectId === null) return res.status(400).json({ success: false, error: 'Invalid project id' });
      const allowed = await userCanAccessProject(projectId, actor);
      if (!allowed) return res.status(404).json({ success: false, error: 'Project not found' });
      const data = await listMilestones(projectId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor || !isWorkspaceAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Team admin access required' });
      }
      const projectId = parseId(req.params.id);
      if (projectId === null) return res.status(400).json({ success: false, error: 'Invalid project id' });
      const data = await createMilestone(projectId, actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const id = parseId(req.params.milestoneId);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid milestone id' });
      const data = await updateMilestone(id, actor, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };

  clientRespond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor || actor.kind !== 'user') {
        return res.status(403).json({ success: false, error: 'Client access required' });
      }
      const id = parseId(req.params.milestoneId);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid milestone id' });
      const approved = Boolean(req.body?.approved);
      const data = await clientRespondMilestone(id, actor, approved);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };
}

export default new MilestoneController();
