import { env } from '../../config/env';
import type { EmailMessage, EmailProvider } from './email.types';

/**
 * Resend (https://resend.com) email provider using the HTTP API rather than
 * SMTP — this is the reliable path on serverless runtimes (e.g. Vercel), which
 * can block or throttle outbound SMTP ports. Requires RESEND_API_KEY and a
 * verified MAIL_FROM_ADDRESS (or Resend's shared onboarding@resend.dev sender).
 */
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';

  async send(message: EmailMessage): Promise<void> {
    const attachments = message.attachments?.map((att) => ({
      filename: att.filename,
      content:
        typeof att.content === 'string'
          ? att.content
          : Buffer.from(att.content).toString('base64'),
    }));

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${env.MAIL_FROM_NAME} <${env.MAIL_FROM_ADDRESS}>`,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend API responded ${response.status}: ${detail}`);
    }
  }
}
