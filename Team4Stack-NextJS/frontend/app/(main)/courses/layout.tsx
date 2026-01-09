'use client'

import React from 'react';
import { utilities, modals } from '@/components';
import CoursesNavbar from '@/navigation/CoursesNavbar';
const { WhatsAppButton } = utilities;
const { PWAInstallPrompt } = modals;

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  return (
    <>
      <CoursesNavbar />
      <main className="responsive-main pt-16 md:pt-20">
        {children}
      </main>
      {/* Footer is already rendered in app/(main)/layout.tsx */}
      {/* WhatsAppButton and PWAInstallPrompt are also in main layout */}
    </>
  );
}
