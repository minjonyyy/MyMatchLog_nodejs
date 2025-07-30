import express from 'express';
import * as teamController from './team.controller.js';

const router = express.Router();

// 팀 목록 조회 (인증 불필요)
router.get('/', teamController.getAllTeams);

export default router; 