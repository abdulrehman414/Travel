'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from './auth-provider';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleIdApi {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdApi;
  }
}

/**
 * "Continue with Google" button backed by Google Identity Services. Renders
 * nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is absent, so it's safe in any
 * environment. On success it exchanges the Google credential (ID token) with
 * our API and lands the user in their dashboard.
 */
export function GoogleSignInButton() {
  const t = useTranslations('auth');
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const el = ref.current;

    function init() {
      if (!window.google || !el) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID as string,
        callback: (response) => {
          if (!response.credential) return;
          loginWithGoogle(response.credential)
            .then(() => router.push('/dashboard'))
            .catch(() => setError(t('genericError')));
        },
      });
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
        logo_alignment: 'center',
      });
    }

    if (window.google) {
      init();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script?.removeEventListener('load', init);
  }, [loginWithGoogle, router, t]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className="flex min-h-[44px] justify-center" />
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
