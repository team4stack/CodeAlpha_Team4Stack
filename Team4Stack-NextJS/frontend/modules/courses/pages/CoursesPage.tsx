'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi, usersApi } from '@/lib/api';
import CoursesNavbar from '@/navigation/CoursesNavbar';
import CoursesHeroSection from './courses-page/components/CoursesHeroSection';
import CoursesProgramsSection from './courses-page/components/CoursesProgramsSection';
import CourseRejectionModal from './courses-page/components/CourseRejectionModal';
import CoursePaymentNoticeModal from './courses-page/components/CoursePaymentNoticeModal';
import type { DbCourse, DisplayCourse } from './courses-page/types';

const CoursesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<string>('');
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [isApprovedStudent, setIsApprovedStudent] = useState<boolean | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [rejectedCourses, setRejectedCourses] = useState<Map<string, string>>(new Map()); // course_name -> rejection_message
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionMessage, setSelectedRejectionMessage] = useState<string>('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const defaultViewRedirected = useRef(false);

  const courses = useMemo<DisplayCourse[]>(() => ([
    {
      key: 'physical' as const,
      title: 'Physical Training (WE Connect)',
      level: 'Physical',
      description: 'Hands-on MERN stack training with real projects at WE Connect Software House.',
      duration: '3 months',
      price: 'Rs 10,000 (first month)',
      note: 'Next months: compromise possible',
      features: [
        'In-person classes + project work',
        'Monthly payment via JazzCash',
        'Certificate on completion',
        'Limited seats'
      ],
      gradient: 'from-slate-600 via-blue-800 to-slate-800'
    },
    {
      key: 'online' as const,
      title: 'Online Training',
      level: 'Online',
      description: 'Live online MERN stack course with recordings and support community.',
      duration: '4 months',
      price: 'Rs 5,000 (first month)',
      note: 'Next months: compromise possible',
      features: [
        'Live classes + recordings',
        'Monthly payment via JazzCash',
        'Assignments and projects',
        'Flexible timings'
      ],
      gradient: 'from-teal-700 via-cyan-800 to-slate-800'
    }
  ]), []);
  
  // Load courses from API
  useEffect(() => {
    (async () => {
      const result = await coursesApi.getAllCourses();
      if (!result.error && result.data) setDbCourses(result.data as any);
    })();
  }, []);

  // Check if user is an approved student and get enrolled courses
  useEffect(() => {
    const checkStudentStatus = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If user is not logged in, show Apply button
      if (!user || !user.email) {
        setIsApprovedStudent(false);
        setEnrolledCourses(new Set());
        return;
      }

      // Check if user is an approved student and get all applications
      try {
        const result = await coursesApi.getAdmissionForms({
          email: user.email.toLowerCase().trim()
        });

        if (result.error) {
          console.error('Error checking student status:', result.error);
          setIsApprovedStudent(false);
          setEnrolledCourses(new Set());
          return;
        }

        const applicationData = Array.isArray(result.data) ? result.data : [];

        // Check if user has at least one course approved
        const hasAnyCourseApproved = applicationData?.some((app: any) => {
          // Check if new per-course approval system is being used
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          
          if (hasNewApprovals) {
            // New system: check if at least one selected course is approved
            const hasCourse1 = Boolean(app.course_name)
            const hasCourse2 = Boolean(app.course_name_2)
            
            if (hasCourse1 && hasCourse2) {
              // Both courses selected - at least one must be approved
              return app.approved_1 === true || app.approved_2 === true
            } else if (hasCourse1) {
              // Only course 1 selected - must be approved
              return app.approved_1 === true
            }
            return false
          } else {
            // Old system: use the approved field directly
            return app.approved === true
          }
        }) || false;
        
        const hasApproved = hasAnyCourseApproved;
        setIsApprovedStudent(hasApproved || false);

        // Get course names from applications where at least one course is approved
        if (applicationData && applicationData.length > 0) {
          const appsWithAnyApproved = applicationData.filter((app: any) => {
            const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
            
            if (hasNewApprovals) {
              const hasCourse1 = Boolean(app.course_name)
              const hasCourse2 = Boolean(app.course_name_2)
              
              if (hasCourse1 && hasCourse2) {
                // At least one course must be approved
                return app.approved_1 === true || app.approved_2 === true
              } else if (hasCourse1) {
                return app.approved_1 === true
              }
              return false
            } else {
              return app.approved === true
            }
          });
          
          const courseNames = new Set<string>();
          const rejectedMap = new Map<string, string>();
          
          appsWithAnyApproved.forEach(app => {
            // Only add courses that are actually approved
            if (app.course_name?.trim() && app.approved_1 === true) {
              courseNames.add(app.course_name.trim());
            }
            if (app.course_name_2?.trim() && app.approved_2 === true) {
              courseNames.add(app.course_name_2.trim());
            }
            // Backward compatibility: if using old system, add course_name if approved
            if (!app.approved_1 && !app.approved_2 && app.approved === true && app.course_name?.trim()) {
              courseNames.add(app.course_name.trim());
            }
          });
          
          // Track rejected courses with their rejection messages
          applicationData.forEach((app: any) => {
            const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
            
            if (hasNewApprovals) {
              // Check course 1
              if (app.course_name?.trim() && app.approved_1 === false && app.rejection_message_1) {
                rejectedMap.set(app.course_name.trim(), app.rejection_message_1);
              }
              // Check course 2
              if (app.course_name_2?.trim() && app.approved_2 === false && app.rejection_message_2) {
                rejectedMap.set(app.course_name_2.trim(), app.rejection_message_2);
              }
            } else {
              // Old system
              if (app.course_name?.trim() && app.approved === false && app.rejection_message) {
                rejectedMap.set(app.course_name.trim(), app.rejection_message);
              }
            }
          });
          
          setEnrolledCourses(courseNames);
          setRejectedCourses(rejectedMap);
        } else {
          setEnrolledCourses(new Set());
          setRejectedCourses(new Map());
        }
      } catch (err) {
        console.error('Error checking student status:', err);
        setIsApprovedStudent(false);
        setEnrolledCourses(new Set());
      }
    };

    checkStudentStatus();
  }, [user, authLoading]);

  // Settings → Courses → "Default courses view: My enrollments"
  useEffect(() => {
    if (!user?.id || authLoading || defaultViewRedirected.current) return;
    void (async () => {
      try {
        const r = await usersApi.getUserById(user.id);
        if (r.error || !r.data) return;
        const c = (r.data as { user_settings?: { courses?: { defaultCoursesView?: string } } }).user_settings?.courses;
        if (c?.defaultCoursesView === 'my') {
          defaultViewRedirected.current = true;
          router.replace('/student/courses');
        }
      } catch {
        // ignore
      }
    })();
  }, [user?.id, authLoading, router]);

  const openBooking = (courseTitle: string) => {
    setPendingCourse(courseTitle);
    setNoticeOpen(true);
  };

  const proceedToForm = () => {
    try { localStorage.setItem('selectedCourse', pendingCourse); } catch {}
    setNoticeOpen(false);
    router.push('/courses/apply');
  };
  
  return (
    <div className="min-h-screen transition-colors duration-300">
      <CoursesNavbar />

      <CoursesHeroSection
        isDarkMode={isDarkMode}
        isApprovedStudent={isApprovedStudent}
        onPrimaryAction={() => router.push(isApprovedStudent ? '/student' : '/courses/apply')}
      />

      <CoursesProgramsSection
        isDarkMode={isDarkMode}
        dbCourses={dbCourses}
        fallbackCourses={courses}
        showAllCourses={showAllCourses}
        enrolledCourses={enrolledCourses}
        rejectedCourses={rejectedCourses}
        onShowAll={() => setShowAllCourses(true)}
        onViewDetails={(course) => {
          const courseId = dbCourses.length > 0
            ? dbCourses.find(c => c.title === course.title)?.id || course.key
            : course.key;
          router.push(`/courses/detail/${courseId}`);
        }}
        onBook={openBooking}
        onShowRejection={(message) => {
          setSelectedRejectionMessage(message);
          setShowRejectionModal(true);
        }}
      />

      <CourseRejectionModal
        isDarkMode={isDarkMode}
        open={showRejectionModal}
        message={selectedRejectionMessage}
        onClose={() => {
          setShowRejectionModal(false);
          setSelectedRejectionMessage('');
        }}
      />

      <CoursePaymentNoticeModal
        isDarkMode={isDarkMode}
        open={noticeOpen}
        onContinue={proceedToForm}
        onCancel={() => setNoticeOpen(false)}
      />
    </div>
  );
};

export default CoursesPage;


