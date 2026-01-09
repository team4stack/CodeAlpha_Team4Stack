'use client'

import { usePathname } from 'next/navigation';
import { LandingAdminLayout } from '@/modules/landing/admin/components/LandingAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap login page with admin layout
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }
  
  return <LandingAdminLayout>{children}</LandingAdminLayout>;
}
