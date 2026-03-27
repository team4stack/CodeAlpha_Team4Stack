import { useEffect, useMemo, useState } from 'react';
import { coursesApi } from '@/lib/api';
import type { Course, Progress, StudentCourse, StudentStats } from '../types';

interface UseStudentDashboardDataArgs {
  userId?: string;
  userEmail?: string | null;
}

interface UseStudentDashboardDataResult {
  loading: boolean;
  rejectionMessage: string | null;
  setRejectionMessage: (msg: string | null) => void;
  enrolledCourses: StudentCourse[];
  stats: StudentStats;
}

interface AdmissionRow {
  approved?: boolean | null;
  approved_1?: boolean | null;
  approved_2?: boolean | null;
  course_name?: string | null;
  course_name_2?: string | null;
  rejection_message?: string | null;
}

export const useStudentDashboardData = ({
  userId,
  userEmail
}: UseStudentDashboardDataArgs): UseStudentDashboardDataResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [accessByCourseId, setAccessByCourseId] = useState<
    Record<string, { canAccess: boolean; admissionStatus: 'approved' | 'pending' }>
  >({});
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !userEmail) {
      setLoading(false);
      setCourses([]);
      setProgressMap({});
      setAccessByCourseId({});
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      setLoading(true);
      try {
        const result = await coursesApi.getAdmissionForms({
          email: userEmail.toLowerCase().trim()
        });

        if (!isMounted) return;

        const applicationData = Array.isArray(result.data)
          ? (result.data as AdmissionRow[]).find((app) => app.approved === false)
          : undefined;

        if (applicationData && applicationData.rejection_message) {
          setRejectionMessage(applicationData.rejection_message);
        } else {
          setRejectionMessage(null);
        }

        const applications = Array.isArray(result.data) ? (result.data as AdmissionRow[]) : [];
        const appError = result.error ? new Error(result.error) : null;

        if (appError) throw appError;

        if (!applications || applications.length === 0) {
          if (isMounted) {
            setCourses([]);
            setProgressMap({});
            setAccessByCourseId({});
          }
          return;
        }

        const approvedCourseNames = new Set<string>();
        const pendingCourseNames = new Set<string>();

        applications.forEach((app) => {
          const courseOne = app.course_name?.trim();
          const courseTwo = app.course_name_2?.trim();
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined;

          if (hasNewApprovals) {
            if (courseOne) {
              if (app.approved_1 === true) approvedCourseNames.add(courseOne);
              else if (app.approved_1 !== false) pendingCourseNames.add(courseOne);
            }
            if (courseTwo) {
              if (app.approved_2 === true) approvedCourseNames.add(courseTwo);
              else if (app.approved_2 !== false) pendingCourseNames.add(courseTwo);
            }
            return;
          }

          if (courseOne) {
            if (app.approved === true) approvedCourseNames.add(courseOne);
            else if (app.approved !== false) pendingCourseNames.add(courseOne);
          }
        });

        approvedCourseNames.forEach((courseName) => {
          pendingCourseNames.delete(courseName);
        });

        if (approvedCourseNames.size === 0 && pendingCourseNames.size === 0) {
          if (isMounted) {
            setCourses([]);
            setProgressMap({});
            setAccessByCourseId({});
          }
          return;
        }

        const coursesResult = await coursesApi.getAllCourses();
        if (!isMounted) return;

        if (coursesResult.error) {
          setCourses([]);
          setProgressMap({});
          return;
        }

        const allCourses = Array.isArray(coursesResult.data) ? coursesResult.data : [];
        const statusByTitle = new Map<string, 'approved' | 'pending'>();
        approvedCourseNames.forEach((name) => statusByTitle.set(name.toLowerCase(), 'approved'));
        pendingCourseNames.forEach((name) => {
          const normalized = name.toLowerCase();
          if (!statusByTitle.has(normalized)) statusByTitle.set(normalized, 'pending');
        });

        const enrolledCourses = allCourses.filter((course: any) => {
          const courseTitle = (course.title || course.name || '').trim();
          return statusByTitle.has(courseTitle.toLowerCase());
        });

        if (isMounted) {
          setCourses(enrolledCourses);
          const accessMap: Record<string, { canAccess: boolean; admissionStatus: 'approved' | 'pending' }> = {};
          enrolledCourses.forEach((course: any) => {
            const key = String(course.id);
            const title = String(course.title || course.name || '').trim().toLowerCase();
            const status = statusByTitle.get(title) || 'pending';
            accessMap[key] = {
              canAccess: status === 'approved',
              admissionStatus: status
            };
          });
          setAccessByCourseId(accessMap);
        }

        const progressResult = await coursesApi.getUserProgress(userId);
        if (!isMounted) return;

        const progressData = Array.isArray(progressResult.data) ? progressResult.data : [];
        const progressByCourse: Record<string, Progress> = {};

        progressData.forEach((record: any) => {
          const courseId = String(record.course_id);
          if (!progressByCourse[courseId]) {
            progressByCourse[courseId] = { completed: 0, total: 0 };
          }
          if (record.completed) {
            progressByCourse[courseId].completed += 1;
          }
        });

        enrolledCourses.forEach((c: any) => {
          const courseId = String(c.id);
          if (!progressByCourse[courseId]) {
            progressByCourse[courseId] = { completed: 0, total: 0 };
          }
        });

        const videoCounts = await Promise.all(
          enrolledCourses.map(async (c: any) => {
            try {
              const res = await coursesApi.getCourseVideos(Number(c.id));
              const list = Array.isArray(res.data) ? res.data : [];
              return { courseId: String(c.id), total: list.length };
            } catch {
              return { courseId: String(c.id), total: 0 };
            }
          })
        );

        videoCounts.forEach(({ courseId, total }) => {
          if (!progressByCourse[courseId]) {
            progressByCourse[courseId] = { completed: 0, total: 0 };
          }
          progressByCourse[courseId].total = total;
          if (progressByCourse[courseId].completed > total) {
            progressByCourse[courseId].completed = total;
          }
        });

        if (isMounted) {
          setProgressMap(progressByCourse);
        }
      } catch (err: any) {
        console.error('[StudentPage] Failed to load data', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId, userEmail]);

  const enrolledCourses = useMemo<StudentCourse[]>(
    () =>
      courses.map((course) => ({
        ...course,
        name: course.name || (course as any).title || 'Untitled Course',
        thumbnail_url: course.thumbnail_url || (course as any).image_url || undefined,
        image_url: course.image_url || (course as any).image_url || undefined,
        progress: progressMap[String(course.id)] || { completed: 0, total: 0 },
        canAccess: accessByCourseId[String(course.id)]?.canAccess ?? false,
        admissionStatus: accessByCourseId[String(course.id)]?.admissionStatus ?? 'pending'
      })),
    [courses, progressMap, accessByCourseId]
  );

  const stats = useMemo<StudentStats>(() => {
    const totalCourses = enrolledCourses.length;
    const coursesWithItems = enrolledCourses.filter((course) => course.progress.total > 0);
    const totalProgress = coursesWithItems.reduce((sum, c) => {
      const percentage = (c.progress.completed / c.progress.total) * 100;
      return sum + percentage;
    }, 0);
    const averageProgress = coursesWithItems.length > 0 ? totalProgress / coursesWithItems.length : 0;
    const totalCompleted = enrolledCourses.reduce((sum, c) => sum + c.progress.completed, 0);
    const totalItems = enrolledCourses.reduce((sum, c) => sum + c.progress.total, 0);

    return {
      totalCourses,
      averageProgress: Math.round(averageProgress),
      totalCompleted,
      totalItems,
      overallPercentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0
    };
  }, [enrolledCourses]);

  return {
    loading,
    rejectionMessage,
    setRejectionMessage,
    enrolledCourses,
    stats
  };
};
