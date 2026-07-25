'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/auth-provider';
import { Link, useRouter } from '@/i18n/navigation';
import { AuthShell, Field } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        locale: locale === 'ar' ? 'ar' : 'en',
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('registerTitle')} subtitle={t('registerSubtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('firstName')}>
            <Input required value={form.firstName} onChange={set('firstName')} />
          </Field>
          <Field label={t('lastName')}>
            <Input required value={form.lastName} onChange={set('lastName')} />
          </Field>
        </div>
        <Field label={t('email')}>
          <Input type="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label={t('phoneOptional')}>
          <Input value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label={t('password')}>
          <Input type="password" required value={form.password} onChange={set('password')} />
          <span className="mt-1 block text-xs text-muted-foreground">{t('passwordHint')}</span>
        </Field>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? t('loading') : t('registerButton')}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('loginLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
