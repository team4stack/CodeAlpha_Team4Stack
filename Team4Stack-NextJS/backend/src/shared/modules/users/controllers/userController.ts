import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { COURSES_ADMIN_ROLES, SUPERADMIN_ONLY_ROLES } from '../../../middleware/authMiddleware';

function canManageUsersViaUsersApi(req: Request): boolean {
  if (req.auth?.kind !== 'admin') return false;
  const roles = COURSES_ADMIN_ROLES as readonly string[];
  const superRoles = SUPERADMIN_ONLY_ROLES as readonly string[];
  return roles.includes(req.auth.role) || superRoles.includes(req.auth.role);
}

export class UserController {
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  getUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const user = await userService.getUserByEmail(email as string);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Username is required' });
      }
      const user = await userService.getUserByUsername(username as string);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (canManageUsersViaUsersApi(req)) {
        const user = await userService.updateUser(id, req.body);
        res.json({ success: true, data: user });
        return;
      }
      if (req.auth?.kind === 'user' && req.auth.sub === id) {
        const user = await userService.updateUser(id, req.body);
        res.json({ success: true, data: user });
        return;
      }
      res.status(403).json({ success: false, error: 'Access denied' });
    } catch (error: any) {
      next(error);
    }
  };

  upsertUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (canManageUsersViaUsersApi(req)) {
        const user = await userService.upsertUser(req.body);
        res.json({ success: true, data: user });
        return;
      }
      if (req.auth?.kind !== 'user') {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const body = req.body || {};
      if (body.id && body.id !== req.auth.sub) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      if (body.email && String(body.email).toLowerCase().trim() !== req.auth.email) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      const user = await userService.upsertUser({ ...body, id: req.auth.sub });
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  checkUsernameAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ success: false, error: 'Username is required' });
      }
      const available = await userService.checkUsernameAvailability(username as string);
      res.json({ success: true, available });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new UserController();
