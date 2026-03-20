import { Router } from 'express';
import superadminController from '../controllers/superadminController';
import {
  requireAdminApiToken,
  requireAdminRoles,
  wrapAttachAuth,
  SUPERADMIN_ONLY_ROLES
} from '../../../shared/middleware/authMiddleware';

const router = Router();

// Public (pre-login)
router.get('/admins/check/:email', superadminController.checkAdminByEmail);
router.post('/admins/verify-password', superadminController.verifyAdminPassword);

// Super admin API (HMAC admin token, role super_admin)
router.use(wrapAttachAuth);
router.use(requireAdminApiToken);
router.use(requireAdminRoles(SUPERADMIN_ONLY_ROLES));

router.get('/admins', superadminController.getAdminUsers);
router.post('/admins', superadminController.createAdminUser);
router.put('/admins/:id', superadminController.updateAdminUser);
router.delete('/admins/:id', superadminController.deleteAdminUser);

router.get('/audit', superadminController.getAuditLogs);
router.post('/audit', superadminController.createAuditLog);

router.get('/users', superadminController.getUsers);
router.get('/users/:id', superadminController.getUserById);
router.put('/users/:id', superadminController.updateUser);
router.post('/users/:id/block', superadminController.blockUser);
router.post('/users/:id/unblock', superadminController.unblockUser);
router.delete('/users/:id', superadminController.deleteUser);

export default router;
