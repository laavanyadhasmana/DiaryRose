// src/routes/premium.routes.ts
import express from 'express';
import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});
const prisma = new PrismaClient();

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user!.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium/cancel`,
      metadata: {
        userId: req.user!.id
      }
    });

    res.json({
      status: 'success',
      data: { sessionUrl: session.url }
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                isPremium: true,
                premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            });

            await prisma.subscription.create({
              data: {
                userId,
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
                status: 'ACTIVE',
                planId: session.metadata?.priceId || 'unknown'
              }
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: 'CANCELED' }
          });

          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id }
          });

          if (sub) {
            await prisma.user.update({
              where: { id: sub.userId },
              data: { isPremium: false }
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send('Webhook error');
    }
  }
);

export default router;
