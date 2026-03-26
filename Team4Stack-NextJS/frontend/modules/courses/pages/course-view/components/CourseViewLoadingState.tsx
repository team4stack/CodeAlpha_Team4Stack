import React from 'react';
import StudentNavbar from '@/navigation/StudentNavbar';

interface CourseViewLoadingStateProps {
  isDarkMode: boolean;
}

const CourseViewLoadingState: React.FC<CourseViewLoadingStateProps> = ({ isDarkMode }) => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-24 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            isDarkMode ? 'border-purple-500' : 'border-purple-600'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewLoadingState;
