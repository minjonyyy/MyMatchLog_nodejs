import express from 'express';
import * as matchLogController from './matchlog.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import uploadToS3 from '../../middlewares/upload.middleware.js';

const router = express.Router();

// 모든 직관 기록 API는 인증 필요
router.use(authMiddleware);

// 내 직관 기록 목록 조회 (페이지네이션)
router.get('/', matchLogController.getMyMatchLogs);

// 직관 기록 생성 (이미지 업로드 포함)
router.post('/', uploadToS3('ticket_image'), matchLogController.createMatchLog);

// 직관 기록 상세 조회
router.get('/:id', matchLogController.getMatchLogDetail);

// 직관 기록 수정 (이미지 업로드 포함)
router.patch(
  '/:id',
  uploadToS3('ticket_image'),
  matchLogController.updateMatchLog,
);

// 직관 기록 삭제
router.delete('/:id', matchLogController.deleteMatchLog);

export default router;
