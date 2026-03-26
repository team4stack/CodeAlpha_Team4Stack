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
  
  // Hide MainNavbar on courses/student pages (courses navbar is rendered in CoursesPage)
  const isCoursesPage = pathname?.startsWith('/courses') || pathname?.startsWith('/student');
  const isStudentCourseViewPage = Boolean(pathname?.startsWith('/student/courses/'));
  // Show chatbot only on student dashboard + student courses list + public courses page
  const showCoursesChatBot =
    pathname === '/student' ||
    pathname === '/student/courses' ||
    pathname === '/courses';
  // Show WhatsApp + Fiverr floating buttons only on landing (home) page
  const isLandingPage = pathname === '/';

  return (
    <>
      {!isCoursesPage && <MainNavbar />}
      <main className={`responsive-main ${isStudentCourseViewPage ? 'min-h-0!' : ''}`}>
        {children}
      </main>
      <MainFooter />
      {isLandingPage && <WhatsAppButton />}
      {showCoursesChatBot && <CoursesChatBot />}
      <PWAInstallPrompt />
    </>
  );
}
