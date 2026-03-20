'use client';

import { useEffect, useState } from 'react';
import { coursesApi } from '@/lib/api';
import type { AppUser } from '@/contexts/AuthContext';
import { userHasApprovedCourseApplication } from '@/lib/courses/admissionApproved';

export function useApprovedCourseStudent(user: AppUser | null, authLoading: boolean) {
  const [isApprovedStudent, setIsApprovedStudent] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setIsApprovedStudent(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    void (async () => {
      try {
        const result = await coursesApi.getAdmissionForms({
          email: user.email!.toLowerCase().trim()
        });
        if (cancelled) return;
        const list = (result.data || []) as Record<string, unknown>[];
        setIsApprovedStudent(userHasApprovedCourseApplication(list));
      } catch {
        if (!cancelled) setIsApprovedStudent(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.email, authLoading]);

  return { isApprovedStudent, checking };
}
