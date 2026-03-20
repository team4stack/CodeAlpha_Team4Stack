import { Router } from 'express';
import landingController from '../controllers/landingController';
import { wrapAttachAuth } from '../../../shared/middleware/authMiddleware';

const router = Router();
router.use(wrapAttachAuth);

// Reviews
router.get('/reviews', landingController.getReviews);
router.post('/reviews', landingController.createReview);
router.put('/reviews/:id', landingController.updateReview);
router.delete('/reviews/:id', landingController.deleteReview);

// Projects
router.get('/projects', landingController.getProjects);
router.get('/projects/:id', landingController.getProjectById);
router.post('/projects', landingController.createProject);
router.put('/projects/:id', landingController.updateProject);
router.delete('/projects/:id', landingController.deleteProject);

// Services
router.get('/services', landingController.getServices);
router.post('/services', landingController.createService);
router.put('/services/:id', landingController.updateService);
router.delete('/services/:id', landingController.deleteService);

// Site Settings
router.get('/settings', landingController.getSiteSettings);
router.post('/settings', landingController.upsertSiteSetting);
router.post('/settings/bulk', landingController.upsertSiteSettings);
router.delete('/settings', landingController.deleteSiteSettings);

// Support Requests
router.get('/support', landingController.getSupportRequests);
router.post('/support', landingController.createSupportRequest);
router.put('/support/:id', landingController.updateSupportRequest);

export default router;
