import { useEffect, useMemo, useState } from 'react';
import type { Course, CourseWithProgress, Progress } from '../types';

interface UseCourseListDataArgs {
  userId?: string;
  userEmail?: string | null;
}

interface UseCourseListDataResult {
  courses: CourseWithProgress[];
  loading: boolean;
  error: string | null;
}

interface AdmissionRow {
  approved?: boolean | null;
  approved_1?: boolean | null;
  approved_2?: boolean | null;
  course_name?: string | null;
  course_name_2?: string | null;
}

export const useCourseListData = ({ userId, userEmail }: UseCourseListDataArgs): UseCourseListDataResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [accessByCourseId, setAccessByCourseId] = useState<
    Record<string, { canAccess: boolean; admissionStatus: 'approved' | 'pending' }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!userId || !userEmail) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { coursesApi } = await import('@/lib/api');
        const result = await coursesApi.getAdmissionForms({ email: userEmail.toLowerCase().trim() });

        if (result.error) throw new Error(result.error);

        const applications = Array.isArray(result.data) ? (result.data as AdmissionRow[]) : [];

        if (!applications || applications.length === 0) {
          setCourses([]);
          setProgressMap({});
          setAccessByCourseId({});
          setLoading(false);
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

        // If a course is approved in any application, it should not be treated as pending.
        approvedCourseNames.forEach((courseName) => {
          pendingCourseNames.delete(courseName);
        });

        if (approvedCourseNames.size === 0 && pendingCourseNames.size === 0) {
          setCourses([]);
          setProgressMap({});
          setAccessByCourseId({});
          setLoading(false);
          return;
        }

        const coursesResult = await coursesApi.getAllCourses();
        if (coursesResult.error) throw new Error(coursesResult.error);

        const allCourses = Array.isArray(coursesResult.data) ? coursesResult.data : [];
        const statusByTitle = new Map<string, 'approved' | 'pending'>();
        approvedCourseNames.forEach((name) => statusByTitle.set(name.toLowerCase(), 'approved'));
        pendingCourseNames.forEach((name) => {
          const normalized = name.toLowerCase();
          if (!statusByTitle.has(normalized)) {
            statusByTitle.set(normalized, 'pending');
          }
        });

        const enrolledCourses = allCourses.filter((course: any) => {
          const courseTitle = (course.title || course.name || '').trim();
          return statusByTitle.has(courseTitle.toLowerCase());
        });

        setCourses(enrolledCourses);
        const accessMap: Record<string, { canAccess: boolean; admissionStatus: 'approved' | 'pending' }> = {};
        enrolledCourses.forEach((course: any) => {
          const courseTitle = String(course.title || course.name || '').trim().toLowerCase();
          const status = statusByTitle.get(courseTitle) || 'pending';
          accessMap[String(course.id)] = {
            canAccess: status === 'approved',
            admissionStatus: status
          };
        });
        setAccessByCourseId(accessMap);

        const progressResult = await coursesApi.getUserProgress(userId);
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

        setProgressMap(progressByCourse);
      } catch (err: any) {
        console.error('[CourseListPage] Failed to load enrolled courses', err);
        setError('Unable to load your courses right now.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, userEmail]);

  const courseStatus = useMemo<CourseWithProgress[]>(
    () =>
      courses.map((course) => ({
        ...course,
        name: course.title || course.name || 'Untitled Course',
        progress: progressMap[String(course.id)] || { completed: 0, total: 0 },
        canAccess: accessByCourseId[String(course.id)]?.canAccess ?? false,
        admissionStatus: accessByCourseId[String(course.id)]?.admissionStatus ?? 'pending'
      })),
    [courses, progressMap, accessByCourseId]
  );

  return {
    courses: courseStatus,
    loading,
    error
  };
};
