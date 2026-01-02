import { Router } from 'express';
import authRoutes from './auth.routes';
import entriesRoutes from './entries.routes';
import uploadRoutes from './upload.routes';
import userRoutes from './user.routes';
import premiumRoutes from './premium.routes';
import { apiLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/entries', entriesRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/premium', premiumRoutes);

export default router;

