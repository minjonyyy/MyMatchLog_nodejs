import express from 'express';
import * as eventController from './event.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', eventController.getEvents);

router.get('/:id', eventController.getEventById);

router.post(
  '/:id/participate',
  authMiddleware,
  eventController.participateInEvent,
);

export default router;
