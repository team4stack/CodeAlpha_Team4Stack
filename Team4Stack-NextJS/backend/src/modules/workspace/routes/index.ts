import { Router } from 'express';
import { wrapAttachAuth } from '../../../shared/middleware/authMiddleware';
import projectController from '../controllers/projectController';
import taskController from '../controllers/taskController';
import messageController from '../controllers/messageController';
import milestoneController from '../controllers/milestoneController';
import deliverableController from '../controllers/deliverableController';
import notificationController from '../controllers/notificationController';

const router = Router();
router.use(wrapAttachAuth);

router.get('/projects', projectController.listMine);
router.post('/projects', projectController.create);
router.get('/projects/:id', projectController.getById);
router.put('/projects/:id', projectController.update);
router.get('/projects/:id/activity', projectController.activity);

router.post('/projects/:id/staff', projectController.addStaff);
router.delete('/projects/:id/staff/:staffId', projectController.removeStaff);

router.get('/projects/:id/tasks', taskController.listByProject);
router.post('/projects/:id/tasks', taskController.create);
router.patch('/tasks/:taskId', taskController.update);
router.get('/tasks/mine', taskController.listMine);

router.get('/projects/:id/messages', messageController.listByProject);
router.post('/projects/:id/messages', messageController.create);

router.get('/projects/:id/milestones', milestoneController.listByProject);
router.post('/projects/:id/milestones', milestoneController.create);
router.patch('/milestones/:milestoneId', milestoneController.update);
router.post('/milestones/:milestoneId/respond', milestoneController.clientRespond);

router.get('/projects/:id/deliverables', deliverableController.listByProject);
router.post('/projects/:id/deliverables', deliverableController.create);
router.patch('/deliverables/:deliverableId', deliverableController.update);

router.get('/notifications', notificationController.listMine);
router.patch('/notifications/:id/read', notificationController.markRead);

export default router;
