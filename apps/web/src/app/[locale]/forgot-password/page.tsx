'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { authApi } from '@/lib/auth-api';
import { AuthShell, Field } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } catch {
      /* always show success — do not reveal account existence */
    }
    setDone(true);
    setLoading(false);
  }

  return (
    <AuthShell title={t('forgotTitle')} subtitle={t('forgotSubtitle')}>
      {done ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center text-sm text-primary">
          {t('forgotSent')}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label={t('email')}>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t('loading') : t('forgotButton')}
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
