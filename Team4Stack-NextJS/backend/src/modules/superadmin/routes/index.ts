import { Router } from 'express';
import superadminController from '../controllers/superadminController';

const router = Router();

// Admin Users
router.get('/admins', superadminController.getAdminUsers);
router.post('/admins', superadminController.createAdminUser);
router.delete('/admins/:id', superadminController.deleteAdminUser);

// Audit Logs
router.get('/audit', superadminController.getAuditLogs);
router.post('/audit', superadminController.createAuditLog);

// Users Management
router.get('/users', superadminController.getUsers);
router.get('/users/:id', superadminController.getUserById);
router.put('/users/:id', superadminController.updateUser);
router.post('/users/:id/block', superadminController.blockUser);
router.post('/users/:id/unblock', superadminController.unblockUser);
router.delete('/users/:id', superadminController.deleteUser);

export default router;
