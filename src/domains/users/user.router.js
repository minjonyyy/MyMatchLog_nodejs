import express from 'express';
import * as userController from './user.controller.js';

const router = express.Router();

router.post('/signup', userController.signUp);

export default router;
