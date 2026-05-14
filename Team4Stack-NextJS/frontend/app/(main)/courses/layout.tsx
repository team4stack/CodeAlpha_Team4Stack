'use client'

import React from 'react';

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  return (
    <>
      {/* Use a div (not a second <main>) — (main)/layout already wraps the tree in <main> */}
      <div className="responsive-main min-h-0 w-full">
        {children}
      </div>
      {/* Footer is already rendered in app/(main)/layout.tsx */}
      {/* WhatsAppButton and PWAInstallPrompt are also in main layout */}
    </>
  );
}
