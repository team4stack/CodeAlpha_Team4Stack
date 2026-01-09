'use client'

import { usePathname } from 'next/navigation';
import { SuperAdminLayout } from '@/modules/superadmin/components/SuperAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap login page with admin layout
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }
  
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
