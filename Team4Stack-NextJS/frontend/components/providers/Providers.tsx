'use client'

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeManager from '@/themes/ThemeManager';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import FunctionalPerformanceBootstrap from '@/components/performance/FunctionalPerformanceBootstrap';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeManager />
        <FunctionalPerformanceBootstrap />
        {children}
        <Toaster
          position="top-right"
          containerClassName="!top-4"
          toastOptions={{
            duration: 3200,
            className: '!text-sm !font-medium !shadow-xl !rounded-xl !border !border-white/10',
            style: {
              background: 'linear-gradient(145deg, #18181b 0%, #27272a 100%)',
              color: '#fafafa',
              maxWidth: 'min(420px, calc(100vw - 2rem))'
            },
            success: {
              duration: 3200,
              iconTheme: {
                primary: '#22d3ee',
                secondary: '#0c0c0e'
              }
            },
            error: {
              duration: 4500,
              iconTheme: {
                primary: '#f87171',
                secondary: '#0c0c0e'
              }
            }
          }}
        />
        <CookieConsentBanner />
      </AuthProvider>
    </ThemeProvider>
  );
}
