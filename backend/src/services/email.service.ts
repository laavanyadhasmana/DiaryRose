import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY || ''
  }
});

export async function sendEmail(options: Mail.Options) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  Email not configured, skipping send');
    return;
  }

  try {
    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'DiaryRose'} <${process.env.EMAIL_FROM || 'noreply@diaryrose.com'}>`,
      ...options
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}