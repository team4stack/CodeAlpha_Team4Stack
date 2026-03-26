'use client';

import { useEffect, useMemo, useState } from 'react';
import { coursesApi } from '@/lib/api';
import { DEFAULT_COURSES } from './constants';
import type { CourseDetailCourse } from './types';

const normalizeKey = (value: string | number | undefined | null): string =>
  String(value ?? '').trim().toLowerCase();

const normalizeCourse = (value: unknown): CourseDetailCourse | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const course = value as Record<string, unknown>;
  const rawTitle =
    typeof course.title === 'string'
      ? course.title
      : typeof course.name === 'string'
        ? course.name
        : '';
  const title = rawTitle.trim();

  if (!title) {
    return null;
  }

  const rawDescription =
    typeof course.description === 'string' ? course.description.trim() : '';

  return {
    id:
      typeof course.id === 'number' || typeof course.id === 'string'
        ? course.id
        : title,
    title,
    description:
      rawDescription || 'Course details are being updated. Please check back soon.',
    duration: typeof course.duration === 'string' ? course.duration : undefined,
    price: typeof course.price === 'string' ? course.price : undefined,
    note: typeof course.note === 'string' ? course.note : undefined,
    level: typeof course.level === 'string' ? course.level : undefined,
    features: Array.isArray(course.features)
      ? course.features.filter(
          (feature): feature is string => typeof feature === 'string'
        )
      : undefined,
  };
};

const matchesCourse = (
  course: CourseDetailCourse,
  targetCourseId: string
): boolean => {
  const normalizedTarget = normalizeKey(targetCourseId);

  return (
    normalizeKey(course.id) === normalizedTarget ||
    normalizeKey(course.title) === normalizedTarget
  );
};

export const useCourseDetailData = (params: Promise<{ courseId: string }>) => {
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<CourseDetailCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadParams = async () => {
      try {
        const resolvedParams = await params;
        if (!isMounted) {
          return;
        }

        setCourseId(resolvedParams.courseId);
      } catch {
        if (!isMounted) {
          return;
        }

        setCourseId('');
      }
    };

    void loadParams();

    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      if (!courseId) {
        setCourse(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await coursesApi.getAllCourses();
        const apiCourses = Array.isArray(result.data)
          ? result.data
              .map(normalizeCourse)
              .filter((item): item is CourseDetailCourse => Boolean(item))
          : [];

        const mergedCourses = [...apiCourses, ...DEFAULT_COURSES];
        const foundCourse =
          mergedCourses.find((item) => matchesCourse(item, courseId)) ?? null;

        if (!isMounted) {
          return;
        }

        setCourse(foundCourse);
      } catch (error) {
        console.error('[CourseDetailPage] Failed to load course details:', error);

        if (!isMounted) {
          return;
        }

        const fallbackCourse =
          DEFAULT_COURSES.find((item) => matchesCourse(item, courseId)) ?? null;
        setCourse(fallbackCourse);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return useMemo(
    () => ({
      courseId,
      course,
      loading,
    }),
    [courseId, course, loading]
  );
};
