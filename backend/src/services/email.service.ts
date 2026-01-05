// backend/src/services/email.service.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 1. Core function to send emails via Gmail
export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your real Gmail address
      pass: process.env.EMAIL_PASS  // Your 16-character App Password
    }
  });

  const mailOptions = {
    from: `"DiaryRose Support" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Important: We THROW the error so auth.service.ts knows it failed
    // (auth.service.ts will then catch it and log it without crashing)
    throw error;
  }
};

// 2. Class for specific email templates
export class EmailService {
  async sendVerificationEmail(to: string, name: string, url: string) {
    await sendEmail({
      to,
      subject: 'Verify your DiaryRose Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Welcome to DiaryRose, ${name}!</h2>
          <p>Please verify your email address to secure your account.</p>
          <div style="margin: 20px 0;">
            <a href="${url}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or paste this link in your browser: <br/>${url}</p>
        </div>
      `
    });
  }

  async sendPasswordResetEmail(to: string, name: string, url: string) {
    await sendEmail({
      to,
      subject: 'Reset your DiaryRose Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>You requested a password reset. Click the button below to choose a new password.</p>
          <div style="margin: 20px 0;">
            <a href="${url}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link expires in 10 minutes.</p>
        </div>
      `
    });
  }
}