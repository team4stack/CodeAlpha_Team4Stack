'use client'

import React from 'react';

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  return (
    <>
      <main className="responsive-main">
        {children}
      </main>
      {/* Footer is already rendered in app/(main)/layout.tsx */}
      {/* WhatsAppButton and PWAInstallPrompt are also in main layout */}
    </>
  );
}
