import { Suspense } from 'react';
import UnifiedApplyPage from '@/modules/courses/pages/UnifiedApplyPage';

export default function Apply() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0a0f1f] flex items-center justify-center text-gray-400">Loading…</div>}>
      <UnifiedApplyPage />
    </Suspense>
  );
}
