import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { ProgressBar } from '../components';
import { supabase } from '../../../utils/supabaseClient';

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
  const navigate = useNavigate();
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
    navigate(`/student/courses/view/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          isDarkMode ? 'border-purple-500' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className={`rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-red-900/30 text-red-300 border border-red-700' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 md:mb-0 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            My Courses
          </h1>
          <button 
            onClick={() => navigate('/')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Back to Home
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseStatus.map((course) => (
            <div 
              key={course.id}
              className={`rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {course.thumbnail_url && (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.name} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex flex-col">
                <h2 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {course.name}
                </h2>
                <p className={`flex-grow mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {course.description || 'No description available'}
                </p>
                <div className="mb-4">
                  <ProgressBar 
                    completed={course.progress.completed} 
                    total={course.progress.total} 
                  />
                  <p className={`text-sm mt-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {course.progress.completed} of {course.progress.total} videos completed
                  </p>
                </div>
                <button 
                  onClick={() => handleViewCourse(course.id)}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {courseStatus.length === 0 && (
          <div className={`text-center py-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="text-lg">No courses enrolled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseListPage;

