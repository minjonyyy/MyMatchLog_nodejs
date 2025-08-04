import express from 'express';
import * as userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 인증이 필요하지 않은 라우트
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/token', userController.refreshAccessToken);

// 인증이 필요한 라우트
router.get('/me', authMiddleware, userController.getUserMe);
router.patch('/me', authMiddleware, userController.updateUserMe);
router.post('/logout', authMiddleware, userController.logout);

export default router;
