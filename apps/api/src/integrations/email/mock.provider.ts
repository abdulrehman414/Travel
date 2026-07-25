import { logger } from '../../config/logger';
import type { EmailMessage, EmailProvider } from './email.types';

/** Fallback provider when SMTP is not configured (or during tests). */
export class MockEmailProvider implements EmailProvider {
  readonly name = 'mock';

  async send(message: EmailMessage): Promise<void> {
    logger.info(
      { to: message.to, subject: message.subject },
      '[MockEmail] email captured (no SMTP configured)',
    );
  }
}
