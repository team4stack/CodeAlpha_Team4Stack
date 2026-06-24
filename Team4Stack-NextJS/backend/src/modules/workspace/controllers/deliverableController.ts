import { Request, Response, NextFunction } from 'express';
import { getWorkspaceActor, isWorkspaceAdmin } from '../middleware/workspaceAccess';
import { userCanAccessProject } from '../services/projectService';
import {
  createDeliverable,
  listDeliverables,
  updateDeliverable,
} from '../services/deliverableService';

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

export class DeliverableController {
  listByProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const projectId = parseId(req.params.id);
      if (projectId === null) return res.status(400).json({ success: false, error: 'Invalid project id' });
      const allowed = await userCanAccessProject(projectId, actor);
      if (!allowed) return res.status(404).json({ success: false, error: 'Project not found' });
      const data = await listDeliverables(projectId, actor);
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
      const data = await createDeliverable(projectId, actor, req.body);
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
      const id = parseId(req.params.deliverableId);
      if (id === null) return res.status(400).json({ success: false, error: 'Invalid deliverable id' });
      const data = await updateDeliverable(id, actor, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error.status) return res.status(error.status).json({ success: false, error: error.message });
      next(error);
    }
  };
}

export default new DeliverableController();
