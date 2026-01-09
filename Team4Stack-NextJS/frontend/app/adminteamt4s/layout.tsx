'use client'

import { usePathname } from 'next/navigation';
import { TeamAdminLayout } from '@/modules/team/admin/components/TeamAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap login page with admin layout
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }
  
  return <TeamAdminLayout>{children}</TeamAdminLayout>;
}
