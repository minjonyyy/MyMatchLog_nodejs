import express from 'express';
import rateLimit from 'express-rate-limit';
import * as userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Rate Limiting 설정
const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: '너무 많은 로그아웃 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증이 필요하지 않은 라우트
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/token', userController.refreshAccessToken);

// 인증이 필요한 라우트
router.get('/me', authMiddleware, userController.getUserMe);
router.patch('/me', authMiddleware, userController.updateUserMe);
router.post('/change-password', authMiddleware, userController.changePassword);
router.post('/logout', logoutLimiter, authMiddleware, userController.logout);

export default router;
