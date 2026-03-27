import React from 'react';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';

interface CourseViewGlobalCourseStatsProps {
  isDarkMode: boolean;
  totalVideos: number;
  totalCourseDuration: number;
  totalWatchedTime: number;
}

/**
 * Always-visible course totals (API + live maps) so users see full duration / watched
 * without opening the lecture list or clicking each item.
 */
const CourseViewGlobalCourseStats: React.FC<CourseViewGlobalCourseStatsProps> = ({
  isDarkMode,
  totalVideos,
  totalCourseDuration,
  totalWatchedTime
}) => {
  if (totalVideos <= 0) return null;

  const watchedLabel = formatPlaybackTime(totalWatchedTime);
  const totalLabel = totalCourseDuration > 0 ? formatPlaybackTime(totalCourseDuration) : '—';

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800/80 text-gray-200'
          : 'border-gray-200 bg-white text-gray-800'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className={`font-bold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {watchedLabel} / {totalLabel}
        </span>
      </div>
    </div>
  );
};

export default CourseViewGlobalCourseStats;
