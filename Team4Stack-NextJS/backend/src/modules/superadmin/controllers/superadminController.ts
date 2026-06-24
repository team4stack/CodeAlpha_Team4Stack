import { Request, Response, NextFunction } from 'express';
import superadminService from '../services/superadminService';
import { issueAdminApiToken } from '../../../shared/middleware/authMiddleware';
import bcrypt from 'bcryptjs';

function parseNumericId(param: string): number | null {
  const id = parseInt(param, 10);
  if (Number.isNaN(id)) return null;
  return id;
}

/** Server-only gate for `super_admin` logins (replaces NEXT_PUBLIC_ALLOWED_ADMIN_EMAILS). */
function isSuperAdminLoginAllowed(email: string): boolean {
  const em = email.toLowerCase().trim();
  const primary = process.env.SUPERADMIN_PRIMARY_EMAIL?.trim().toLowerCase();
  if (primary) {
    return em === primary;
  }
  const raw = process.env.ALLOWED_ADMIN_EMAILS?.trim();
  if (!raw) {
    return true;
  }
  const list = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(em);
}

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
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid admin id' });
      }
      const admin = await superadminService.updateAdminUser(id, req.body);
      res.json({ success: true, data: admin });
    } catch (error: any) {
      next(error);
    }
  };

  deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid admin id' });
      }
      await superadminService.deleteAdminUser(id);
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
      if (!result.valid) {
        res.json({ success: true, data: result });
        return;
      }

      const adminRow = await superadminService.checkAdminByEmail(email);
      const role = adminRow?.role ? String(adminRow.role) : 'admin';
      if (role === 'super_admin' && !isSuperAdminLoginAllowed(email)) {
        res.json({
          success: true,
          data: { valid: false, error: 'Invalid email or password' }
        });
        return;
      }

      let apiToken: string;
      let expiresAt: number;
      try {
        apiToken = issueAdminApiToken(email, role);
        expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      } catch (e: any) {
        console.error('[superadmin] Failed to issue admin API token:', e?.message || e);
        res.status(500).json({
          success: false,
          error: 'Unable to sign in right now. Please try again.'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          valid: true,
          apiToken,
          expiresAt,
          role
        }
      });
    } catch (error: any) {
      next(error);
    }
  };

  changeAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth?.kind !== 'admin') {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
      }
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current and new password are required' });
      }
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
      }

      const email = req.auth.email;
      const verify = await superadminService.verifyAdminPassword(email, currentPassword);
      if (!verify.valid) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(String(newPassword), 10);
      await superadminService.updateAdminPasswordByEmail(email, passwordHash);

      res.json({ success: true, message: 'Password updated successfully' });
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
