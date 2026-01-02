// src/routes/upload.routes.ts
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';
import { uploadLimiter } from '../middleware/ratelimit.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const storageService = new StorageService();

// Get presigned URL for image upload
router.post(
  '/image-url',
  authenticate,
  uploadLimiter,
  [
    body('fileName').notEmpty().withMessage('File name is required'),
    body('fileType').notEmpty().withMessage('File type is required'),
    validate
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      
      const result = await storageService.getUploadUrl(
        req.user!.id,
        fileName,
        fileType,
        'image'
      );

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get presigned URL for video upload
router.post(
  '/video-url',
  authenticate,
  uploadLimiter,
  [
    body('fileName').notEmpty().withMessage('File name is required'),
    body('fileType').notEmpty().withMessage('File type is required'),
    validate
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      
      const result = await storageService.getUploadUrl(
        req.user!.id,
        fileName,
        fileType,
        'video'
      );

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

