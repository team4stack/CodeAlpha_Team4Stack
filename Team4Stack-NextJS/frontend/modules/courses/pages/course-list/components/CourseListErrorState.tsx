import React from 'react';

interface CourseListErrorStateProps {
  isDarkMode: boolean;
  error: string;
  onBack: () => void;
}

const CourseListErrorState: React.FC<CourseListErrorStateProps> = ({
  isDarkMode,
  error,
  onBack
}) => {
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
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white"
            >
              Back to Student Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseListErrorState;
