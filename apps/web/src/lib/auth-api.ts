import type { AuthResult, AuthUser, LoginInput, RegisterInput } from '@travel/types';
import { API_URL } from './api-client';

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json?.error?.message ?? 'Request failed');
  }
  return json.data as T;
}

export const authApi = {
  login: (input: LoginInput) => authRequest<AuthResult>('/auth/login', input),
  register: (input: RegisterInput) => authRequest<AuthResult>('/auth/register', input),
  refresh: () => authRequest<AuthResult>('/auth/refresh'),
  logout: () => authRequest<{ success?: boolean } | null>('/auth/logout').catch(() => null),
  forgotPassword: (email: string) => authRequest('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    authRequest('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => authRequest<AuthUser>('/auth/verify-email', { token }),
  resendVerification: (email: string) =>
    authRequest('/auth/resend-verification', { email }),
};
