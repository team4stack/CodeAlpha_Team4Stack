import React from 'react';

interface CourseListLoadingStateProps {
  isDarkMode: boolean;
}

const CourseListLoadingState: React.FC<CourseListLoadingStateProps> = ({ isDarkMode }) => {
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
};

export default CourseListLoadingState;
