import React, { useState } from 'react';
import type { QuizScore, Video } from '../types';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';

type LectureMetrics = {
  totalSeconds: number;
  watchedSeconds: number;
  displayPct: number;
};

function formatMaybeTime(seconds: number): string {
  return seconds > 0 ? formatPlaybackTime(seconds) : '--';
}

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
  quizIndex?: number | null;
  quizLocked?: boolean;
  assignmentCount: number;
  assignmentSubmitted: boolean;
  assignmentMarks?: { awarded: number; total: number } | null;
  assignmentStartIndex?: number | null;
  assignmentEndIndex?: number | null;
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  onSelect: () => void;
  onOpenAssignmentForVideo: (videoId: number) => void;
}

const LectureAccordionHeader: React.FC<{
  isDarkMode: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  quizExists: boolean;
  index: number;
  isExpanded: boolean;
  title: string;
  titleClass: string;
  metrics: LectureMetrics;
  progressClass: string;
  quizScore?: QuizScore;
  assignmentCount: number;
  assignmentMarks?: { awarded: number; total: number } | null;
  onSelect: () => void;
  onToggleExpand?: () => void;
  wrapper?: 'summary' | 'div';
}> = ({
  isDarkMode,
  isLocked,
  isCompleted,
  quizExists,
  index,
  isExpanded,
  title,
  titleClass,
  metrics,
  progressClass,
  quizScore,
  assignmentCount,
  assignmentMarks,
  onSelect,
  onToggleExpand,
  wrapper = 'summary'
}) => {
  const canSelect = !isLocked;
  if (wrapper === 'div') {
    return (
      <div className="list-none cursor-pointer select-none">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          {renderLectureBadge({ isLocked, isCompleted, index, isDarkMode })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`block font-semibold text-sm truncate ${titleClass}`}>
              {title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {isLocked ? (
                <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  Locked
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-1.5">
            <p className={`text-xs tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatPlaybackTime(metrics.watchedSeconds)} / {formatMaybeTime(metrics.totalSeconds)}
            </p>
            <p className={`text-xs font-semibold ${progressClass} tabular-nums mt-0.5`}>
              Watched {metrics.displayPct}%
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <summary
      className="list-none cursor-pointer select-none"
      onClick={(e) => {
        // Details open/close is controlled by React (`open={isSelected}`),
        // so prevent native toggle and use selection to navigate.
        e.preventDefault();
        e.stopPropagation();
        if (canSelect) onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (canSelect) onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-disabled={!canSelect}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          {renderLectureBadge({ isLocked, isCompleted, index, isDarkMode })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`block font-semibold text-sm truncate ${titleClass}`}>{title}</span>
            <div className="flex items-start gap-2 shrink-0">
              {isLocked ? (
                <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  Locked
                </span>
              ) : null}
              {onToggleExpand ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                  className="inline-flex items-center justify-center rounded p-1 hover:bg-white/10"
                  aria-label="Toggle lecture details"
                >
                  <svg
                    className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-1.5 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <p className={`text-xs tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatPlaybackTime(metrics.watchedSeconds)} / {formatMaybeTime(metrics.totalSeconds)}
              </p>
              <p className={`text-xs font-semibold ${progressClass}`}>Watched {metrics.displayPct}%</p>
            </div>
            <div className="flex flex-col items-end text-[11px] font-semibold tabular-nums">
              {quizScore ? (
                <span className={isDarkMode ? 'text-cyan-200' : 'text-cyan-700'}>Q ({quizScore.score}/{quizScore.total_marks})</span>
              ) : null}
              {assignmentMarks && assignmentMarks.total > 0 ? (
                <span className={isDarkMode ? 'text-emerald-200' : 'text-emerald-700'}>
                  A ({Math.max(0, assignmentMarks.awarded)}/{assignmentMarks.total})
                </span>
              ) : null}
            </div>
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
  quizIndex?: number | null;
  quizLocked?: boolean;
  assignmentCount: number;
  assignmentSubmitted: boolean;
  assignmentStartIndex?: number | null;
  assignmentEndIndex?: number | null;
  canOpenSubItems: boolean;
  canOpenAssignment: boolean;
  onOpenAssignment: () => void;
}> = ({
  isDarkMode,
  quizExists,
  quizRightLabel,
  quizIndex,
  quizLocked,
  assignmentCount,
  assignmentSubmitted,
  assignmentStartIndex,
  assignmentEndIndex,
  canOpenSubItems,
  canOpenAssignment,
  onOpenAssignment,
}) => {
  const subItemTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const subItemLockedClass = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const startNumber = assignmentStartIndex || 1;
  const endNumber = assignmentEndIndex || startNumber;
  const assignmentLabel =
    assignmentCount <= 1
      ? `Assignment (${startNumber})`
      : `Assignments (${startNumber}-${endNumber})`;

  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-white'}`}>
      {quizExists ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <span className={`text-xs font-semibold ${canOpenSubItems ? subItemTextClass : subItemLockedClass}`}>
            Quiz ({quizIndex || 1})
          </span>
          {quizLocked ? (
            <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" />
            </svg>
          ) : (
            quizRightLabel
          )}
        </div>
      ) : null}

      {assignmentCount > 0 ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <button
            type="button"
            disabled={!assignmentSubmitted && !canOpenAssignment}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenAssignment();
            }}
            className={`w-fit text-left rounded-lg px-2 py-1 text-xs font-semibold border transition-colors ${
              assignmentSubmitted
                ? isDarkMode
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-emerald-600/20 bg-emerald-600/10 text-emerald-800'
                : canOpenAssignment
                  ? isDarkMode
                    ? 'border-gray-600/40 bg-gray-800/40 text-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-800'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-900/30 text-gray-500'
                    : 'border-gray-200 bg-gray-50 text-gray-400'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
            aria-disabled={!assignmentSubmitted && !canOpenAssignment}
          >
            <span className="tabular-nums">{assignmentLabel}</span>
          </button>

          <span className="flex items-center shrink-0">
            {assignmentSubmitted ? (
              <svg className="size-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : canOpenAssignment ? (
              <svg className="size-4 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M3 12h18" />
              </svg>
            ) : (
              <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" />
              </svg>
            )}
          </span>
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
  quizIndex,
  quizLocked,
  assignmentCount,
  assignmentSubmitted,
  assignmentMarks,
  assignmentStartIndex,
  assignmentEndIndex,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  onSelect,
  onOpenAssignmentForVideo
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
  const canOpenAssignment = !isLocked;
  const hasSubItems = quizExists || assignmentCount > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  let quizRightLabel: React.ReactNode = null;
  if (quizExists) {
    if (quizScore) {
      quizRightLabel = (
        <svg className="size-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (!canOpenSubItems) {
      quizRightLabel = (
        <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" />
        </svg>
      );
    } else {
      quizRightLabel = (
        <svg className="size-4 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M3 12h18" />
        </svg>
      );
    }
  }

  // If a lecture has no quiz/assignment, don't show an empty dropdown UI.
  if (!hasSubItems) {
    return (
      <div
        className={className}
        onClick={() => {
          if (!isLocked) onSelect();
        }}
        role={!isLocked ? 'button' : undefined}
        tabIndex={!isLocked ? 0 : undefined}
        onKeyDown={(e) => {
          if (isLocked) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <LectureAccordionHeader
          isDarkMode={isDarkMode}
          isLocked={isLocked}
        isCompleted={isCompleted}
        quizExists={quizExists}
        index={index}
        isExpanded={false}
        title={video.title}
        titleClass={titleClass}
        metrics={metrics}
        progressClass={progressClass}
        quizScore={quizScore}
        assignmentCount={assignmentCount}
        onSelect={onSelect}
        wrapper="div"
      />
      </div>
    );
  }

  return (
    <details
      className={className}
      open={isExpanded}
    >
      <LectureAccordionHeader
        isDarkMode={isDarkMode}
        isLocked={isLocked}
        isCompleted={isCompleted}
        quizExists={quizExists}
        index={index}
        isExpanded={isExpanded}
        title={video.title}
        titleClass={titleClass}
        metrics={metrics}
        progressClass={progressClass}
        quizScore={quizScore}
        assignmentCount={assignmentCount}
        assignmentMarks={assignmentMarks}
        onSelect={onSelect}
        onToggleExpand={() => {
          setIsExpanded((prev) => !prev);
        }}
      />
      <LectureAccordionSubItems
        isDarkMode={isDarkMode}
        quizExists={quizExists}
        quizRightLabel={quizRightLabel}
        quizIndex={quizIndex}
        quizLocked={quizLocked}
        assignmentCount={assignmentCount}
        assignmentSubmitted={assignmentSubmitted}
        assignmentStartIndex={assignmentStartIndex}
        assignmentEndIndex={assignmentEndIndex}
        canOpenSubItems={canOpenSubItems}
        canOpenAssignment={canOpenAssignment}
        onOpenAssignment={() => {
          onSelect();
          onOpenAssignmentForVideo(video.id);
        }}
      />
    </details>
  );
};

export default CourseViewLectureAccordionItem;

