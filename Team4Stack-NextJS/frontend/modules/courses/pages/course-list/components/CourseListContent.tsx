import React from 'react';
import { ProgressBar } from '../../../components';
import type { CourseWithProgress } from '../types';

interface CourseListContentProps {
  isDarkMode: boolean;
  courses: CourseWithProgress[];
  onViewCourse: (course: CourseWithProgress) => void;
  onOpenReport: (course: CourseWithProgress) => void;
  onBrowseCourses: () => void;
  onGoHome: () => void;
}

const CourseListContent: React.FC<CourseListContentProps> = ({
  isDarkMode,
  courses,
  onViewCourse,
  onOpenReport,
  onBrowseCourses,
  onGoHome
}) => {
  const getProgressPercentage = (completed: number, total: number) => {
    if (total <= 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const totalCourses = courses.length;
  const averageProgress = totalCourses > 0
    ? Math.round(
      courses.reduce((sum, course) => sum + getProgressPercentage(course.progress.completed, course.progress.total), 0) / totalCourses
    )
    : 0;
  const completedCourses = courses.filter((course) => {
    const { completed, total } = course.progress;
    return total > 0 && completed >= total;
  }).length;

  return (
    <div className={`pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 ${
      isDarkMode
        ? 'bg-linear-to-b from-black via-gray-900 to-black'
        : 'bg-linear-to-b from-gray-50 via-white to-gray-50'
    }`}>
      <div className="container-custom py-6 sm:py-8 md:py-10">
        <div
          className={`rounded-2xl border p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 ${
            isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                My Courses
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Continue your enrolled courses from where you left off.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
              <button
                onClick={onBrowseCourses}
                className={`px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
                  isDarkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                Browse Courses
              </button>
              <button
                onClick={onGoHome}
                className={`px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Home
              </button>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`rounded-xl border p-3 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Enrolled
              </p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalCourses}</p>
            </div>
            <div className={`rounded-xl border p-3 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Avg Progress
              </p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>{averageProgress}%</p>
            </div>
            <div className={`rounded-xl border p-3 ${
              isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Completed
              </p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className={`text-lg sm:text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Enrolled Courses
          </h3>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {totalCourses} {totalCourses === 1 ? 'course' : 'courses'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => {
            const progressPercentage = getProgressPercentage(course.progress.completed, course.progress.total);
            const progressLabel = course.admissionStatus === 'pending'
              ? 'Pending Approval'
              : progressPercentage >= 100
                ? 'Completed'
                : progressPercentage > 0
                  ? 'In Progress'
                  : 'Not Started';

            return (
              <div
                key={course.id}
                className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700 md:hover:border-purple-500'
                    : 'bg-white border border-gray-200 md:hover:border-purple-300'
                }`}
              >
                {(course.thumbnail_url || course.image_url) ? (
                  <div className="relative h-40 sm:h-44 overflow-hidden">
                    <img
                      src={course.thumbnail_url || course.image_url}
                      alt={course.name || course.title || 'Course'}
                      className="w-full h-full object-cover transition-transform duration-300 md:hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isDarkMode
                          ? 'bg-black/55 text-white backdrop-blur-sm'
                          : 'bg-white/90 text-gray-900 backdrop-blur-sm'
                      }`}>
                        {progressPercentage > 0 ? `${progressPercentage}%` : 'New'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`h-40 sm:h-44 flex items-center justify-center ${
                    isDarkMode ? 'bg-linear-to-br from-cyan-900/30 to-blue-900/30' : 'bg-linear-to-br from-cyan-50 to-blue-50'
                  }`}>
                    <span className="text-5xl">📚</span>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className={`text-lg font-bold leading-snug line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.name || course.title || 'Untitled Course'}
                    </h4>
                    <span
                      className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                        course.admissionStatus === 'pending'
                          ? isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                          : progressPercentage >= 100
                          ? isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                          : progressPercentage > 0
                            ? isDarkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'
                            : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {progressLabel}
                    </span>
                  </div>

                  <p className={`grow mb-4 text-sm line-clamp-2 ${
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewCourse(course)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {course.admissionStatus === 'pending'
                        ? 'Awaiting Approval'
                        : course.progress.completed > 0
                          ? 'Continue Learning'
                          : 'Start Course'}
                    </button>
                    <button
                      onClick={() => onOpenReport(course)}
                      aria-label="Open course report"
                      title="Course report"
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isDarkMode
                          ? 'border-cyan-500/60 bg-gray-800 text-cyan-300 hover:bg-gray-700'
                          : 'border-cyan-400 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                      }`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l3-3 2 2 3-3M5 5h14v14H5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className={`text-center py-14 sm:py-16 rounded-2xl border mt-4 ${
            isDarkMode ? 'text-gray-400 border-gray-700 bg-gray-800/40' : 'text-gray-500 border-gray-200 bg-white'
          }`}>
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <p className={`text-lg sm:text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No courses enrolled yet
            </p>
            <p className="text-sm mb-6">Start your learning journey by enrolling in a course</p>
            <button
              onClick={onBrowseCourses}
              className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseListContent;
