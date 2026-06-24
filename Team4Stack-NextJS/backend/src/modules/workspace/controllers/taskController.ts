import { Request, Response, NextFunction } from 'express';
import { getWorkspaceActor, isWorkspaceAdmin } from '../middleware/workspaceAccess';
import { userCanAccessProject } from '../services/projectService';
import {
  createTask,
  getTaskById,
  isValidTaskStatus,
  listMyTasks,
  listTasks,
  updateTask
} from '../services/taskService';

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

export class TaskController {
  listMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;
      const data = await listMyTasks(actor);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

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
      const data = await listTasks(projectId);
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
      if (projectId === null) {
        return res.status(400).json({ success: false, error: 'Invalid project id' });
      }
      const title = String(req.body?.title || '').trim();
      if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
      }
      const data = await createTask(projectId, actor, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = requireActor(req, res);
      if (!actor) return;

      const taskId = parseId(req.params.taskId);
      if (taskId === null) {
        return res.status(400).json({ success: false, error: 'Invalid task id' });
      }

      const task = await getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const allowed = await userCanAccessProject(task.project_id, actor);
      if (!allowed) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (!isWorkspaceAdmin(actor)) {
        const patch: Record<string, unknown> = {};
        if (req.body?.status && isValidTaskStatus(req.body.status)) {
          patch.status = req.body.status;
        }
        if (Object.keys(patch).length === 0) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        const data = await updateTask(taskId, actor, patch);
        return res.json({ success: true, data });
      }

      const data = await updateTask(taskId, actor, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default new TaskController();
