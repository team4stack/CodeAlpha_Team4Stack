'use client';

import type { RefObject } from 'react';
import { useCourseViewLayoutState } from './useCourseViewLayoutState';
type CourseViewData = ReturnType<typeof import('./useCourseViewData').useCourseViewData>;
type PanelState = ReturnType<typeof import('./useCourseViewPanels').useCourseViewPanels>;
type QuizState = ReturnType<typeof import('./useCourseViewQuizState').useCourseViewQuizState>;
type YoutubeState = ReturnType<typeof import('./useCourseViewYouTubeState').useCourseViewYouTubeState>;
type PanelActions = ReturnType<typeof import('./useCourseViewPanelActions').useCourseViewPanelActions>;
type QuizHandlers = ReturnType<typeof import('./useCourseViewQuizHandlers').useCourseViewQuizHandlers>;

type CourseViewLayoutFromStateArgs = {
  isDarkMode: boolean;
  data: CourseViewData;
  panels: PanelState;
  quizState: QuizState;
  youtube: YoutubeState;
  panelActions: PanelActions;
  quizHandlers: QuizHandlers;
  parsedCourseId: number | null;
  playbackRefs: {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    videoRef: RefObject<HTMLVideoElement | null>;
    youtubePlayerRef: RefObject<{ getPlayerState?: () => number } | null>;
  };
  markVideoAsCompleted: (videoId: number) => Promise<void>;
  getYouTubePlayingState: () => number | undefined;
};

export const useCourseViewLayoutFromState = ({
  isDarkMode,
  data,
  panels,
  quizState,
  youtube,
  panelActions,
  quizHandlers,
  parsedCourseId,
  playbackRefs,
  markVideoAsCompleted,
  getYouTubePlayingState
}: CourseViewLayoutFromStateArgs) => {
  return useCourseViewLayoutState({
    isDarkMode,
    course: data.course,
    videos: data.videos,
    selectedVideoId: data.selectedVideoId,
    unlockedLectures: quizState.summary.unlockedLectures,
    videoWatched: data.videoWatched,
    videoWatchedTime: data.videoWatchedTime,
    videoProgress: data.videoProgress,
    videoTotalDuration: data.videoTotalDuration,
    quizExistsMap: quizState.quizStatus.quizExistsMap,
    quizPassedMap: quizState.quizStatus.quizPassedMap,
    quizLockedMap: quizState.quizLockedMap,
    quizScoresMap: quizState.quizStatus.quizScoresMap,
    youtubeIframeFallbackActive: youtube.youtubeIframeFallbackActive,
    iframeError: panels.iframeError,
    youtubeApiPlayerAvailable: youtube.youtubeApiPlayerAvailable,
    ytApiTimedOut: youtube.ytApiTimedOut,
    getNextLectureId: quizState.summary.getNextLectureId,
    getPrevLectureId: quizState.summary.getPrevLectureId,
    progressPercentage: quizState.summary.progressPercentage,
    completedCount: quizState.summary.completedCount,
    totalVideos: quizState.summary.totalVideos,
    totalCourseDuration: quizState.summary.totalCourseDuration,
    totalWatchedTime: quizState.summary.totalWatchedTime,
    assignmentCountByVideo: data.assignmentCountByVideo,
    assignmentSubmittedByVideo: data.assignmentSubmittedByVideo,
    assignmentMarksByVideo: data.assignmentMarksByVideo,
    showQuiz: panels.showQuiz,
    quizVideoId: panels.quizVideoId,
    showAssignments: panels.showAssignments,
    assignmentsVideoId: panels.assignmentsVideoId,
    parsedCourseId: parsedCourseId || 0,
    isSidebarOpen: panels.isSidebarOpen,
    isSidebarCollapsed: panels.isSidebarCollapsed,
    iframeRef: playbackRefs.iframeRef,
    videoRef: playbackRefs.videoRef,
    youtubePlayerRef: playbackRefs.youtubePlayerRef,
    markVideoAsCompleted,
    checkQuizExists: quizState.quizStatus.checkQuizExists,
    checkQuizStatus: quizState.quizStatus.checkQuizStatus,
    openQuizForVideo: quizHandlers.openQuizForVideo,
    handleSelectVideo: panelActions.handleSelectVideo,
    onAssignmentsBack: () => {
      panels.setShowAssignments(false);
      panels.setAssignmentsVideoId(null);
    },
    onQuizComplete: quizHandlers.handleQuizComplete,
    onQuizClose: quizHandlers.handleQuizClose,
    setIframeError: panels.setIframeError,
    setIsSidebarOpen: panels.setIsSidebarOpen,
    setIsSidebarCollapsed: panels.setIsSidebarCollapsed,
    openAssignmentsForVideo: panelActions.openAssignmentsForVideo,
    getYouTubePlayingState
  });
};
