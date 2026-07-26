import { Router } from 'express';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@travel/types';
import { authController } from './auth.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimiter } from '../../middleware/rate-limit';

export const authRouter: Router = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRouter.post(
  '/google',
  authRateLimiter,
  validate({ body: googleLoginSchema }),
  asyncHandler(authController.loginWithGoogle),
);

authRouter.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refresh),
);

authRouter.post('/logout', asyncHandler(authController.logout));

authRouter.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail),
);

authRouter.post(
  '/resend-verification',
  authRateLimiter,
  validate({ body: resendVerificationSchema }),
  asyncHandler(authController.resendVerification),
);

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword),
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);

authRouter.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword),
);

authRouter.get('/me', authenticate, asyncHandler(authController.me));
