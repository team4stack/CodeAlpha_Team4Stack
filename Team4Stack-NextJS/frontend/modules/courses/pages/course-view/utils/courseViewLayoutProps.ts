'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { logErrorSecurely } from '@/lib/utils/errorHandler';
import CourseViewLectureView from '../components/CourseViewLectureView';
import CourseViewLectureListPanels from '../components/CourseViewLectureListPanels';
import CourseViewRightPanel from '../components/CourseViewRightPanel';
import type { Video } from '../types';

type LectureViewProps = React.ComponentProps<typeof CourseViewLectureView>;
type LectureListProps = React.ComponentProps<typeof CourseViewLectureListPanels>;
type RightPanelProps = React.ComponentProps<typeof CourseViewRightPanel>;

type BuildLectureViewPropsArgs = {
  isDarkMode: boolean;
  courseTitle: string;
  lecturePosition: string;
  selectedVideo: Video | null;
  videos: Video[];
  selectedVideoWatched: boolean;
  selectedCanComplete: boolean;
  selectedHasPrev: boolean;
  selectedHasNext: boolean;
  selectedQuizExists: boolean;
  selectedQuizPassed: boolean;
  selectedQuizLocked: boolean;
  selectedVideoWatchedSeconds: number;
  selectedVideoProgress: number;
  selectedVideoTotalSeconds: number;
  showDesktopLectureListFab: boolean;
  iframeError: boolean;
  youtubeApiPlayerAvailable: boolean;
  youtubeApiTimedOut: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  markVideoAsCompleted: (videoId: number) => Promise<void>;
  checkQuizExists: (videoId: number) => Promise<boolean>;
  checkQuizStatus: (videoId: number) => Promise<boolean>;
  openQuizForVideo: (videoId: number) => void;
  handleSelectVideo: (videoId: number) => void;
  selectedPrevLectureId: number | null;
  selectedNextLectureId: number | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  setIframeError: (value: boolean) => void;
};

export const buildLectureViewProps = ({
  isDarkMode,
  courseTitle,
  lecturePosition,
  selectedVideo,
  videos,
  selectedVideoWatched,
  selectedCanComplete,
  selectedHasPrev,
  selectedHasNext,
  selectedQuizExists,
  selectedQuizPassed,
  selectedQuizLocked,
  selectedVideoWatchedSeconds,
  selectedVideoProgress,
  selectedVideoTotalSeconds,
  showDesktopLectureListFab,
  iframeError,
  youtubeApiPlayerAvailable,
  youtubeApiTimedOut,
  iframeRef,
  videoRef,
  markVideoAsCompleted,
  checkQuizExists,
  checkQuizStatus,
  openQuizForVideo,
  handleSelectVideo,
  selectedPrevLectureId,
  selectedNextLectureId,
  isPlaying,
  onTogglePlay,
  setIframeError
}: BuildLectureViewPropsArgs): LectureViewProps => {
  return {
    isDarkMode,
    courseTitle,
    lecturePosition,
    selectedVideo,
    videos,
    selectedVideoWatched,
    selectedCanComplete,
    selectedHasPrev,
    selectedHasNext,
    selectedQuizExists,
    selectedQuizPassed,
    selectedQuizLocked,
    selectedVideoWatchedSeconds,
    selectedVideoProgress,
    selectedVideoTotalSeconds,
    showDesktopLectureListFab,
    iframeError,
    youtubeApiPlayerAvailable,
    youtubeApiTimedOut,
    iframeRef,
    videoRef,
    onIframeLoaded: () => setIframeError(false),
    onIframeError: () => setIframeError(true),
    onRetryIframe: () => setIframeError(false),
    onVideoEnded: markVideoAsCompleted,
    onPrev: () => {
      if (selectedPrevLectureId) handleSelectVideo(selectedPrevLectureId);
    },
    onTakeQuiz: () => {
      if (selectedVideo) openQuizForVideo(selectedVideo.id);
    },
    onNext: () => {
      if (selectedNextLectureId) handleSelectVideo(selectedNextLectureId);
    },
    onCompleteAndNext: async () => {
      if (!selectedVideo || !selectedCanComplete) return;

      await markVideoAsCompleted(selectedVideo.id);

      try {
        const exists = await checkQuizExists(selectedVideo.id);
        if (exists) {
          const passed = await checkQuizStatus(selectedVideo.id);
          if (!passed) {
            openQuizForVideo(selectedVideo.id);
            return;
          }
        }
      } catch (err) {
        logErrorSecurely(err, 'completeAndNextQuizCheck');
        toast.error('Unable to verify quiz status right now.');
        return;
      }

      if (selectedHasNext && selectedNextLectureId) {
        setTimeout(() => {
          handleSelectVideo(selectedNextLectureId);
        }, 500);
      }
    },
    onTogglePlay,
    isPlaying
  };
};

type BuildLectureListPropsArgs = {
  isDarkMode: boolean;
  courseTitle: string;
  progressPercentage: number;
  completedCount: number;
  totalVideos: number;
  totalCourseDuration: number;
  totalWatchedTime: number;
  videos: Video[];
  videoWatched: Set<number>;
  selectedVideoId: number | null;
  unlockedLectures: Set<number>;
  quizExistsMap: Map<number, boolean>;
  quizScoresMap: Map<number, { score: number; total_marks: number; percentage: number }>;
  quizLockedMap: Map<number, boolean>;
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  assignmentCountByVideo: Map<number, number>;
  assignmentSubmittedByVideo: Map<number, boolean>;
  assignmentMarksByVideo: Map<number, { awarded: number; total: number }>;
  onSelectVideo: (videoId: number) => void;
  onOpenAssignmentForVideo: (videoId: number) => void;
  onCloseSidebar: () => void;
  onCollapseSidebar: () => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
};

export const buildLectureListProps = ({
  isDarkMode,
  courseTitle,
  progressPercentage,
  completedCount,
  totalVideos,
  totalCourseDuration,
  totalWatchedTime,
  videos,
  videoWatched,
  selectedVideoId,
  unlockedLectures,
  quizExistsMap,
  quizScoresMap,
  quizLockedMap,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  assignmentCountByVideo,
  assignmentSubmittedByVideo,
  assignmentMarksByVideo,
  onSelectVideo,
  onOpenAssignmentForVideo,
  onCloseSidebar,
  onCollapseSidebar,
  isSidebarOpen,
  isSidebarCollapsed
}: BuildLectureListPropsArgs): LectureListProps => {
  return {
    isDarkMode,
    courseTitle,
    progressPercentage,
    completedCount,
    totalVideos,
    totalCourseDuration,
    totalWatchedTime,
    videos,
    videoWatched,
    selectedVideoId,
    unlockedLectures,
    quizExistsMap,
    quizScoresMap,
    quizLockedMap,
    videoTotalDuration,
    videoWatchedTime,
    videoProgress,
    assignmentCountByVideo,
    assignmentSubmittedByVideo,
    assignmentMarksByVideo,
    onSelectVideo,
    onOpenAssignmentForVideo,
    onCloseSidebar,
    onCollapseSidebar,
    isSidebarOpen,
    isSidebarCollapsed
  };
};

type BuildRightPanelPropsArgs = {
  showQuiz: boolean;
  quizVideoId: number | null;
  showAssignments: boolean;
  assignmentsVideoId: number | null;
  parsedCourseId: number;
  isDarkMode: boolean;
  showDesktopLectureListFab: boolean;
  lectureViewProps: LectureViewProps;
  onAssignmentsBack: () => void;
  onQuizComplete: () => void;
  onQuizClose: () => void;
};

export const buildRightPanelProps = ({
  showQuiz,
  quizVideoId,
  showAssignments,
  assignmentsVideoId,
  parsedCourseId,
  isDarkMode,
  showDesktopLectureListFab,
  lectureViewProps,
  onAssignmentsBack,
  onQuizComplete,
  onQuizClose
}: BuildRightPanelPropsArgs): RightPanelProps => {
  return {
    showQuiz,
    quizVideoId,
    showAssignments,
    assignmentsVideoId,
    parsedCourseId,
    isDarkMode,
    showDesktopLectureListFab,
    lectureViewProps,
    onAssignmentsBack,
    onQuizComplete,
    onQuizClose
  };
};
