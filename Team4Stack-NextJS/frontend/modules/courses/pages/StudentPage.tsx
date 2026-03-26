'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import StudentLoadingState from './student-page/components/StudentLoadingState';
import StudentHeroSection from './student-page/components/StudentHeroSection';
import StudentEnrolledCoursesSection from './student-page/components/StudentEnrolledCoursesSection';
import { useStudentDashboardData } from './student-page/hooks/useStudentDashboardData';
import type { StudentCourse } from './student-page/types';

const StudentPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const {
    loading,
    rejectionMessage,
    setRejectionMessage,
    enrolledCourses,
    stats
  } = useStudentDashboardData({
    userId: user?.id,
    userEmail: user?.email
  });

  if (loading) {
    return <StudentLoadingState isDarkMode={isDarkMode} />;
  }

  const openCourseWithAccessCheck = (course: StudentCourse) => {
    if (!course.canAccess) {
      toast.error('Access restricted: this course is awaiting admin approval.');
      return;
    }
    router.push(`/student/courses/view/${course.id}`);
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar integrated into hero section */}
      <StudentNavbar />
      
      <StudentHeroSection
        isDarkMode={isDarkMode}
        enrolledCourses={enrolledCourses}
        stats={stats}
        rejectionMessage={rejectionMessage}
        onDismissRejection={() => setRejectionMessage(null)}
        onContinueLearning={() => {
          const firstCourse = enrolledCourses.find((course) => course.canAccess);
          if (firstCourse) {
            router.push(`/student/courses/view/${firstCourse.id}`);
            return;
          }
          toast.error('No approved course available yet. Please wait for admin approval.');
        }}
        onBrowseCourses={() => router.push('/courses')}
      />

      <StudentEnrolledCoursesSection
        isDarkMode={isDarkMode}
        enrolledCourses={enrolledCourses}
        onOpenCourse={openCourseWithAccessCheck}
        onOpenReport={(course) => router.push(`/student/courses/report/${course.id}`)}
        onBrowseCourses={() => router.push('/courses')}
      />
    </div>
  );
};

export default StudentPage;

