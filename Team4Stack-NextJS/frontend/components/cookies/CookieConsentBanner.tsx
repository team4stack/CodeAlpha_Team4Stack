'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  clearOptionalPreferenceStorage,
  hasAnsweredConsent,
  setCookieConsent,
  syncSignInIdentityFromAuthSessionLocalStorage
} from '@/lib/cookies/consent';
import { clearAuthSessionCookie, setAuthSessionCookieIfAllowed } from '@/lib/cookies/authSessionCookie';
import { parseStoredClientAuthSession } from '@/lib/security/clientAuthSession';

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a1 1 0 0 1 1 1v1.06A8 8 0 0 1 20.94 11H22a1 1 0 0 1 0 2h-1.06A8 8 0 0 1 13 20.94V22a1 1 0 0 1-2 0v-1.06A8 8 0 0 1 3.06 13H2a1 1 0 0 1 0-2h1.06A8 8 0 0 1 11 4.06V3a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1.25" fill="currentColor" className="opacity-80" />
      <circle cx="14" cy="10" r="1.25" fill="currentColor" className="opacity-80" />
      <circle cx="11.5" cy="14.5" r="1" fill="currentColor" className="opacity-60" />
    </svg>
  );
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(() => {
    setVisible(typeof window !== 'undefined' && !hasAnsweredConsent());
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('cookie_consent_changed', onChange);
    return () => window.removeEventListener('cookie_consent_changed', onChange);
  }, [refresh]);

  const runEssential = (message: string) => {
    setCookieConsent('essential');
    clearAuthSessionCookie();
    clearOptionalPreferenceStorage();
    setVisible(false);
    toast.success(message, { duration: 3600 });
  };

  const onNecessaryOnly = () => {
    runEssential('Necessary cookies only. Your choice has been saved.');
  };

  const onRejectAll = () => {
    runEssential('All optional data storage declined. Only what the site needs will be used.');
  };

  const onAcceptAll = () => {
    setCookieConsent('functional');
    try {
      const raw = localStorage.getItem('auth_session');
      const s = parseStoredClientAuthSession(raw);
      if (s) {
        setAuthSessionCookieIfAllowed({
          access_token: s.access_token,
          refresh_token: s.refresh_token,
          expires_at: s.expires_at
        });
      }
    } catch {
      // ignore
    }
    syncSignInIdentityFromAuthSessionLocalStorage();
    setVisible(false);
    toast.success('Thanks — your preferences are saved.', {
      duration: 3000
    });
  };

  if (!visible) return null;

  const btnBase =
    'relative min-h-[3rem] rounded-xl px-4 py-3 text-center text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]';

  return (
    <div
      className="cookie-consent-bar pointer-events-none fixed inset-x-0 bottom-0 z-[10000] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-5 sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Cookie preferences"
        className="pointer-events-auto relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_-24px_80px_-12px_rgba(0,0,0,0.75),0_0_60px_-20px_rgba(34,211,238,0.15)] backdrop-blur-2xl sm:rounded-3xl"
      >
        {/* Top accent line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
          aria-hidden
        />

        <div className="flex flex-col gap-6 p-5 sm:p-6 md:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {/* Copy */}
          <div className="flex min-w-0 flex-1 basis-0 gap-4 lg:gap-5">
            <div
              className="hidden shrink-0 sm:flex sm:h-14 sm:w-14 sm:items-center sm:justify-center sm:rounded-2xl sm:bg-gradient-to-br sm:from-cyan-500/15 sm:to-teal-600/10 sm:text-cyan-300 sm:ring-1 sm:ring-cyan-400/20"
              aria-hidden
            >
              <CookieIcon className="h-7 w-7 opacity-90" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-2 sm:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/25">
                  <CookieIcon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold tracking-tight text-white">Cookies &amp; your experience</h2>
              </div>
              <h2 className="hidden text-lg font-semibold tracking-tight text-white sm:block md:text-xl">
                Cookies &amp; your experience
              </h2>
              <div className="max-w-prose space-y-2.5 break-words text-sm leading-relaxed text-zinc-400 sm:text-[0.9375rem]">
                <p>
                  We use storage so the site works safely and you can use your account. If you choose{' '}
                  <span className="font-medium text-zinc-300">Accept all</span>, we also keep what is needed on this device so
                  coming back is easier — without listing every technical detail here.
                </p>
                <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  We do not sell your data.{' '}
                  <Link
                    href="/cookies"
                    className="font-medium text-cyan-400/95 underline decoration-cyan-500/40 underline-offset-[3px] transition hover:text-cyan-300 hover:decoration-cyan-400/70"
                  >
                    Cookies Policy
                  </Link>
                  {' · '}
                  <Link
                    href="/privacy"
                    className="font-medium text-cyan-400/95 underline decoration-cyan-500/40 underline-offset-[3px] transition hover:text-cyan-300 hover:decoration-cyan-400/70"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Actions — grouped glass rail */}
          <div className="flex w-full shrink-0 flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-2 lg:w-auto lg:max-w-[min(100%,26rem)] lg:flex-nowrap lg:justify-end lg:gap-2 lg:p-2.5 xl:max-w-none">
            <button type="button" onClick={onRejectAll} className={`${btnBase} w-full border border-red-500/25 bg-red-950/30 text-red-100/95 hover:border-red-400/40 hover:bg-red-950/50 sm:flex-1 lg:w-auto lg:min-w-[7.5rem] lg:flex-none`}>
              Reject all
            </button>
            <button
              type="button"
              onClick={onNecessaryOnly}
              className={`${btnBase} w-full border border-white/15 bg-white/[0.06] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/25 hover:bg-white/[0.1] sm:flex-1 lg:w-auto lg:min-w-[7.5rem] lg:flex-none`}
            >
              Necessary only
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className={`${btnBase} w-full border border-emerald-400/35 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 font-semibold text-white shadow-[0_0_32px_-8px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:border-emerald-300/45 hover:brightness-[1.05] focus-visible:!ring-emerald-400/80 sm:flex-1 lg:w-auto lg:min-w-[8.5rem] lg:flex-none lg:px-6`}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
