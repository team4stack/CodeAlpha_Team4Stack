'use client'

import React from 'react';
import MainNavbar from '@/navigation/MainNavbar';
import { MainFooter } from '@/shared/components/Footer';
import WhatsAppButton from '@/components/utilities/WhatsAppButton';
import PWAInstallPrompt from '@/modals/PWAInstallPrompt';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <MainNavbar />
      <main className="responsive-main">
        {children}
      </main>
      <MainFooter />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </>
  );
}
