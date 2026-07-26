'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { authApi } from '@/lib/auth-api';
import { AuthShell, Field } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordInner() {
  const t = useTranslations('auth');
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <AuthShell title={t('resetTitle')} subtitle={t('resetInvalidSubtitle')}>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            {t('forgotButton')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('resetTitle')} subtitle={t('resetSubtitle')}>
      {done ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-sm text-primary">
            {t('resetDone')}
          </div>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            {t('loginButton')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t('password')}>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t('loading') : t('resetButton')}
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          {t('backToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
