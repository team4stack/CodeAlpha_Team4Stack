import React from 'react';
import { ProgressBar } from '../../../components';
import type { StudentCourse } from '../types';

interface StudentEnrolledCoursesSectionProps {
  isDarkMode: boolean;
  enrolledCourses: StudentCourse[];
  onOpenCourse: (course: StudentCourse) => void;
  onOpenReport: (course: StudentCourse) => void;
  onBrowseCourses: () => void;
}

const StudentEnrolledCoursesSection: React.FC<StudentEnrolledCoursesSectionProps> = ({
  isDarkMode,
  enrolledCourses,
  onOpenCourse,
  onOpenReport,
  onBrowseCourses
}) => {
  return (
    <div className={`py-12 ${isDarkMode ? 'bg-linear-to-b from-gray-900 to-black' : 'bg-linear-to-b from-gray-50 to-white'}`}>
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
                onClick={() => onOpenCourse(course)}
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
                      isDarkMode ? 'bg-linear-to-br from-purple-900/30 to-blue-900/30' : 'bg-linear-to-br from-purple-50 to-blue-50'
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
                    <div className="mb-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          course.admissionStatus === 'pending'
                            ? isDarkMode
                              ? 'bg-amber-900/40 text-amber-300'
                              : 'bg-amber-100 text-amber-700'
                            : isDarkMode
                              ? 'bg-emerald-900/40 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {course.admissionStatus === 'pending' ? 'Pending Approval' : 'Approved'}
                      </span>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenCourse(course);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                          isDarkMode
                            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                            : 'bg-linear-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                        }`}
                      >
                        {course.admissionStatus === 'pending'
                          ? 'Awaiting Approval'
                          : percentage === 100
                            ? 'Review Course'
                            : percentage > 0
                              ? 'Continue Learning'
                              : 'Start Course'}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenReport(course);
                        }}
                        aria-label="Open course report"
                        title="Course report"
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
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
        ) : (
          <div className={`text-center py-16 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold mb-2">No courses enrolled yet</p>
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

export default StudentEnrolledCoursesSection;
