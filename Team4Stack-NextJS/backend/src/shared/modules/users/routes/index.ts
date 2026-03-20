import { Router } from 'express';
import userController from '../controllers/userController';
import { wrapAttachAuth } from '../../../middleware/authMiddleware';

const router = Router();
router.use(wrapAttachAuth);

router.get('/check-username', userController.checkUsernameAvailability);
router.get('/username', userController.getUserByUsername);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.post('/upsert', userController.upsertUser);

export default router;
