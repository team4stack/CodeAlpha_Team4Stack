'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import MainNavbar from '@/navigation/MainNavbar';
import { MainFooter } from '@/shared/components/Footer';
import WhatsAppButton from '@/components/utilities/WhatsAppButton';
import CoursesChatBot from '@/components/utilities/CoursesChatBot';
import PWAInstallPrompt from '@/modals/PWAInstallPrompt';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const isCoursesPage = pathname?.startsWith('/courses') || pathname?.startsWith('/student');
  const isStudentCourseViewPage = Boolean(pathname?.startsWith('/student/courses/'));
  const showCoursesChatBot =
    pathname === '/student' ||
    pathname === '/student/courses' ||
    pathname === '/courses';
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      {!isCoursesPage && !isLoginPage && <MainNavbar />}
      <main className={`responsive-main ${isStudentCourseViewPage ? 'min-h-0!' : ''} ${isCoursesPage ? 't4s-courses-glass' : ''} ${isLoginPage ? 't4s-login-main' : ''}`}>
        {children}
      </main>
      {!isLoginPage && <MainFooter />}
      {isLandingPage && <WhatsAppButton />}
      {showCoursesChatBot && <CoursesChatBot />}
      <PWAInstallPrompt />
    </>
  );
}
