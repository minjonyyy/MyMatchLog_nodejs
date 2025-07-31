import express from 'express';
import * as ocrController from './ocr.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import uploadToS3 from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/parse-ticket',
  authMiddleware,
  uploadToS3('ticket_image'),
  ocrController.parseTicket,
);

export default router;
