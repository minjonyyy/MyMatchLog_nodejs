import express from 'express';
import * as stadiumController from './stadium.controller.js';

const router = express.Router();

// 경기장 목록 조회 (인증 불필요)
router.get('/', stadiumController.getAllStadiums);

// 경기장 상세 조회 (인증 불필요)
router.get('/:id', stadiumController.getStadiumById);

export default router;
