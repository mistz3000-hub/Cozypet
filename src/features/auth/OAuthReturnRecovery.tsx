'use client';

import { useEffect } from 'react';
import { safeNext } from '@/lib/safe-next';

/** Supabase can fall back to Site URL after OAuth when a local callback is not allowlisted.
 * If that lands on the home page with a PKCE code, hand it to the server callback route. */
export function OAuthReturnRecovery() {
  useEffect(() => {
    const current = new URL(window.location.href);
    if (current.pathname !== '/') return;
    const code = current.searchParams.get('code');
    if (!code) return;

    const callback = new URL('/auth/callback', current.origin);
    callback.searchParams.set('code', code);
    callback.searchParams.set('next', safeNext(current.searchParams.get('next'), '/'));
    window.location.replace(callback.toString());
  }, []);

  return null;
}
