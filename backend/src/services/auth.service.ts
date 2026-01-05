// backend/src/services/auth.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';
import { sendEmail } from './email.service';

const prisma = new PrismaClient();

export class AuthService {
  async register(name: string, email: string, password: string) {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || '12')
    );

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        verificationToken,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isPremium: true,
        createdAt: true
      }
    });

    // 5. Send Verification Email (With Safety Net)
    try {
      console.log(`Attempting to send email to ${email}...`);
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        html: `
          <h1>Welcome to DiaryRose!</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">
            Verify Email
          </a>
        `
      });
      console.log('✅ Email sent successfully');
    } catch (error: any) {
      // Log the error but DO NOT crash the registration
      console.error('❌ Email failed to send:', error.message);
      console.error('This is expected if email keys are missing or invalid.');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        emailVerified: user.emailVerified
      },
      accessToken,
      refreshToken
    };
  }

  // --- Helper Methods (FIXED TO REMOVE RED SQUIGGLIES) ---

  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any } // Fixed casting
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any } // Fixed casting
    );

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return token;
  }

  // Keep other methods if needed (verifyEmail, etc.)
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) throw new AppError('Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });

    return { message: 'Email verified successfully' };
  }
}