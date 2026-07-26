import type { Request, Response } from 'express';
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@travel/types';
import { authService } from './auth.service';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from './auth.cookies';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

function requestMeta(req: Request): { userAgent?: string; ipAddress?: string } {
  const userAgent = req.headers['user-agent'];
  return { userAgent: typeof userAgent === 'string' ? userAgent : undefined, ipAddress: req.ip };
}

function readRefreshToken(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  const fromCookie = cookies?.[REFRESH_COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const body = req.body as { refreshToken?: string } | undefined;
  return body?.refreshToken;
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { result, refreshToken } = await authService.register(
      req.body as RegisterInput,
      requestMeta(req),
    );
    setRefreshCookie(res, refreshToken);
    sendCreated(res, result, 'Account created successfully');
  },

  async login(req: Request, res: Response): Promise<void> {
    const { result, refreshToken } = await authService.login(
      req.body as LoginInput,
      requestMeta(req),
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, result, 'Logged in successfully');
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const { result, refreshToken } = await authService.refresh(
      readRefreshToken(req),
      requestMeta(req),
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, result);
  },

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(readRefreshToken(req));
    clearRefreshCookie(res);
    sendNoContent(res);
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await authService.forgotPassword((req.body as ForgotPasswordInput).email);
    sendSuccess(res, { sent: true }, 'If an account exists, a reset link has been sent.');
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body as ResetPasswordInput;
    await authService.resetPassword(token, password);
    sendSuccess(res, { reset: true }, 'Password reset successfully.');
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const user = await authService.verifyEmail((req.body as VerifyEmailInput).token);
    sendSuccess(res, user, 'Email verified successfully.');
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    await authService.resendVerification((req.body as ResendVerificationInput).email);
    sendSuccess(res, { sent: true }, 'If your email needs verifying, a new link has been sent.');
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, { changed: true }, 'Password changed successfully.');
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const user = await authService.me(req.user.id);
    sendSuccess(res, user);
  },
};
