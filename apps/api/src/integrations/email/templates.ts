import { APP } from '@travel/config/constants';
import type { EmailMessage } from './email.types';

const PRIMARY = '#006C35';
const GOLD = '#D4AF37';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px -8px rgba(17,24,39,.12);">
          <tr><td style="background:${PRIMARY};padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(APP.name)}</span>
            <span style="display:inline-block;width:24px;height:3px;background:${GOLD};vertical-align:middle;margin-left:8px;"></span>
          </td></tr>
          <tr><td style="padding:32px;">${bodyHtml}</td></tr>
          <tr><td style="padding:20px 32px;background:#F1F5F9;color:#64748B;font-size:12px;">
            © ${APP.legalName}. All rights reserved.<br />${escapeHtml(APP.address.line1)}, ${escapeHtml(APP.address.city)}, ${escapeHtml(APP.address.country)}.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;">${escapeHtml(label)}</a>`;
}

export function renderWelcomeEmail(to: string, params: { firstName: string }): EmailMessage {
  const name = escapeHtml(params.firstName);
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;">Welcome, ${name} 👋</h1>
    <p style="margin:0 0 16px;line-height:1.6;color:#334155;">
      Your ${escapeHtml(APP.name)} account is ready. Explore luxury Hajj & Umrah packages,
      curated Saudi tours, hotels, flights and visa services — all in one place.
    </p>
    <p style="margin:24px 0;">${button(APP.social.instagram, 'Start exploring')}</p>`;
  return {
    to,
    subject: `Welcome to ${APP.name}`,
    html: layout('Welcome', body),
    text: `Welcome, ${params.firstName}! Your ${APP.name} account is ready.`,
  };
}

export function renderVerificationEmail(
  to: string,
  params: { firstName: string; verifyUrl: string },
): EmailMessage {
  const name = escapeHtml(params.firstName);
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;">Confirm your email</h1>
    <p style="margin:0 0 16px;line-height:1.6;color:#334155;">
      Hi ${name}, thanks for joining ${escapeHtml(APP.name)}. Please confirm this is your
      email address to activate your account. This link expires in 24 hours.
    </p>
    <p style="margin:24px 0;">${button(params.verifyUrl, 'Verify my email')}</p>
    <p style="margin:0;font-size:13px;color:#94A3B8;word-break:break-all;">${escapeHtml(params.verifyUrl)}</p>`;
  return {
    to,
    subject: `Verify your ${APP.name} email`,
    html: layout('Verify your email', body),
    text: `Confirm your email to activate your ${APP.name} account: ${params.verifyUrl}`,
  };
}

export function renderPasswordResetEmail(
  to: string,
  params: { firstName: string; resetUrl: string },
): EmailMessage {
  const name = escapeHtml(params.firstName);
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;">Reset your password</h1>
    <p style="margin:0 0 16px;line-height:1.6;color:#334155;">
      Hi ${name}, we received a request to reset your password. This link expires in 1 hour.
      If you didn't request it, you can safely ignore this email.
    </p>
    <p style="margin:24px 0;">${button(params.resetUrl, 'Reset password')}</p>
    <p style="margin:0;font-size:13px;color:#94A3B8;word-break:break-all;">${escapeHtml(params.resetUrl)}</p>`;
  return {
    to,
    subject: `Reset your ${APP.name} password`,
    html: layout('Reset your password', body),
    text: `Reset your password: ${params.resetUrl}`,
  };
}
