import React from 'react';

interface CourseDetailNotFoundStateProps {
  onBackToCourses: () => void;
}

export const CourseDetailLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-white/70">Loading course details...</p>
      </div>
    </div>
  );
};

export const CourseDetailNotFoundState: React.FC<
  CourseDetailNotFoundStateProps
> = ({ onBackToCourses }) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <p className="text-white/70 text-xl mb-4">Course not found</p>
        <button
          onClick={onBackToCourses}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
        >
          Back to Courses
        </button>
      </div>
    </div>
  );
};
