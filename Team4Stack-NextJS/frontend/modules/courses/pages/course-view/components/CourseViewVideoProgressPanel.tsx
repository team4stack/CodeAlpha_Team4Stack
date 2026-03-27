import React, { useMemo } from 'react';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';

interface CourseViewVideoProgressPanelProps {
  isDarkMode: boolean;
  watchedSeconds: number;
  progress: number;
  totalSeconds: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const CourseViewVideoProgressPanel: React.FC<CourseViewVideoProgressPanelProps> = ({
  isDarkMode,
  watchedSeconds,
  progress,
  totalSeconds,
  isPlaying,
  onTogglePlay
}) => {
  const safeProgress = useMemo(() => Math.min(progress, 100), [progress]);

  return (
    <div className={`mt-4 p-4 rounded-lg ${
      isDarkMode
        ? 'bg-gray-800/50 border border-gray-700'
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-md border transition-colors ${
              isDarkMode
                ? 'border-gray-700 bg-gray-900/40 text-gray-200 hover:bg-gray-900/60'
                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
            }`}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold tabular-nums ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        {totalSeconds > 0 && (
          <div className="flex-1 min-w-[120px]">
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        )}
        <span className={`text-sm font-semibold tabular-nums whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {formatPlaybackTime(watchedSeconds)} / {formatPlaybackTime(Math.max(0, totalSeconds))}
        </span>
      </div>
    </div>
  );
};

export default CourseViewVideoProgressPanel;
