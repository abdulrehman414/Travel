import type { Paginated } from '@travel/types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('Unexpected server response', res.status);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.error?.message ?? 'Request failed', res.status, json.error?.code);
  }
  return json.data as T;
}

/** Server-side fetch that never throws — returns a fallback if the API is down. */
export async function apiFetchSafe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path, { cache: 'no-store' });
  } catch {
    return fallback;
  }
}

export type { Paginated };
