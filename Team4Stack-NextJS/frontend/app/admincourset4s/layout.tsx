'use client'

import { usePathname } from 'next/navigation';
import { CoursesAdminLayout } from '@/modules/courses/admin/components/CoursesAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap login page with admin layout
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }
  
  return <CoursesAdminLayout>{children}</CoursesAdminLayout>;
}
