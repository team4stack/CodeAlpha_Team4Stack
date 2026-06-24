import { Request, Response, NextFunction } from 'express';
import {
  addProjectStaff,
  createProject,
  getProjectDetail,
  listProjectsForActor,
  removeProjectStaff,
  updateProject,
  userCanAccessProject
} from '../services/projectService';
import { listWorkspaceActivity } from '../services/activityService';
import { getWorkspaceActor, isWorkspaceAdmin } from '../middleware/workspaceAccess';

function parseId(param: string): number | null {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

function requireActor(req: Request, res: Response): ReturnType<typeof getWorkspaceActor> {
  const actor = getWorkspaceActor(req);
  if (!actor) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }
  return actor;
}

export class ProjectController {
  listMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const data = await listProjectsForActor(actor);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const data = await getProjectDetail(id, actor);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
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
      const title = String(req.body?.title || '').trim();
      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
      }
      const data = await createProject(actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor || !isWorkspaceAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Team admin access required' });
      }
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const data = await updateProject(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  addStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor || !isWorkspaceAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Team admin access required' });
      }
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const email = String(req.body?.staff_email || '').trim();
      if (!email) {
        return res.status(400).json({ success: false, error: 'Staff email is required' });
      }
      const data = await addProjectStaff(id, actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  removeStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor || !isWorkspaceAdmin(actor)) {
        return res.status(403).json({ success: false, error: 'Team admin access required' });
      }
      const projectId = parseId(req.params.id);
      const staffId = parseId(req.params.staffId);
      if (projectId === null || staffId === null) {
        return res.status(400).json({ success: false, error: 'Invalid id' });
      }
      await removeProjectStaff(staffId, projectId, actor);
      res.json({ success: true, message: 'Staff removed' });
    } catch (error) {
      next(error);
    }
  };

  activity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const allowed = await userCanAccessProject(id, actor);
      if (!allowed) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      const data = await listWorkspaceActivity(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProjectController();
