import nodemailer from 'nodemailer';
import { env } from '../configs/env';

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

export const sendMail = async (to: string, subject: string, text: string, html: string): Promise<void> => {
  if (!transporter) {
    // No SMTP configured: never leak links in production logs.
    if (env.NODE_ENV !== 'production') console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    else console.warn('SMTP is not configured; email was not sent');
    return;
  }
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, text, html });
  } catch (error) {
    // Callers decide whether a mail failure matters; keep the SMTP details in `cause` for the logs.
    throw new Error('Failed to send email', { cause: error });
  }
};

export const sendPasswordResetEmail = (to: string, name: string, link: string): Promise<void> =>
  sendMail(
    to,
    'Reset your password',
    `Hi ${name},\n\nUse this link to reset your password (valid for ${env.RESET_TOKEN_EXPIRES_MIN} minutes):\n${link}\n\nIf you didn't request this, ignore this email.`,
    `<p>Hi ${name.replace(/[<>&"]/g, '')},</p><p><a href="${link}">Reset your password</a> (valid for ${env.RESET_TOKEN_EXPIRES_MIN} minutes).</p><p>If you didn't request this, ignore this email.</p>`,
  );
