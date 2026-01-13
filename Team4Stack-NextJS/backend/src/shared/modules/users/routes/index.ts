import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

router.get('/:id', userController.getUserById);
router.get('/email/:email', userController.getUserByEmail);
router.put('/:id', userController.updateUser);
router.post('/upsert', userController.upsertUser);
router.get('/check-username', userController.checkUsernameAvailability);

export default router;
