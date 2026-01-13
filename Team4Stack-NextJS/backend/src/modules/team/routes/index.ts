import { Router } from 'express';
import teamController from '../controllers/teamController';

const router = Router();

// Team Members
router.get('/members', teamController.getTeamMembers);
router.post('/members', teamController.createTeamMember);
router.put('/members/:id', teamController.updateTeamMember);
router.delete('/members/:id', teamController.deleteTeamMember);

// Mentor Profiles
router.get('/mentors', teamController.getMentorProfiles);
router.post('/mentors', teamController.createMentorProfile);
router.put('/mentors/:id', teamController.updateMentorProfile);
router.delete('/mentors/:id', teamController.deleteMentorProfile);

export default router;
