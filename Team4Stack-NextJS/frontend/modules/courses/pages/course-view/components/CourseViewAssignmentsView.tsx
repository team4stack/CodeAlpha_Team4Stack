'use client';

import React from 'react';
import CourseViewAssignmentsPanel from './CourseViewAssignmentsPanel';

type CourseViewAssignmentsViewProps = {
  parsedCourseId: number;
  assignmentsVideoId: number;
  isDarkMode: boolean;
  showDesktopLectureListFab: boolean;
  onBack: () => void;
};

const CourseViewAssignmentsView: React.FC<CourseViewAssignmentsViewProps> = ({
  parsedCourseId,
  assignmentsVideoId,
  isDarkMode,
  showDesktopLectureListFab,
  onBack
}) => {
  return (
    <div
      className={`relative z-30 h-auto lg:h-full overflow-visible lg:overflow-y-auto p-4 sm:p-6 ${
        showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''
      } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            isDarkMode
              ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          Back to lecture
        </button>
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignments</h2>
      </div>
      <CourseViewAssignmentsPanel
        courseId={parsedCourseId}
        selectedVideoId={assignmentsVideoId}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default CourseViewAssignmentsView;
