import express from 'express';
import * as eventController from './event.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', eventController.getEvents);

router.get(
  '/my-participations',
  authMiddleware,
  eventController.getMyParticipations,
);

router.get('/:id', eventController.getEventById);

router.post(
  '/:id/participate',
  authMiddleware,
  eventController.participateInEvent,
);

// 이벤트 결과 발표 (관리자 전용)
router.post(
  '/:id/announce-results',
  authMiddleware,
  eventController.announceEventResults,
);

// 특정 이벤트 참여 상태 조회
router.get(
  '/:id/participation-status',
  authMiddleware,
  eventController.getParticipationStatus,
);

export default router;
