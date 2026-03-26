import React from 'react';
import StudentNavbar from '@/navigation/StudentNavbar';

interface CourseViewErrorStateProps {
  isDarkMode: boolean;
  error: string | null;
  onBack: () => void;
}

const CourseViewErrorState: React.FC<CourseViewErrorStateProps> = ({ isDarkMode, error, onBack }) => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Course Error
            </h1>
          </div>
          <div className={`rounded-xl p-6 max-w-2xl mx-auto ${
            isDarkMode
              ? 'bg-red-900/30 text-red-300 border border-red-700'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            <p className="mb-4">{error || 'Course not found'}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white"
            >
              Back to My Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewErrorState;
