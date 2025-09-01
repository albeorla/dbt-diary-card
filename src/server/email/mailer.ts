import nodemailer from 'nodemailer';
import { env } from '~/env';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendInviteEmail(to: string, link: string) {
  const html = `
    <div style="font-family: sans-serif;">
      <h2>You're invited to DBT Diary Card</h2>
      <p>Click the link below to join the organization:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link will expire in 7 days.</p>
    </div>
  `;
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'DBT Diary Card Invitation',
    html,
  });
}
