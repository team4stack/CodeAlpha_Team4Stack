'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CourseDetailHero from './course-detail/components/CourseDetailHero';
import CourseDetailMainContent from './course-detail/components/CourseDetailMainContent';
import CourseDetailShell from './course-detail/components/CourseDetailShell';
import CourseDetailSidebar from './course-detail/components/CourseDetailSidebar';
import {
  CourseDetailLoadingState,
  CourseDetailNotFoundState,
} from './course-detail/components/CourseDetailStates';
import type { CourseDetailPageProps } from './course-detail/types';
import { useCourseDetailData } from './course-detail/useCourseDetailData';

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const { course, loading } = useCourseDetailData(params);

  if (loading) {
    return (
      <CourseDetailShell>
        <CourseDetailLoadingState />
      </CourseDetailShell>
    );
  }

  if (!course) {
    return (
      <CourseDetailShell>
        <CourseDetailNotFoundState onBackToCourses={() => router.push('/courses')} />
      </CourseDetailShell>
    );
  }

  return (
    <CourseDetailShell>
      <CourseDetailHero course={course} />

      <section className="py-12 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CourseDetailMainContent />
            </div>
            <div className="lg:col-span-1">
              <CourseDetailSidebar
                course={course}
                onApply={() => router.push('/courses/apply')}
              />
            </div>
          </div>
        </div>
      </section>
    </CourseDetailShell>
  );
};

export default CourseDetailPage;
