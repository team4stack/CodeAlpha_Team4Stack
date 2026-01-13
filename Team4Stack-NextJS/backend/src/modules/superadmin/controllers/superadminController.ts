import { Request, Response, NextFunction } from 'express';
import superadminService from '../services/superadminService';

export class SuperAdminController {
  // Admin Users
  getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await superadminService.getAdminUsers();
      res.json({ success: true, data: admins });
    } catch (error: any) {
      next(error);
    }
  };

  createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await superadminService.createAdminUser(req.body);
      res.status(201).json({ success: true, data: admin });
    } catch (error: any) {
      next(error);
    }
  };

  updateAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const admin = await superadminService.updateAdminUser(parseInt(id), req.body);
      res.json({ success: true, data: admin });
    } catch (error: any) {
      next(error);
    }
  };

  deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await superadminService.deleteAdminUser(parseInt(id));
      res.json({ success: true, message: 'Admin user deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  checkAdminByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      const admin = await superadminService.checkAdminByEmail(email);
      res.json({ success: true, data: admin });
    } catch (error: any) {
      next(error);
    }
  };

  verifyAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }
      const result = await superadminService.verifyAdminPassword(email, password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  };

  // Audit Logs
  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, action, table_name } = req.query;
      const filters: any = {};
      if (user_id) filters.user_id = user_id as string;
      if (action) filters.action = action as string;
      if (table_name) filters.table_name = table_name as string;

      const logs = await superadminService.getAuditLogs(filters);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      next(error);
    }
  };

  createAuditLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await superadminService.createAuditLog(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      next(error);
    }
  };

  // Users Management
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { is_blocked } = req.query;
      const filters: any = {};
      if (is_blocked !== undefined) filters.is_blocked = is_blocked === 'true';

      const users = await superadminService.getUsers(filters);
      res.json({ success: true, data: users });
    } catch (error: any) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await superadminService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await superadminService.updateUser(id, req.body);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await superadminService.blockUser(id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await superadminService.unblockUser(id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await superadminService.deleteUser(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new SuperAdminController();
