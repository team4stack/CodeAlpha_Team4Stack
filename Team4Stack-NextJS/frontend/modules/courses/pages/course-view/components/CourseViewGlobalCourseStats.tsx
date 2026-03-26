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

  const totalLabel =
    totalCourseDuration > 0 ? formatPlaybackTime(totalCourseDuration) : '—';

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800/80 text-gray-200'
          : 'border-gray-200 bg-white text-gray-800'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Course time
        </span>
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          <span className="font-medium text-purple-500 dark:text-purple-400">Total</span>
          {': '}
          {totalLabel}
        </span>
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          <span className="font-medium text-cyan-600 dark:text-cyan-400">Watched</span>
          {': '}
          {formatPlaybackTime(totalWatchedTime)}
        </span>
      </div>
    </div>
  );
};

export default CourseViewGlobalCourseStats;
