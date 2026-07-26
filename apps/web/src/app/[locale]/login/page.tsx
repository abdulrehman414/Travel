'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { Link, useRouter } from '@/i18n/navigation';
import { AuthShell, Field } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, rememberMe: true });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('loginTitle')} subtitle={t('loginSubtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={t('email')}>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t('password')}>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? t('loading') : t('loginButton')}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t('orContinue')}
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton />
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          {t('forgotLink')}
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          {t('registerLink')}
        </Link>
      </div>
    </AuthShell>
  );
}
