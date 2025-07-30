import express from 'express';
import * as adminController from './admin.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import adminMiddleware from '../../middlewares/admin.middleware.js';

const router = express.Router();

// 관리자 권한이 필요한 라우트에 adminMiddleware 추가
router.post('/events', authMiddleware, adminMiddleware, adminController.createEvent);

router.get('/events/:id/participants', authMiddleware, adminMiddleware, adminController.getEventParticipants);

export default router; 