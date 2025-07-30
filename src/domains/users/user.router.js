import express from 'express';
import * as userController from './user.controller.js';

const router = express.Router();

router.post('/signup', userController.signUp);

router.post('/login', userController.login);

router.post('/token', userController.refreshAccessToken);

export default router;
