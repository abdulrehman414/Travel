'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-client';

type Field = 'name' | 'email' | 'phone' | 'subject' | 'message';

export function ContactForm() {
  const t = useTranslations('contactPage');
  const [form, setForm] = useState<Record<Field, string>>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const set = (key: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      await apiFetch('/contact', { method: 'POST', body: JSON.stringify(form) });
      setState('done');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <p className="font-semibold text-primary">{t('success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input required placeholder={t('formName')} value={form.name} onChange={set('name')} />
        <Input required type="email" placeholder={t('formEmail')} value={form.email} onChange={set('email')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder={t('formPhone')} value={form.phone} onChange={set('phone')} />
        <Input required placeholder={t('formSubject')} value={form.subject} onChange={set('subject')} />
      </div>
      <textarea
        required
        rows={5}
        placeholder={t('formMessage')}
        value={form.message}
        onChange={set('message')}
        className="w-full rounded-lg border border-input bg-background p-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {state === 'error' && <p className="text-sm text-danger-600">{t('error')}</p>}
      <Button type="submit" size="lg" disabled={state === 'loading'}>
        <Send className="size-4" /> {t('send')}
      </Button>
    </form>
  );
}
