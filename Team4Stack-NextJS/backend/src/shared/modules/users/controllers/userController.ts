import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

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
      const user = await userService.updateUser(id, req.body);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  upsertUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.upsertUser(req.body);
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
