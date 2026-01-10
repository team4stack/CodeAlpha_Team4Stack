'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import MainNavbar from '@/navigation/MainNavbar';
import { MainFooter } from '@/shared/components/Footer';
import WhatsAppButton from '@/components/utilities/WhatsAppButton';
import PWAInstallPrompt from '@/modals/PWAInstallPrompt';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Hide MainNavbar on courses pages (courses navbar is rendered in CoursesPage)
  const isCoursesPage = pathname?.startsWith('/courses') || pathname?.startsWith('/student');
  
  return (
    <>
      {!isCoursesPage && <MainNavbar />}
      <main className="responsive-main">
        {children}
      </main>
      <MainFooter />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </>
  );
}
