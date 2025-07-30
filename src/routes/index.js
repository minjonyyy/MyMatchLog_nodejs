import express from 'express';
import userRouter from '../domains/users/user.router.js';
import teamRouter from '../domains/teams/team.router.js';
import stadiumRouter from '../domains/stadiums/stadium.router.js';
import matchLogRouter from '../domains/matchlogs/matchlog.router.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/stadiums', stadiumRouter);
router.use('/match-logs', matchLogRouter);

export default router;
