import React from 'react';
import type { StudentCourse, StudentStats } from '../types';

interface StudentHeroSectionProps {
  isDarkMode: boolean;
  enrolledCourses: StudentCourse[];
  stats: StudentStats;
  rejectionMessage: string | null;
  onDismissRejection: () => void;
  onContinueLearning: () => void;
  onBrowseCourses: () => void;
}

const StudentHeroSection: React.FC<StudentHeroSectionProps> = ({
  isDarkMode,
  enrolledCourses,
  stats,
  rejectionMessage,
  onDismissRejection,
  onContinueLearning,
  onBrowseCourses
}) => {
  return (
    <section className={`relative pt-20 md:pt-28 pb-20 overflow-hidden ${
      isDarkMode
        ? 'bg-gradient-to-b from-black via-gray-900 to-black'
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-purple-500' : 'bg-purple-200'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-cyan-500' : 'bg-cyan-200'
        }`}></div>
      </div>

      <div className="container-custom relative z-10">
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
                  onClick={onDismissRejection}
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
                  onClick={onContinueLearning}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Continue Learning</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={onBrowseCourses}
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
                onClick={onBrowseCourses}
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
  );
};

export default StudentHeroSection;
