// src/routes/auth.routes.ts
import { Router } from 'express';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  verifyEmail,
  refreshToken,
  logout
} from '../controllers/auth.controller';
import { authLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;

