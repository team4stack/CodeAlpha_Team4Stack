'use client';

import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useDesktopViewportState } from './useDesktopViewportState';
import { useCourseViewPlaybackState } from './useCourseViewPlaybackState';
import { getCourseViewDerivedState } from '../utils/courseViewDerivedState';
import { buildLectureListProps, buildLectureViewProps, buildRightPanelProps } from '../utils/courseViewLayoutProps';
import type { Course, Video } from '../types';

type YoutubePlayer = {
  getPlayerState?: () => number;
  playVideo?: () => void;
  pauseVideo?: () => void;
};

type CourseViewLayoutArgs = {
  isDarkMode: boolean;
  course: Course | null;
  videos: Video[];
  selectedVideoId: number | null;
  unlockedLectures: Set<number>;
  videoWatched: Set<number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  videoTotalDuration: Map<number, number>;
  quizExistsMap: Map<number, boolean>;
  quizPassedMap: Map<number, boolean>;
  quizLockedMap: Map<number, boolean>;
  quizScoresMap: Map<number, { score: number; total_marks: number; percentage: number }>;
  youtubeIframeFallbackActive: boolean;
  iframeError: boolean;
  youtubeApiPlayerAvailable: boolean;
  ytApiTimedOut: boolean;
  getNextLectureId: (videoId: number) => number | null;
  getPrevLectureId: (videoId: number) => number | null;
  progressPercentage: number;
  completedCount: number;
  totalVideos: number;
  totalCourseDuration: number;
  totalWatchedTime: number;
  assignmentCountByVideo: Map<number, number>;
  assignmentSubmittedByVideo: Map<number, boolean>;
  assignmentMarksByVideo: Map<number, { awarded: number; total: number }>;
  showQuiz: boolean;
  quizVideoId: number | null;
  showAssignments: boolean;
  assignmentsVideoId: number | null;
  parsedCourseId: number;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  youtubePlayerRef: RefObject<YoutubePlayer | null>;
  markVideoAsCompleted: (videoId: number) => Promise<void>;
  checkQuizExists: (videoId: number) => Promise<boolean>;
  checkQuizStatus: (videoId: number) => Promise<boolean>;
  openQuizForVideo: (videoId: number) => void;
  handleSelectVideo: (videoId: number) => void;
  onAssignmentsBack: () => void;
  onQuizComplete: (passed: boolean, attemptCount: number) => void | Promise<void>;
  onQuizClose: () => void;
  setIframeError: (value: boolean) => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setIsSidebarCollapsed: (value: boolean) => void;
  openAssignmentsForVideo: (videoId: number) => void;
  getYouTubePlayingState: () => number | undefined;
};

export const useCourseViewLayoutState = (args: CourseViewLayoutArgs) => {
  const derived = getCourseViewDerivedState({
    course: args.course,
    videos: args.videos,
    selectedVideoId: args.selectedVideoId,
    unlockedLectures: args.unlockedLectures,
    videoWatchedTime: args.videoWatchedTime,
    videoProgress: args.videoProgress,
    videoTotalDuration: args.videoTotalDuration,
    quizExistsMap: args.quizExistsMap,
    quizPassedMap: args.quizPassedMap,
    quizLockedMap: args.quizLockedMap,
    youtubeIframeFallbackActive: args.youtubeIframeFallbackActive,
    iframeError: args.iframeError,
    getNextLectureId: args.getNextLectureId,
    getPrevLectureId: args.getPrevLectureId
  });

  const { isPlaying, handleTogglePlay } = useCourseViewPlaybackState({
    selectedVideoId: args.selectedVideoId,
    selectedVideoIsYouTube: derived.selectedVideoIsYouTube,
    youtubeApiPlayerAvailable: args.youtubeApiPlayerAvailable,
    videoRef: args.videoRef,
    youtubePlayerRef: args.youtubePlayerRef,
    getYouTubePlayingState: args.getYouTubePlayingState
  });

  const isDesktopView = useDesktopViewportState();
  const showDesktopLectureListFab = isDesktopView && args.isSidebarCollapsed;
  const desktopShowListBtnClass = [
    'btn-plain btn-no-glass absolute left-0 top-4 z-20 -translate-x-1/2 grid h-8 w-12 place-items-center justify-end rounded-md border pe-2.5 shadow-sm',
    args.isDarkMode ? 'border-cyan-600/50 bg-gray-800 text-cyan-300' : 'border-cyan-500/50 bg-white text-cyan-700',
  ].join(' ');

  const lectureViewProps = buildLectureViewProps({
    isDarkMode: args.isDarkMode,
    courseTitle: derived.courseTitle,
    lecturePosition: derived.lecturePosition,
    selectedVideo: derived.selectedVideo,
    videos: args.videos,
    selectedVideoWatched: Boolean(derived.selectedVideo && args.videoWatched.has(derived.selectedVideo.id)),
    selectedCanComplete: derived.selectedCanComplete,
    selectedHasPrev: derived.selectedHasPrev,
    selectedHasNext: derived.selectedHasNext,
    selectedQuizExists: derived.selectedQuizExists,
    selectedQuizPassed: derived.selectedQuizPassed,
    selectedQuizLocked: derived.selectedQuizLocked,
    selectedVideoWatchedSeconds: derived.selectedVideoWatchedSeconds,
    selectedVideoProgress: derived.selectedVideoProgress,
    selectedVideoTotalSeconds: derived.selectedVideoTotalSeconds,
    showDesktopLectureListFab,
    iframeError: args.iframeError,
    youtubeApiPlayerAvailable: args.youtubeApiPlayerAvailable,
    youtubeApiTimedOut: args.ytApiTimedOut,
    iframeRef: args.iframeRef,
    videoRef: args.videoRef,
    markVideoAsCompleted: args.markVideoAsCompleted,
    checkQuizExists: args.checkQuizExists,
    checkQuizStatus: args.checkQuizStatus,
    openQuizForVideo: args.openQuizForVideo,
    handleSelectVideo: args.handleSelectVideo,
    selectedPrevLectureId: derived.selectedPrevLectureId,
    selectedNextLectureId: derived.selectedNextLectureId,
    isPlaying,
    onTogglePlay: handleTogglePlay,
    setIframeError: args.setIframeError
  });

  const lectureListProps = buildLectureListProps({
    isDarkMode: args.isDarkMode,
    courseTitle: derived.courseTitle,
    progressPercentage: args.progressPercentage,
    completedCount: args.completedCount,
    totalVideos: args.totalVideos,
    totalCourseDuration: args.totalCourseDuration,
    totalWatchedTime: args.totalWatchedTime,
    videos: args.videos,
    videoWatched: args.videoWatched,
    selectedVideoId: args.selectedVideoId,
    unlockedLectures: args.unlockedLectures,
    quizExistsMap: args.quizExistsMap,
    quizScoresMap: args.quizScoresMap,
    quizLockedMap: args.quizLockedMap,
    videoTotalDuration: args.videoTotalDuration,
    videoWatchedTime: args.videoWatchedTime,
    videoProgress: args.videoProgress,
    assignmentCountByVideo: args.assignmentCountByVideo,
    assignmentSubmittedByVideo: args.assignmentSubmittedByVideo,
    assignmentMarksByVideo: args.assignmentMarksByVideo,
    onSelectVideo: args.handleSelectVideo,
    onOpenAssignmentForVideo: args.openAssignmentsForVideo,
    onCloseSidebar: () => args.setIsSidebarOpen(false),
    onCollapseSidebar: () => args.setIsSidebarCollapsed(true),
    isSidebarOpen: args.isSidebarOpen,
    isSidebarCollapsed: args.isSidebarCollapsed
  });

  const rightPanelProps = buildRightPanelProps({
    showQuiz: args.showQuiz,
    quizVideoId: args.quizVideoId,
    showAssignments: args.showAssignments,
    assignmentsVideoId: args.assignmentsVideoId,
    parsedCourseId: args.parsedCourseId,
    isDarkMode: args.isDarkMode,
    showDesktopLectureListFab,
    lectureViewProps,
    onAssignmentsBack: args.onAssignmentsBack,
    onQuizComplete: args.onQuizComplete,
    onQuizClose: args.onQuizClose
  });

  return {
    lectureViewProps,
    lectureListProps,
    rightPanelProps,
    isDesktopView,
    showDesktopLectureListFab,
    desktopShowListBtnClass
  };
};
