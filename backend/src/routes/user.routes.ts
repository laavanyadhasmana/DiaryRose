// src/routes/user.routes.ts
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';

const router = Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isPremium: true,
        premiumExpiresAt: true,
        emailVerified: true,
        settings: true,
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch(
  '/me',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('avatarUrl').optional().isURL(),
    validate
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const { name, avatarUrl } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name && { name }),
          ...(avatarUrl && { avatarUrl })
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isPremium: true
        }
      });

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update password
router.patch(
  '/me/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
    validate
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      });

      const isValid = await bcrypt.compare(currentPassword, user!.passwordHash);

      if (!isValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: req.user!.id },
        data: { passwordHash }
      });

      res.json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update settings
router.patch(
  '/me/settings',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { settings: req.body }
      });

      res.json({
        status: 'success',
        data: { settings: user.settings }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete account
router.delete('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Soft delete all entries first
    await prisma.entry.updateMany({
      where: { userId: req.user!.id },
      data: { deletedAt: new Date() }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: req.user!.id }
    });

    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

