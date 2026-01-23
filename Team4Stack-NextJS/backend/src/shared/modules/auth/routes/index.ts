import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);
router.post('/reset-password', authController.resetPassword);
router.post('/update-password', authController.updatePassword);
router.post('/signout', authController.signOut);
router.post('/session', authController.getSession);
router.post('/oauth/initiate', authController.initiateOAuth);
router.get('/oauth/redirect', authController.oauthRedirect);
router.get('/oauth/callback', authController.oauthCallback);

export default router;
