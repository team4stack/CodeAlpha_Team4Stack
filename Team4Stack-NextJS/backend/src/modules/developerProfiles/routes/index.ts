import { Router } from 'express';
import { wrapAttachAuth } from '../../../shared/middleware/authMiddleware';
import profileController from '../controllers/profileController';

const router = Router();
router.use(wrapAttachAuth);

router.get('/public', profileController.listPublic);
router.get('/public/:slug', profileController.getPublicBySlug);
router.post('/public/:slug/conversations', profileController.startConversation);
router.post('/applications', profileController.submitApplication);

router.get('/conversations', profileController.listMyConversations);
router.get('/conversations/:id/messages', profileController.listMessages);
router.post('/conversations/:id/messages', profileController.reply);

router.get('/me', profileController.getMyDeveloperProfile);
router.put('/me', profileController.updateMyDeveloperProfile);

router.get('/admin/all', profileController.adminList);
router.post('/admin/assign', profileController.adminAssign);
router.get('/admin/applications', profileController.adminListApplications);
router.post('/admin/applications/:id/review', profileController.adminReviewApplication);

export default router;
