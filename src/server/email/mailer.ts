import nodemailer from 'nodemailer';
import { env } from '~/env';

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendInviteEmail(to: string, link: string) {
  const brandColor = '#4f46e5';
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; background: #f8fafc; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
      <tr>
        <td style="background: ${brandColor}; padding: 16px 20px; color: #fff;">
          <h1 style="margin: 0; font-size: 18px;">DBT Diary Card</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; color: #0f172a;">
          <h2 style="margin: 0 0 12px; font-size: 20px;">You’re invited</h2>
          <p style="margin: 0 0 16px; line-height: 1.5;">Click the button below to join your organization.</p>
          <p style="margin: 0 0 16px;">
            <a href="${link}" style="display: inline-block; background: ${brandColor}; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">Accept invite</a>
          </p>
          <p style="margin: 0 0 16px; color: #475569;">If the button doesn’t work, copy and paste this link into your browser:</p>
          <p style="margin: 0 0 8px; word-break: break-all;"><a href="${link}">${link}</a></p>
          <p style="margin: 16px 0 0; color: #475569;">This link expires in 7 days.</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 20px; color: #64748b; font-size: 12px; background: #f8fafc; border-top: 1px solid #e5e7eb;">
          © ${new Date().getFullYear()} DBT Diary Card
        </td>
      </tr>
    </table>
  </div>`;
  const text = `You're invited to DBT Diary Card. Accept invite: ${link}\n\nThis link expires in 7 days.`;
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'DBT Diary Card Invitation',
    html,
    text,
  });
}
