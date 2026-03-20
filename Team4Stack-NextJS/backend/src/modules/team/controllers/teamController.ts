import { Request, Response, NextFunction } from 'express';
import teamService from '../services/teamService';

function parseNumericId(param: string): number | null {
  const id = parseInt(param, 10);
  if (Number.isNaN(id)) return null;
  return id;
}

export class TeamController {
  // Team Members
  getTeamMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await teamService.getTeamMembers();
      res.json({ success: true, data: members });
    } catch (error: any) {
      next(error);
    }
  };

  createTeamMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const member = await teamService.createTeamMember(req.body);
      res.status(201).json({ success: true, data: member });
    } catch (error: any) {
      next(error);
    }
  };

  updateTeamMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid team member id' });
      }
      const member = await teamService.updateTeamMember(id, req.body);
      res.json({ success: true, data: member });
    } catch (error: any) {
      next(error);
    }
  };

  deleteTeamMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid team member id' });
      }
      await teamService.deleteTeamMember(id);
      res.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  // Mentor Profiles
  getMentorProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentors = await teamService.getMentorProfiles();
      res.json({ success: true, data: mentors });
    } catch (error: any) {
      next(error);
    }
  };

  createMentorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mentor = await teamService.createMentorProfile(req.body);
      res.status(201).json({ success: true, data: mentor });
    } catch (error: any) {
      next(error);
    }
  };

  updateMentorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid mentor id' });
      }
      const mentor = await teamService.updateMentorProfile(id, req.body);
      res.json({ success: true, data: mentor });
    } catch (error: any) {
      next(error);
    }
  };

  deleteMentorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ success: false, error: 'Invalid mentor id' });
      }
      await teamService.deleteMentorProfile(id);
      res.json({ success: true, message: 'Mentor profile deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };
}

export default new TeamController();
