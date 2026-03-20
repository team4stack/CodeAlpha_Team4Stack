'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  CookieConsentLevel,
  clearOptionalPreferenceStorage,
  getCookieConsent,
  setCookieConsent
} from '@/lib/cookies/consent';
import { clearAuthSessionCookie } from '@/lib/cookies/authSessionCookie';

export default function CookiePreferencesPanel() {
  const [level, setLevel] = useState<CookieConsentLevel>('pending');

  const refresh = useCallback(() => {
    setLevel(getCookieConsent());
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('cookie_consent_changed', onChange);
    return () => window.removeEventListener('cookie_consent_changed', onChange);
  }, [refresh]);

  const applyEssential = (msg: string) => {
    setCookieConsent('essential');
    clearAuthSessionCookie();
    clearOptionalPreferenceStorage();
    toast.success(msg);
    refresh();
  };

  const onNecessaryOnly = () => {
    applyEssential('Necessary cookies only — saved.');
  };

  const onRejectAll = () => {
    applyEssential('Optional storage declined — only what the site needs will be used.');
  };

  const onAcceptAll = () => {
    setCookieConsent('functional');
    toast.success('Thanks — your preferences are saved.');
    refresh();
  };

  const resetChoice = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('cookie_consent_changed', { detail: 'pending' }));
      toast('The cookie banner will appear again when you open the site.', { icon: 'ℹ️' });
      refresh();
    } catch {
      toast.error('Could not reset preferences');
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-lg shadow-black/20 backdrop-blur-sm md:p-8">
      <h2 className="text-lg font-semibold text-white md:text-xl">Your choices</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
        Current setting:{' '}
        <strong className="text-cyan-300">
          {level === 'pending'
            ? 'Not chosen yet — the banner will ask when you browse'
            : level === 'essential'
              ? 'Necessary only / rejected optional'
              : 'Accept all (full experience on this device)'}
        </strong>
      </p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-3">
        <button
          type="button"
          onClick={onRejectAll}
          className="w-full rounded-xl border border-red-500/35 bg-red-950/25 px-4 py-3 text-sm font-medium text-red-100 transition hover:border-red-400/45 hover:bg-red-950/40 sm:w-auto sm:min-w-[9rem]"
        >
          Reject all
        </button>
        <button
          type="button"
          onClick={onNecessaryOnly}
          className="w-full rounded-xl border border-white/20 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 sm:w-auto sm:min-w-[9rem]"
        >
          Necessary only
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/25 transition hover:brightness-110 sm:w-auto sm:min-w-[9rem]"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={resetChoice}
          className="w-full rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/55 transition hover:border-white/35 hover:text-white/80 sm:ml-0 sm:w-auto"
        >
          Reset &amp; show banner again
        </button>
      </div>
    </div>
  );
}
