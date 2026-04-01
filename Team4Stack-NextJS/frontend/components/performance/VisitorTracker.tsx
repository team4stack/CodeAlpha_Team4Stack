'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api';
import {
  canUseFunctionalCookies,
  VISITOR_ID_STORAGE_KEY,
  VISITOR_SESSION_STORAGE_KEY
} from '@/lib/cookies/consent';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getOrCreateStorageId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const created = generateUuid();
  storage.setItem(key, created);
  return created;
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef<string>('');
  const routeKey = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname || '/';
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const track = async () => {
      if (!canUseFunctionalCookies()) return;

      try {
        const visitorId = getOrCreateStorageId(localStorage, VISITOR_ID_STORAGE_KEY);
        const sessionId = getOrCreateStorageId(sessionStorage, VISITOR_SESSION_STORAGE_KEY);
        const pageUrl = new URL(window.location.href);
        pageUrl.hash = '';

        const colorScheme: 'light' | 'dark' = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const payload = {
          visitorId,
          sessionId,
          consentLevel: 'functional' as const,
          pagePath: `${pageUrl.pathname}${pageUrl.search}`.slice(0, 512),
          pageUrl: pageUrl.toString(),
          pageTitle: document.title || 'Team4Stack',
          referrer: document.referrer || undefined,
          language: navigator.language || undefined,
          languages: Array.isArray(navigator.languages) ? navigator.languages.slice(0, 5) : undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          screenWidth: window.screen?.width,
          screenHeight: window.screen?.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          colorScheme,
          cookieEnabled: navigator.cookieEnabled,
          touchPoints: navigator.maxTouchPoints || 0,
          hardwareConcurrency:
            typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : undefined,
          platform: navigator.platform || undefined,
        };

        if (cancelled) return;
        await publicApi.trackVisitorEvent(payload);
      } catch {
        // Silent fail - analytics must never break the site.
      }
    };

    const maybeTrack = () => {
      if (!canUseFunctionalCookies()) return;
      if (lastTrackedKeyRef.current === routeKey) return;
      lastTrackedKeyRef.current = routeKey;
      void track();
    };

    maybeTrack();

    const onConsentChanged = () => {
      if (!canUseFunctionalCookies()) {
        lastTrackedKeyRef.current = '';
        return;
      }
      lastTrackedKeyRef.current = '';
      void track();
    };

    window.addEventListener('cookie_consent_changed', onConsentChanged);
    return () => {
      cancelled = true;
      window.removeEventListener('cookie_consent_changed', onConsentChanged);
    };
  }, [routeKey]);

  return null;
}
