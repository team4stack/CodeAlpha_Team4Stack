'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressBar } from '../components';
import StudentNavbar from '@/navigation/StudentNavbar';

interface Course {
  id: number | string;
  title?: string;
  name?: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  intro_video_url?: string;
}

interface Progress {
  completed: number;
  total: number;
}

const CourseListPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, get user's approved applications via API
        const { coursesApi } = await import('@/lib/api');
        const result = await coursesApi.getAdmissionForms({ email: user.email.toLowerCase().trim() });

        if (result.error) {
          console.error('Error fetching applications:', result.error);
          throw new Error(result.error);
        }

        const applications = result.data || [];

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
        console.error('[CourseListPage] Failed to load enrolled courses', err);
        setError('Unable to load your courses right now.');
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
        name: course.title || course.name || 'Untitled Course',
        progress: progressMap[String(course.id)] || { completed: 0, total: 0 },
      })),
    [courses, progressMap]
  );

  const handleViewCourse = (courseId: string) => {
    router.push(`/student/courses/view/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300">
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

  if (error) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <div className={`pt-24 md:pt-32 pb-12 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
          <div className="container-custom">
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Error Loading Courses
              </h1>
            </div>
            <div className={`rounded-xl p-6 max-w-2xl mx-auto ${
              isDarkMode 
                ? 'bg-red-900/30 text-red-300 border border-red-700' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold">Unable to Load Courses</h2>
              </div>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => router.push('/student')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Back to Student Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      
      <div className={`pt-24 md:pt-32 pb-12 ${
        isDarkMode 
          ? 'bg-gradient-to-b from-black via-gray-900 to-black' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}>
        <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Enrolled Courses
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {courseStatus.length} {courseStatus.length === 1 ? 'course' : 'courses'} enrolled
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={() => router.push('/courses')}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                isDarkMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Browse Courses
            </button>
            <button 
              onClick={() => router.push('/')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Home
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseStatus.map((course) => (
            <div 
              key={course.id}
              className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700 hover:border-purple-500' 
                  : 'bg-white border border-gray-200 hover:border-purple-300'
              }`}
            >
              {(course.thumbnail_url || course.image_url) ? (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.thumbnail_url || course.image_url} 
                    alt={course.name || course.title || 'Course'} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDarkMode
                        ? 'bg-black/50 text-white backdrop-blur-sm'
                        : 'bg-white/90 text-gray-900 backdrop-blur-sm'
                    }`}>
                      {course.progress.total > 0 
                        ? `${Math.round((course.progress.completed / course.progress.total) * 100)}%`
                        : 'New'
                      }
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`h-48 flex items-center justify-center ${
                  isDarkMode ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30' : 'bg-gradient-to-br from-cyan-50 to-blue-50'
                }`}>
                  <span className="text-6xl">📚</span>
                </div>
              )}
              <div className="p-6 flex flex-col">
                <h2 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {course.name || course.title || 'Untitled Course'}
                </h2>
                <p className={`flex-grow mb-4 text-sm line-clamp-2 ${
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
                  onClick={() => handleViewCourse(course.id)}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {course.progress.completed > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {courseStatus.length === 0 && (
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

export default CourseListPage;

