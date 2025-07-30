import express from 'express';
import userRouter from '../domains/users/user.router.js';

const router = express.Router();

router.use('/users', userRouter);

export default router;
