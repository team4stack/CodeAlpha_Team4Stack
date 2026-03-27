'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseViewData } from './useCourseViewData';
import { useCourseViewPanelActions } from './useCourseViewPanelActions';
import { useCourseViewPanels } from './useCourseViewPanels';
import { useCourseViewLayoutFromState } from './useCourseViewLayoutFromState';
import { useCourseViewYouTubeState } from './useCourseViewYouTubeState';
import { useAutoSelectUnlockedLecture } from './useAutoSelectUnlockedLecture';
import { useMarkLectureAsCompleted } from './useMarkLectureAsCompleted';
import { useCourseViewProgressSync } from './useCourseViewProgressSync';
import { useCourseViewPlaybackRefs } from './useCourseViewPlaybackRefs';
import { useCourseViewQuizHandlers } from './useCourseViewQuizHandlers';
import { useCourseViewQuizState } from './useCourseViewQuizState';

const getYouTubePlayingState = () => {
  const yt = (window as unknown as { YT?: { PlayerState?: { PLAYING?: number } } }).YT;
  return yt?.PlayerState?.PLAYING;
};

export const useCourseViewPageState = (courseIdProp?: string) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const courseId = courseIdProp || null;
  const parsedCourseId = useMemo(() => {
    if (!courseId) return null;
    const parsed = Number.parseInt(courseId, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [courseId]);

  const data = useCourseViewData({ userId: user?.id, parsedCourseId });
  const youtube = useCourseViewYouTubeState({ selectedVideoId: data.selectedVideoId, videos: data.videos });
  const panels = useCourseViewPanels();
  const quizState = useCourseViewQuizState({
    userId: user?.id, videos: data.videos, selectedVideoId: data.selectedVideoId,
    showQuiz: panels.showQuiz, quizVideoId: panels.quizVideoId,
    progressRecords: data.progressRecords, videoTotalDuration: data.videoTotalDuration,
    videoWatchedTime: data.videoWatchedTime, videoProgress: data.videoProgress, videoWatched: data.videoWatched
  });

  const panelActions = useCourseViewPanelActions({
    unlockedLectures: quizState.summary.unlockedLectures, setSelectedVideoId: data.setSelectedVideoId,
    setShowAssignments: panels.setShowAssignments, setAssignmentsVideoId: panels.setAssignmentsVideoId,
    setShowQuiz: panels.setShowQuiz, setQuizVideoId: panels.setQuizVideoId, setIframeError: panels.setIframeError
  });

  const markVideoAsCompleted = useMarkLectureAsCompleted({
    userId: user?.id, courseId, videos: data.videos, videoWatched: data.videoWatched,
    videoWatchedTime: data.videoWatchedTime, videoTotalDuration: data.videoTotalDuration,
    actualWatchedTimeRef: data.actualWatchedTimeRef, setVideoWatched: data.setVideoWatched,
    setVideoProgress: data.setVideoProgress, setVideoWatchedTime: data.setVideoWatchedTime,
    setProgressRecords: data.setProgressRecords
  });

  const playbackRefs = useCourseViewPlaybackRefs({
    selectedVideoId: data.selectedVideoId, videos: data.videos, youtubeApiReady: youtube.youtubeApiReady,
    youtubeApiPlayerAvailable: youtube.youtubeApiPlayerAvailable, youtubeIframeFallbackActive: youtube.youtubeIframeFallbackActive,
    videoWatched: data.videoWatched, videoWatchedTime: data.videoWatchedTime, markVideoAsCompleted,
    lastTrackedTimeRef: data.lastTrackedTimeRef, actualWatchedTimeRef: data.actualWatchedTimeRef,
    setVideoProgress: data.setVideoProgress, setVideoWatchedTime: data.setVideoWatchedTime,
    setVideoTotalDuration: data.setVideoTotalDuration
  });

  const quizHandlers = useCourseViewQuizHandlers({
    userId: user?.id, courseId, quizVideoId: panels.quizVideoId,
    quizPassedMap: quizState.quizStatus.quizPassedMap, quizAttemptCountMap: quizState.quizAttemptCountMap,
    checkQuizStatus: quizState.quizStatus.checkQuizStatus, checkQuizExists: quizState.quizStatus.checkQuizExists,
    setLectureQuizPassedStatus: quizState.quizStatus.setLectureQuizPassedStatus,
    setQuizAttemptCountMap: quizState.setQuizAttemptCountMap, setQuizLockedMap: quizState.setQuizLockedMap,
    getNextLectureId: quizState.summary.getNextLectureId, setShowQuiz: panels.setShowQuiz,
    setQuizVideoId: panels.setQuizVideoId, setSelectedVideoId: data.setSelectedVideoId,
    setVideoProgress: data.setVideoProgress, setVideoWatchedTime: data.setVideoWatchedTime,
    setVideoWatched: data.setVideoWatched, setProgressRecords: data.setProgressRecords,
    actualWatchedTimeRef: data.actualWatchedTimeRef, lastTrackedTimeRef: data.lastTrackedTimeRef,
    elapsedTimeRef: playbackRefs.elapsedTimeRef
  });

  useAutoSelectUnlockedLecture({ selectedVideoId: data.selectedVideoId, videos: data.videos, unlockedLectures: quizState.summary.unlockedLectures, setSelectedVideoId: data.setSelectedVideoId });

  useCourseViewProgressSync({ userId: user?.id, parsedCourseId, selectedVideoId: data.selectedVideoId, videoWatchedTime: data.videoWatchedTime, videoTotalDuration: data.videoTotalDuration, videoProgress: data.videoProgress });

  const layout = useCourseViewLayoutFromState({
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
  });

  return {
    isDarkMode,
    loading: data.loading,
    error: data.error,
    course: data.course,
    layout,
    isSidebarOpen: panels.isSidebarOpen,
    isSidebarCollapsed: panels.isSidebarCollapsed,
    onBack: () => router.push('/student/courses'),
    onToggleSidebar: () => panels.setIsSidebarOpen((prev) => !prev),
    onExpandSidebar: () => panels.setIsSidebarCollapsed(false)
  };
};
