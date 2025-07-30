import express from 'express';
import * as adminController from './admin.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/events', authMiddleware, adminController.createEvent);

router.get('/events/:id/participants', authMiddleware, adminController.getEventParticipants);

export default router; 