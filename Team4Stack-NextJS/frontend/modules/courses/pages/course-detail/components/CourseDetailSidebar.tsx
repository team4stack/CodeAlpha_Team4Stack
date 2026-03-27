import React from 'react';
import type { CourseDetailCourse } from '../types';

interface CourseDetailSidebarProps {
  course: CourseDetailCourse;
  onApply: () => void;
}

const CourseDetailSidebar: React.FC<CourseDetailSidebarProps> = ({
  course,
  onApply,
}) => {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {Array.isArray(course.features) && course.features.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Course Features</h3>
          <ul className="space-y-3">
            {course.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-gray-300">
                <svg
                  className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <button
          onClick={onApply}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transform flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default CourseDetailSidebar;
