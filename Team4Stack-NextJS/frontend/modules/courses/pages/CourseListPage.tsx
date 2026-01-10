'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { ProgressBar } from '../components';
import { supabase } from '@/lib/supabase/client';
import StudentNavbar from '@/navigation/StudentNavbar';

interface Course {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
}

interface Progress {
  completed: number;
  total: number;
}

const CourseListPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch courses from Supabase
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*');
          
        if (courseError) throw courseError;
        
        setCourses(courseData || []);
        
        // For progress, we'll fetch from progress_records table
        const { data: progressData } = await supabase
          .from('progress_records')
          .select('*');

        const progressByCourse: Record<string, Progress> = {};
        if (progressData) {
          progressData.forEach((record: any) => {
            const courseId = record.course_id;
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
  }, []);

  const courseStatus = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        progress: progressMap[course.id] || { completed: 0, total: 0 },
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
      {/* Navbar integrated into hero section */}
      <StudentNavbar />
      
      {/* Hero Section */}
      <div className={`pt-20 md:pt-28 pb-12 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Courses</span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Continue your learning journey. Track your progress and access all your enrolled courses.
            </p>
          </div>
        </div>
      </div>

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
                      {course.progress.total > 0 
                        ? `${Math.round((course.progress.completed / course.progress.total) * 100)}%`
                        : 'New'
                      }
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
              <div className="p-6 flex flex-col">
                <h2 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {course.name}
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
  );
};

export default CourseListPage;

