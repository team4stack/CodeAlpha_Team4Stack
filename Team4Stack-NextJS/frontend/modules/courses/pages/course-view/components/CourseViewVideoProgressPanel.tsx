import React, { useMemo } from 'react';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';

interface CourseViewVideoProgressPanelProps {
  isDarkMode: boolean;
  watchedSeconds: number;
  progress: number;
  totalSeconds: number;
}

const CourseViewVideoProgressPanel: React.FC<CourseViewVideoProgressPanelProps> = ({
  isDarkMode,
  watchedSeconds,
  progress,
  totalSeconds
}) => {
  const safeProgress = useMemo(() => Math.min(progress, 100), [progress]);

  return (
    <div className={`mt-4 p-4 rounded-lg ${
      isDarkMode
        ? 'bg-gray-800/50 border border-gray-700'
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Watched:
          </span>
          <span className={`text-lg font-bold tabular-nums ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {formatPlaybackTime(watchedSeconds)}
          </span>
          {totalSeconds > 0 && (
            <>
              <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                ·
              </span>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total:
              </span>
              <span className={`text-lg font-bold tabular-nums ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {formatPlaybackTime(totalSeconds)}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Progress:
          </span>
          <span className={`text-lg font-bold ${
            isDarkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            {Math.round(progress)}%
          </span>
        </div>

        {totalSeconds > 0 && (
          <div className="flex-1 min-w-[200px]">
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseViewVideoProgressPanel;
