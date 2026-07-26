'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { authApi } from '@/lib/auth-api';
import { AuthShell, Field } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type State = 'verifying' | 'success' | 'error' | 'idle';

function VerifyEmailInner() {
  const t = useTranslations('auth');
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>(token ? 'verifying' : 'idle');
  const started = useRef(false);

  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

  async function onResend(e: FormEvent) {
    e.preventDefault();
    setResending(true);
    try {
      await authApi.resendVerification(email);
    } catch {
      /* never reveal whether the account exists */
    }
    setResent(true);
    setResending(false);
  }

  if (state === 'verifying') {
    return (
      <AuthShell title={t('verifyTitle')} subtitle={t('verifyChecking')}>
        <div className="py-6 text-center text-sm text-muted-foreground">{t('loading')}</div>
      </AuthShell>
    );
  }

  if (state === 'success') {
    return (
      <AuthShell title={t('verifySuccessTitle')} subtitle={t('verifySuccessSubtitle')}>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center text-sm text-primary">
          {t('verifySuccessBody')}
        </div>
        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            {t('backToLogin')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('verifyTitle')}
      subtitle={state === 'error' ? t('verifyErrorSubtitle') : t('verifyIdleSubtitle')}
    >
      {resent ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center text-sm text-primary">
          {t('verifyResent')}
        </div>
      ) : (
        <form onSubmit={onResend} className="space-y-4">
          <Field label={t('email')}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={resending}>
            {resending ? t('loading') : t('verifyResendButton')}
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
