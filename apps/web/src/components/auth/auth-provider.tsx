'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResult, AuthUser, LoginInput, RegisterInput } from '@travel/types';
import { API_URL } from '@/lib/api-client';
import { authApi } from '@/lib/auth-api';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const tokenRef = useRef<string | null>(null);

  const apply = useCallback((result: AuthResult) => {
    tokenRef.current = result.tokens.accessToken;
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  useEffect(() => {
    authApi
      .refresh()
      .then(apply)
      .catch(() => setStatus('unauthenticated'));
  }, [apply]);

  const login = useCallback(
    async (input: LoginInput) => {
      apply(await authApi.login(input));
    },
    [apply],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      apply(await authApi.register(input));
    },
    [apply],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      apply(await authApi.google(idToken));
    },
    [apply],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenRef.current = null;
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const authFetch = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const run = (token: string | null) =>
        fetch(`${API_URL}${path}`, {
          ...init,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers ?? {}),
          },
        });

      let res = await run(tokenRef.current);
      if (res.status === 401) {
        try {
          const refreshed = await authApi.refresh();
          apply(refreshed);
          res = await run(refreshed.tokens.accessToken);
        } catch {
          setUser(null);
          setStatus('unauthenticated');
        }
      }

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? 'Request failed');
      }
      return json.data as T;
    },
    [apply],
  );

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, loginWithGoogle, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
