'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import { ProgressBar } from '../components';
import { supabase } from '@/lib/supabase/client';

interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
}

interface Progress {
  completed: number;
  total: number;
}

const StudentPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Check for rejected application
        if (user.email) {
          const { data: applicationData } = await supabase
            .from('admission_form')
            .select('rejection_message, approved')
            .eq('email', user.email.toLowerCase().trim())
            .eq('approved', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (applicationData && applicationData.rejection_message) {
            setRejectionMessage(applicationData.rejection_message);
          } else {
            setRejectionMessage(null);
          }
        }

        // First, get user's approved applications to get enrolled courses
        if (!user.email) {
          setCourses([]);
          setProgressMap({});
          setLoading(false);
          return;
        }

        const { data: applications, error: appError } = await supabase
          .from('admission_form')
          .select('course_name, course_name_2, approved, approved_1, approved_2')
          .eq('email', user.email.toLowerCase().trim())
          .order('created_at', { ascending: false });

        if (appError) {
          console.error('Error fetching applications:', appError);
          throw appError;
        }

        if (!applications || applications.length === 0) {
          setCourses([]);
          setProgressMap({});
          setLoading(false);
          return;
        }

        // Filter applications where at least one course is approved
        const appsWithAnyApproved = applications.filter(app => {
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          
          if (hasNewApprovals) {
            // New system: check if at least one selected course is approved
            const hasCourse1 = Boolean(app.course_name)
            const hasCourse2 = Boolean(app.course_name_2)
            
            if (hasCourse1 && hasCourse2) {
              // At least one course must be approved
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
        });

        if (appsWithAnyApproved.length === 0) {
          setCourses([]);
          setProgressMap({});
          setLoading(false);
          return;
        }

        // Get unique course names from applications (only include courses that are actually approved)
        const approvedCourseNames = new Set<string>();
        appsWithAnyApproved.forEach(app => {
          // Only add courses that are actually approved
          if (app.course_name?.trim() && app.approved_1 === true) {
            approvedCourseNames.add(app.course_name.trim());
          }
          if (app.course_name_2?.trim() && app.approved_2 === true) {
            approvedCourseNames.add(app.course_name_2.trim());
          }
          // Backward compatibility: if using old system, add course_name if approved
          if (!app.approved_1 && !app.approved_2 && app.approved === true && app.course_name?.trim()) {
            approvedCourseNames.add(app.course_name.trim());
          }
        });

        // Fetch all courses from Supabase
        const { data: allCourses, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .order('order_index', { ascending: true })
          .order('id', { ascending: false });
          
        if (courseError) throw courseError;
        
        // Filter courses: only show courses where title matches approved course_name
        const enrolledCourses = (allCourses || []).filter((course: any) => {
          const courseTitle = (course.title || course.name || '').trim();
          return Array.from(approvedCourseNames).some(approvedName => 
            courseTitle.toLowerCase() === approvedName.toLowerCase()
          );
        });
        
        setCourses(enrolledCourses);
        
        // Fetch progress records for current user
        const { data: progressData } = await supabase
          .from('progress_records')
          .select('*')
          .eq('user_id', user.id);

        const progressByCourse: Record<string, Progress> = {};
        if (progressData) {
          progressData.forEach((record: any) => {
            const courseId = String(record.course_id);
            if (!progressByCourse[courseId]) {
              progressByCourse[courseId] = { completed: 0, total: 0 };
            }
            if (record.completed) {
              progressByCourse[courseId].completed += 1;
            }
            progressByCourse[courseId].total += 1;
          });
        }

        setProgressMap(progressByCourse);
      } catch (err: any) {
        console.error('[StudentPage] Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const courseStatus = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        name: course.name || (course as any).title || 'Untitled Course',
        progress: progressMap[String(course.id)] || { completed: 0, total: 0 },
      })),
    [courses, progressMap]
  );

  // All enrolled courses (same as CourseListPage)
  const enrolledCourses = useMemo(() => courseStatus, [courseStatus]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const totalCourses = enrolledCourses.length;
    const totalProgress = enrolledCourses.reduce((sum, c) => {
      const percentage = c.progress.total > 0 
        ? (c.progress.completed / c.progress.total) * 100 
        : 0;
      return sum + percentage;
    }, 0);
    const averageProgress = totalCourses > 0 ? totalProgress / totalCourses : 0;
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

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <StudentNavbar />
        <div className={`pt-24 md:pt-32 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDarkMode ? 'border-purple-500' : 'border-purple-600'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar integrated into hero section */}
      <StudentNavbar />
      
      {/* Hero Section */}
      <section className={`relative pt-20 md:pt-28 pb-20 overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-b from-black via-gray-900 to-black' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-purple-500' : 'bg-purple-200'
          }`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-cyan-500' : 'bg-cyan-200'
          }`}></div>
        </div>

        <div className="container-custom relative z-10">
          {/* Rejection Message Alert */}
          {rejectionMessage && (
            <div className="mb-6 mx-auto max-w-3xl px-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">✗</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                      Application Rejected
                    </h3>
                    <p className="text-red-800 dark:text-red-200 leading-relaxed">
                      {rejectionMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setRejectionMessage(null)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12 md:mb-16 px-4">
            <div className="inline-block mb-4 md:mb-6 animate-fade-in">
              <span className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
              }`}>
                🎓 Student Dashboard
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight px-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
                Student!
              </span>
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Track your learning progress, view detailed analytics of your enrolled courses, monitor completion rates, and continue your journey with expert mentorship and real-time progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {enrolledCourses.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const firstCourse = enrolledCourses[0];
                      if (firstCourse) {
                        router.push(`/student/courses/view/${firstCourse.id}`);
                      }
                    }}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Continue Learning</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => router.push('/courses')}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30'
                        : 'border-purple-600 text-purple-600 hover:bg-purple-50 hover:shadow-lg'
                    }`}
                  >
                    Browse Courses
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/courses')}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Start Learning</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 md:mt-20 max-w-5xl mx-auto px-4">
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-cyan-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{stats.totalCourses}</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enrolled Courses</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-purple-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{stats.overallPercentage}%</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Progress</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-blue-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{stats.totalCompleted}</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed Items</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-green-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-green-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{stats.averageProgress}%</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Progress</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrolled Courses Section */}
      <div className={`py-12 ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="container-custom">
          <div className="mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              My Enrolled Courses
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'} enrolled
            </p>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const percentage = course.progress.total > 0 
                  ? Math.round((course.progress.completed / course.progress.total) * 100) 
                  : 0;
                
                return (
                  <div
                    key={course.id}
                    onClick={() => router.push(`/student/courses/view/${course.id}`)}
                    className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                      isDarkMode
                        ? 'bg-gray-800 border border-gray-700 hover:border-purple-500'
                        : 'bg-white border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {course.thumbnail_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnail_url}
                          alt={course.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isDarkMode
                              ? 'bg-black/50 text-white backdrop-blur-sm'
                              : 'bg-white/90 text-gray-900 backdrop-blur-sm'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`h-48 flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30' : 'bg-gradient-to-br from-purple-50 to-blue-50'
                      }`}>
                        <span className="text-6xl">📚</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {course.name}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {course.description || 'No description available'}
                      </p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Progress
                          </span>
                          <span className={`text-xs font-semibold ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`}>
                            {course.progress.completed} / {course.progress.total}
                          </span>
                        </div>
                        <ProgressBar
                          completed={course.progress.completed}
                          total={course.progress.total}
                        />
                      </div>
                      <button
                        className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                        }`}
                      >
                        {percentage === 100 ? 'Review Course' : percentage > 0 ? 'Continue Learning' : 'Start Course'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-16 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold mb-2">No courses enrolled yet</p>
              <p className="text-sm mb-6">Start your learning journey by enrolling in a course</p>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;

