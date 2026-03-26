'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import CourseListLoadingState from './course-list/components/CourseListLoadingState';
import CourseListErrorState from './course-list/components/CourseListErrorState';
import CourseListContent from './course-list/components/CourseListContent';
import { useCourseListData } from './course-list/hooks/useCourseListData';
import type { CourseWithProgress } from './course-list/types';

const CourseListPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { courses: courseStatus, loading, error } = useCourseListData({
    userId: user?.id,
    userEmail: user?.email
  });

  const handleViewCourse = (course: CourseWithProgress) => {
    if (!course.canAccess) {
      toast.error('Access restricted: this course is awaiting admin approval.');
      return;
    }
    router.push(`/student/courses/view/${course.id}`);
  };

  const handleOpenReport = (course: CourseWithProgress) => {
    router.push(`/student/courses/report/${course.id}`);
  };

  if (loading) {
    return <CourseListLoadingState isDarkMode={isDarkMode} />;
  }

  if (error) {
    return <CourseListErrorState isDarkMode={isDarkMode} error={error} onBack={() => router.push('/student')} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <CourseListContent
        isDarkMode={isDarkMode}
        courses={courseStatus}
        onViewCourse={handleViewCourse}
        onOpenReport={handleOpenReport}
        onBrowseCourses={() => router.push('/courses')}
        onGoHome={() => router.push('/')}
      />
    </div>
  );
};

export default CourseListPage;

