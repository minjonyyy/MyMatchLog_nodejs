import express from 'express';
import userRouter from '../domains/users/user.router.js';
import teamRouter from '../domains/teams/team.router.js';
import stadiumRouter from '../domains/stadiums/stadium.router.js';
import matchLogRouter from '../domains/matchlogs/matchlog.router.js';
import ocrRouter from '../domains/ocr/ocr.router.js';
import eventRouter from '../domains/events/event.router.js';
import adminRouter from '../domains/admin/admin.router.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/stadiums', stadiumRouter);
router.use('/match-logs', matchLogRouter);
router.use('/ocr', ocrRouter);
router.use('/events', eventRouter);
router.use('/admin', adminRouter);

export default router;
