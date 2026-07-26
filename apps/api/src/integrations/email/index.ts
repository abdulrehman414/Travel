import { env, isTest } from '../../config/env';
import { logger } from '../../config/logger';
import type { EmailMessage, EmailProvider } from './email.types';
import { NodemailerProvider } from './nodemailer.provider';
import { ResendProvider } from './resend.provider';
import { MockEmailProvider } from './mock.provider';
import {
  renderPasswordResetEmail,
  renderVerificationEmail,
  renderWelcomeEmail,
} from './templates';

function selectProvider(): EmailProvider {
  if (isTest) return new MockEmailProvider();
  // Prefer Resend (HTTP API) when configured — best for serverless.
  if (env.RESEND_API_KEY) return new ResendProvider();
  // Fall back to SMTP (Mailhog in dev, or any SMTP host in prod).
  if (env.SMTP_HOST) return new NodemailerProvider();
  return new MockEmailProvider();
}

const provider = selectProvider();

/**
 * Resilient email service. Sends never throw to the caller — failures are
 * logged and reported via the boolean result, so business flows (registration,
 * password reset) are never blocked by transient mail issues.
 */
export const emailService = {
  provider,

  async send(message: EmailMessage): Promise<boolean> {
    try {
      await provider.send(message);
      return true;
    } catch (error) {
      logger.error({ error, to: message.to, subject: message.subject }, 'Failed to send email');
      return false;
    }
  },

  sendWelcome(to: string, params: { firstName: string }): Promise<boolean> {
    return this.send(renderWelcomeEmail(to, params));
  },

  sendVerification(to: string, params: { firstName: string; verifyUrl: string }): Promise<boolean> {
    return this.send(renderVerificationEmail(to, params));
  },

  sendPasswordReset(to: string, params: { firstName: string; resetUrl: string }): Promise<boolean> {
    return this.send(renderPasswordResetEmail(to, params));
  },
};

export type EmailService = typeof emailService;
export type { EmailMessage, EmailProvider } from './email.types';
