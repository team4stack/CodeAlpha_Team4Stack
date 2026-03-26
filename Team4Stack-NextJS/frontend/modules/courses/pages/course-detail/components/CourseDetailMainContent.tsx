import React from 'react';
import { COURSE_DETAILS_BODY, COURSE_SECTIONS } from '../constants';
import type { CourseSectionConfig, ListMarker } from '../types';

const renderListMarker = (listMarker: ListMarker) => {
  if (listMarker === 'dot-cyan') {
    return <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>;
  }

  if (listMarker === 'dot-emerald') {
    return (
      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
    );
  }

  const iconColorClassName =
    listMarker === 'check-amber' ? 'text-amber-400' : 'text-cyan-400';

  return (
    <svg
      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorClassName}`}
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
  );
};

const CourseSectionCard: React.FC<{ section: CourseSectionConfig }> = ({
  section,
}) => {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.iconBackgroundClassName} flex items-center justify-center border border-white/10`}
        >
          <svg
            className={`w-6 h-6 ${section.iconColorClassName}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={section.iconPath}
            />
          </svg>
        </div>
        {section.title}
      </h2>

      {section.intro && (
        <p className="text-gray-300 mb-4 leading-relaxed">{section.intro}</p>
      )}

      <ul className="space-y-3">
        {section.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-gray-300">
            {renderListMarker(section.listMarker)}
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {section.outro && (
        <p className="text-gray-300 mt-6 leading-relaxed">{section.outro}</p>
      )}
    </div>
  );
};

const CourseDetailMainContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          Course Details
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed text-lg">
            {COURSE_DETAILS_BODY}
          </p>
        </div>
      </div>

      {COURSE_SECTIONS.map((section) => (
        <CourseSectionCard key={section.id} section={section} />
      ))}
    </div>
  );
};

export default CourseDetailMainContent;
