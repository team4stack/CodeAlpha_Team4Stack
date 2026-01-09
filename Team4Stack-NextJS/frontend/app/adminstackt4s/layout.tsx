'use client'

import { usePathname } from 'next/navigation';
import { StackStoreAdminLayout } from '@/modules/stackstore/admin/components/StackStoreAdminLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't wrap login page with admin layout
  if (pathname?.includes('/login')) {
    return <>{children}</>;
  }
  
  return <StackStoreAdminLayout>{children}</StackStoreAdminLayout>;
}
