import React from 'react';
import type { QuizScore, Video } from '../types';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';

type LectureMetrics = {
  totalSeconds: number;
  watchedSeconds: number;
  displayPct: number;
};

function computeLectureMetrics(args: {
  videoId: number;
  videoDuration?: number;
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
}): LectureMetrics {
  const totalSeconds = Math.floor(
    args.videoTotalDuration.get(args.videoId) || args.videoDuration || 0
  );
  const rawWatched = Math.floor(args.videoWatchedTime.get(args.videoId) || 0);
  const watchedSeconds =
    totalSeconds > 0 ? Math.min(rawWatched, totalSeconds) : rawWatched;

  const derivedPct =
    totalSeconds > 0
      ? Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100))
      : 0;
  const fromMap = args.videoProgress.get(args.videoId);
  const hasFromMap = typeof fromMap === 'number';
  const displayPct = hasFromMap ? Math.round(Math.max(fromMap, derivedPct)) : derivedPct;

  return { totalSeconds, watchedSeconds, displayPct };
}

function getLectureRowClassName(args: {
  isDarkMode: boolean;
  isLocked: boolean;
  isSelected: boolean;
}) {
  const base = 'w-full text-left p-3 rounded-lg transition-all';
  if (args.isLocked) {
    return `${base} opacity-60 cursor-not-allowed bg-gray-700/20 dark:bg-gray-800/20 border border-gray-500`;
  }
  if (args.isSelected) {
    return `${base} ${
      args.isDarkMode
        ? 'bg-linear-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500 cursor-pointer'
        : 'bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-300 cursor-pointer'
    }`;
  }
  return `${base} ${
    args.isDarkMode
      ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 cursor-pointer'
      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer'
  }`;
}

function getLectureTitleClass(args: {
  isDarkMode: boolean;
  isLocked: boolean;
  isSelected: boolean;
}) {
  if (args.isLocked) return args.isDarkMode ? 'text-gray-500' : 'text-gray-400';
  if (args.isSelected) return args.isDarkMode ? 'text-white' : 'text-gray-900';
  return args.isDarkMode ? 'text-gray-300' : 'text-gray-700';
}

function getLectureProgressClass(args: { isDarkMode: boolean; isCompleted: boolean }) {
  if (args.isCompleted) return args.isDarkMode ? 'text-green-400' : 'text-green-600';
  return args.isDarkMode ? 'text-purple-400' : 'text-purple-600';
}

function renderLectureBadge(args: {
  isLocked: boolean;
  isCompleted: boolean;
  index: number;
  isDarkMode: boolean;
}) {
  const { isLocked, isCompleted, index, isDarkMode } = args;
  if (isLocked) {
    return (
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center border ${
          isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4m-2 0h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
        </svg>
      </div>
    );
  }
  if (isCompleted) {
    return (
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
      }`}
    >
      {index + 1}
    </div>
  );
}

function renderQuizPill(args: {
  isDarkMode: boolean;
  quizScore: QuizScore;
}) {
  const { isDarkMode, quizScore } = args;
  const passed = quizScore.percentage >= 80;
  let pillClass = '';
  if (passed) {
    pillClass = isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
  } else {
    pillClass = isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
  }

  return (
    <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold ${pillClass}`}>
      <span>Quiz</span>
      <span>{quizScore.score}/{quizScore.total_marks} ({Math.round(quizScore.percentage)}%)</span>
    </div>
  );
}

export interface CourseViewLectureAccordionItemProps {
  isDarkMode: boolean;
  video: Video;
  index: number;
  isSelected: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  quizExists: boolean;
  quizScore?: QuizScore;
  assignmentCount: number;
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  onSelect: () => void;
}

const LectureAccordionHeader: React.FC<{
  isDarkMode: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  quizExists: boolean;
  index: number;
  title: string;
  titleClass: string;
  metrics: LectureMetrics;
  progressClass: string;
  quizScore?: QuizScore;
  assignmentCount: number;
  onSelect: () => void;
}> = ({
  isDarkMode,
  isLocked,
  isCompleted,
  quizExists,
  index,
  title,
  titleClass,
  metrics,
  progressClass,
  quizScore,
  assignmentCount,
  onSelect
}) => {
  return (
    <summary className="list-none cursor-pointer select-none">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          {renderLectureBadge({ isLocked, isCompleted, index, isDarkMode })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={isLocked}
              onClick={(e) => {
                e.preventDefault();
                if (!isLocked) onSelect();
              }}
              className="min-w-0 text-left"
            >
              <span className={`block font-semibold text-sm truncate ${titleClass}`}>
                {title}
              </span>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              {isLocked ? (
                <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  Locked
                </span>
              ) : null}
              <svg
                className={`size-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {quizExists ? (quizScore ? renderQuizPill({ isDarkMode, quizScore }) : (
            <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
              isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
            }`}>
              <span>Quiz</span>
            </div>
          )) : null}

          {assignmentCount > 0 ? (
            <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
              isDarkMode ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 text-indigo-700'
            }`}>
              <span>Assignment</span>
              <span>({assignmentCount})</span>
            </div>
          ) : null}

          <div className="mt-1.5 flex flex-col gap-0.5">
            <p className={`text-xs tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span className="font-medium text-cyan-600 dark:text-cyan-400">Watched</span>
              {': '}
              {formatPlaybackTime(metrics.watchedSeconds)}
              <span className={`mx-1.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>·</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">Total</span>
              {': '}
              {metrics.totalSeconds > 0 ? formatPlaybackTime(metrics.totalSeconds) : '—'}
            </p>
            <p className={`text-xs font-semibold ${progressClass}`}>
              Progress: {metrics.displayPct}%
            </p>
          </div>
        </div>
      </div>
    </summary>
  );
};

const LectureAccordionSubItems: React.FC<{
  isDarkMode: boolean;
  quizExists: boolean;
  quizRightLabel: React.ReactNode;
  assignmentCount: number;
  canOpenSubItems: boolean;
}> = ({ isDarkMode, quizExists, quizRightLabel, assignmentCount, canOpenSubItems }) => {
  const subItemTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const subItemMutedClass = 'text-gray-500';
  const subItemLockedClass = isDarkMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-white'}`}>
      {quizExists ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <span className={`text-xs font-semibold ${canOpenSubItems ? subItemTextClass : subItemLockedClass}`}>
            Quiz
          </span>
          {quizRightLabel}
        </div>
      ) : null}

      {assignmentCount > 0 ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <span className={`text-xs font-semibold ${canOpenSubItems ? subItemTextClass : subItemLockedClass}`}>
            {assignmentCount > 1 ? 'Assignments' : 'Assignment'}
          </span>
          {canOpenSubItems ? (
            <span className={subItemMutedClass}>Open in lecture</span>
          ) : (
            <span className={subItemMutedClass}>Unlock by watching 90%</span>
          )}
        </div>
      ) : null}
    </div>
  );
};

const CourseViewLectureAccordionItem: React.FC<CourseViewLectureAccordionItemProps> = ({
  isDarkMode,
  video,
  index,
  isSelected,
  isLocked,
  isCompleted,
  quizExists,
  quizScore,
  assignmentCount,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  onSelect
}) => {
  const metrics = computeLectureMetrics({
    videoId: video.id,
    videoDuration: video.duration,
    videoTotalDuration,
    videoWatchedTime,
    videoProgress
  });

  const className = getLectureRowClassName({ isDarkMode, isLocked, isSelected });
  const titleClass = getLectureTitleClass({ isDarkMode, isLocked, isSelected });
  const progressClass = getLectureProgressClass({ isDarkMode, isCompleted });

  const canOpenSubItems = !isLocked && metrics.displayPct >= 90;

  let quizRightLabel: React.ReactNode = null;
  if (quizExists) {
    if (!canOpenSubItems) {
      quizRightLabel = <span className="text-gray-500">Unlock by watching 90%</span>;
    } else if (quizScore) {
      quizRightLabel = (
        <span className="text-gray-500">
          {quizScore.score}/{quizScore.total_marks} ({Math.round(quizScore.percentage)}%)
        </span>
      );
    } else {
      quizRightLabel = <span className="text-gray-500">Not attempted</span>;
    }
  }

  return (
    <details className={className} open={isSelected}>
      <LectureAccordionHeader
        isDarkMode={isDarkMode}
        isLocked={isLocked}
        isCompleted={isCompleted}
        quizExists={quizExists}
        index={index}
        title={video.title}
        titleClass={titleClass}
        metrics={metrics}
        progressClass={progressClass}
        quizScore={quizScore}
        assignmentCount={assignmentCount}
        onSelect={onSelect}
      />
      <LectureAccordionSubItems
        isDarkMode={isDarkMode}
        quizExists={quizExists}
        quizRightLabel={quizRightLabel}
        assignmentCount={assignmentCount}
        canOpenSubItems={canOpenSubItems}
      />
    </details>
  );
};

export default CourseViewLectureAccordionItem;

