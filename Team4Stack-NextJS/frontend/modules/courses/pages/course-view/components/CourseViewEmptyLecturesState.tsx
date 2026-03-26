import React from 'react';

interface CourseViewEmptyLecturesStateProps {
  isDarkMode: boolean;
}

const CourseViewEmptyLecturesState: React.FC<CourseViewEmptyLecturesStateProps> = ({ isDarkMode }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <div className="text-6xl mb-4">📚</div>
      <h2 className={`text-2xl font-bold mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Lectures Not Available
      </h2>
      <p className="text-center max-w-md">
        The admin hasn&apos;t uploaded any lectures for this course yet.
        Please check back later or contact the administration.
      </p>
    </div>
  );
};

export default CourseViewEmptyLecturesState;
