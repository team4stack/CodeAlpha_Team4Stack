'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canUseFunctionalCookies } from '@/lib/cookies/consent';

/** Routes to warm in the background so the next navigation is often instant (RSC payload prefetched). */
const PREFETCH_ROUTES = ['/', '/courses', '/contact', '/privacy', '/cookies'] as const;

function schedulePrefetch(run: () => void): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => run(), { timeout: 2500 });
  } else {
    setTimeout(run, 300);
  }
}

/**
 * When the user has chosen Accept all, prefetch main app routes during idle time
 * and again when consent flips to functional.
 */
export default function FunctionalPerformanceBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const warm = () => {
      if (!canUseFunctionalCookies()) return;
      schedulePrefetch(() => {
        for (const path of PREFETCH_ROUTES) {
          try {
            router.prefetch(path);
          } catch {
            // ignore
          }
        }
      });
    };

    warm();
    const onConsent = () => warm();
    window.addEventListener('cookie_consent_changed', onConsent);
    return () => window.removeEventListener('cookie_consent_changed', onConsent);
  }, [router]);

  return null;
}
