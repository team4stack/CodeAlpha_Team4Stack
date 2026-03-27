'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import QuizComponent from '../components/QuizComponent';
import { sanitizeError, logErrorSecurely } from '@/lib/utils/errorHandler';
import CourseViewLoadingState from './course-view/components/CourseViewLoadingState';
import CourseViewErrorState from './course-view/components/CourseViewErrorState';
import CourseViewVideoPlayer from './course-view/components/CourseViewVideoPlayer';
import CourseViewVideoProgressPanel from './course-view/components/CourseViewVideoProgressPanel';
import CourseViewEmptyLecturesState from './course-view/components/CourseViewEmptyLecturesState';
import CourseViewLectureHeader from './course-view/components/CourseViewLectureHeader';
import CourseViewLectureListPanels from './course-view/components/CourseViewLectureListPanels';
import CourseViewAssignmentsPanel from './course-view/components/CourseViewAssignmentsPanel';
import CourseViewGlobalCourseStats from './course-view/components/CourseViewGlobalCourseStats';
import MobileLectureToggleButton from './course-view/components/MobileLectureToggleButton';
import type { Course, ProgressRecord, Video } from './course-view/types';
import { useCourseLectureProgressSummary } from './course-view/hooks/useCourseLectureProgressSummary';
import { useLectureQuizStatusTracking } from './course-view/hooks/useLectureQuizStatusTracking';
import { useCourseViewQuizLifecycleHandlers } from './course-view/hooks/useCourseViewQuizLifecycleHandlers';
import { useDesktopViewportState } from './course-view/hooks/useDesktopViewportState';
import { useAutoSelectUnlockedLecture } from './course-view/hooks/useAutoSelectUnlockedLecture';
import { useMarkLectureAsCompleted } from './course-view/hooks/useMarkLectureAsCompleted';
import { useCourseVideoPlaybackTracking } from './course-view/hooks/useCourseVideoPlaybackTracking';
import { useYouTubeIframeApiLazy } from './course-view/hooks/useYouTubeIframeApiLazy';
import { convertToEmbedUrl } from './course-view/youtubeVideoUrlHelpers';

interface CourseViewPageProps {
  courseId?: string;
}

const isEmbeddableYouTubeUrl = (url?: string | null) => {
  if (!url) return false;
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return false;
  return convertToEmbedUrl(url) !== null;
};

const parseDurationSeconds = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;

  const parts = trimmed.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return 0;
};

function hydrateProgressFromApi(args: {
  progressData: ProgressRecord[];
  durationMap: Map<number, number>;
}): {
  watched: Set<number>;
  watchedTimeMap: Map<number, number>;
  progressMap: Map<number, number>;
  lastTrackedInit: Map<number, number>;
} {
  const watched = new Set<number>();
  const watchedTimeMap = new Map<number, number>();
  const progressMap = new Map<number, number>();
  const lastTrackedInit = new Map<number, number>();

  for (const record of args.progressData || []) {
    const vid = record?.video_id;
    if (!vid) continue;

    const D = args.durationMap.get(vid) || 0;
    const score = typeof record.score === 'number' && record.score >= 0 ? record.score : 0;

    let effectiveWatched = 0;
    if (D > 0) {
      if (score > 0) {
        effectiveWatched = Math.min(score, D);
      } else if (record.completed) {
        // Legacy: completed records without score were treated as fully watched.
        effectiveWatched = D;
      }
    } else if (score > 0) {
      effectiveWatched = score;
    }

    if (effectiveWatched > 0) {
      const prev = watchedTimeMap.get(vid) || 0;
      const next = Math.max(prev, effectiveWatched);
      watchedTimeMap.set(vid, next);
      lastTrackedInit.set(vid, Math.floor(next));
    }

    if (record.completed) watched.add(vid);

    let pct = 0;
    if (D > 0) {
      const w = watchedTimeMap.get(vid) || 0;
      pct = Math.min(100, (w / D) * 100);
    } else if (record.completed) {
      pct = 100;
    }
    progressMap.set(vid, Math.max(progressMap.get(vid) || 0, pct));
  }

  return { watched, watchedTimeMap, progressMap, lastTrackedInit };
}

async function fetchCourseViewData(args: {
  courseId: number;
  userId: string;
}): Promise<{
  course: Course | null;
  videos: Video[];
  durationMap: Map<number, number>;
  progressData: ProgressRecord[];
  assignmentCountByVideo: Map<number, number>;
  assignmentSubmittedByVideo: Map<number, boolean>;
  assignmentMarksByVideo: Map<number, { awarded: number; total: number }>;
}> {
  const courseResult = await coursesApi.getCourseById(args.courseId);
  if (courseResult.error) throw new Error(String(courseResult.error));
  const course = (courseResult.data as Course) || null;

  const videosResult = await coursesApi.getCourseVideos(args.courseId);
  if (videosResult.error) throw new Error(String(videosResult.error));
  const videos = (videosResult.data as Video[]) || [];

  const durationMap = new Map<number, number>();
  for (const v of videos) {
    const duration = parseDurationSeconds(v?.duration);
    if (duration > 0) durationMap.set(v.id, duration);
  }

  const progressResult = await coursesApi.getUserProgress(args.userId, args.courseId);
  const progressData = progressResult.error ? [] : ((progressResult.data as ProgressRecord[]) || []);

  // For sidebar accordion sub-items (quiz/assignments). Keep it non-blocking.
  const assignmentCountByVideo = new Map<number, number>();
  const assignmentSubmittedByVideo = new Map<number, boolean>();
  const assignmentMarksByVideo = new Map<number, { awarded: number; total: number }>();
  try {
    const assignmentsResult = await coursesApi.getAssignmentsByCourse(args.courseId);
    const list = assignmentsResult.error ? [] : ((assignmentsResult.data as any[]) || []);
    for (const a of list) {
      const vidRaw = a?.video_id;
      const vid = typeof vidRaw === 'number' ? vidRaw : Number(vidRaw);
      if (!Number.isFinite(vid) || vid <= 0) continue;
      const prev = assignmentCountByVideo.get(vid) || 0;
      assignmentCountByVideo.set(vid, prev + 1);

      const totalMarks = Number(a?.total_marks || 0);
      const awardedMarks = Number(a?.submission?.awarded_marks || 0);
      const prevMarks = assignmentMarksByVideo.get(vid) || { awarded: 0, total: 0 };
      assignmentMarksByVideo.set(vid, {
        awarded: prevMarks.awarded + (Number.isFinite(awardedMarks) ? awardedMarks : 0),
        total: prevMarks.total + (Number.isFinite(totalMarks) ? totalMarks : 0)
      });

      // If student has any submission for this assignment, mark video as "submitted".
      // assignments payload includes `submission` when fetched for the current student context.
      const submitted = Boolean(a?.submission?.status || a?.submission?.file_url);
      if (submitted) {
        assignmentSubmittedByVideo.set(vid, true);
      }
    }
  } catch {
    // ignore
  }

  return {
    course,
    videos,
    durationMap,
    progressData,
    assignmentCountByVideo,
    assignmentSubmittedByVideo,
    assignmentMarksByVideo,
  };
}

const CourseViewPage: React.FC<CourseViewPageProps> = ({ courseId: courseIdProp }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const courseId = courseIdProp || null;
  const parsedCourseId = useMemo(() => {
    if (!courseId) return null;
    const parsed = Number.parseInt(courseId, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [courseId]);
  const [course, setCourse] = useState<Course | null>(null);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Map<number, number>>(new Map()); // videoId -> progress percentage
  const [videoWatchedTime, setVideoWatchedTime] = useState<Map<number, number>>(new Map()); // videoId -> watched time in seconds
  const [quizAttemptCountMap, setQuizAttemptCountMap] = useState<Map<number, number>>(new Map());
  const [quizLockedMap, setQuizLockedMap] = useState<Map<number, boolean>>(new Map());
  const [videoTotalDuration, setVideoTotalDuration] = useState<Map<number, number>>(new Map()); // videoId -> total duration in seconds
  const [assignmentCountByVideo, setAssignmentCountByVideo] = useState<Map<number, number>>(new Map());
  const [assignmentSubmittedByVideo, setAssignmentSubmittedByVideo] = useState<Map<number, boolean>>(new Map());
  const [assignmentMarksByVideo, setAssignmentMarksByVideo] = useState<Map<number, { awarded: number; total: number }>>(new Map());
  const [iframeError, setIframeError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Quiz display state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizVideoId, setQuizVideoId] = useState<number | null>(null);
  // Assignments display state (separate view, not below video)
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentsVideoId, setAssignmentsVideoId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isDesktopView = useDesktopViewportState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  type YoutubePlayer = {
    getPlayerState?: () => number;
    playVideo?: () => void;
    pauseVideo?: () => void;
  };
  const youtubePlayerRef = useRef<YoutubePlayer | null>(null); // YouTube IFrame API player instance
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> elapsed seconds
  const lastTrackedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> last tracked time (for seek detection)
  const actualWatchedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> actual watched time (excluding seeks)
  const progressSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSyncRef = useRef<Map<number, { seconds: number; completed: boolean }>>(new Map());

  const selectedVideoMetaForYt = useMemo(
    () => (selectedVideoId ? videos.find((v) => v.id === selectedVideoId) : null),
    [videos, selectedVideoId]
  );
  const selectedUrlIsYouTube = isEmbeddableYouTubeUrl(selectedVideoMetaForYt?.video_url);

  /** Auto-load IFrame API whenever the selected lecture is an embeddable YouTube URL (no manual "Load Video"). */
  const ytProgressScriptRequested = selectedUrlIsYouTube;

  const youtubeApiReady = useYouTubeIframeApiLazy(ytProgressScriptRequested);

  const [ytApiTimedOut, setYtApiTimedOut] = useState(false);
  useEffect(() => {
    if (!selectedUrlIsYouTube) {
      setYtApiTimedOut(false);
      return;
    }
    if (youtubeApiReady) {
      setYtApiTimedOut(false);
      return;
    }
    const id = globalThis.setTimeout(() => setYtApiTimedOut(true), 12000);
    return () => globalThis.clearTimeout(id);
  }, [selectedUrlIsYouTube, youtubeApiReady]);

  const youtubeApiPlayerAvailable =
    selectedUrlIsYouTube && youtubeApiReady && !ytApiTimedOut;
  const youtubeIframeFallbackActive = selectedUrlIsYouTube && ytApiTimedOut;

  const {
    quizPassedMap,
    quizExistsMap,
    quizScoresMap,
    checkQuizStatus,
    checkQuizExists,
    setLectureQuizPassedStatus
  } = useLectureQuizStatusTracking({
    userId: user?.id,
    videos,
    selectedVideoId,
    showQuiz,
    quizVideoId
  });

  useEffect(() => {
    if (videoWatched.size === 0) return;
    setQuizLockedMap((prev) => {
      let changed = false;
      const next = new Map(prev);
      videoWatched.forEach((videoId) => {
        if (next.get(videoId)) {
          next.set(videoId, false);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setQuizAttemptCountMap((prev) => {
      let changed = false;
      const next = new Map(prev);
      videoWatched.forEach((videoId) => {
        if (next.get(videoId)) {
          next.set(videoId, 0);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [videoWatched]);

  const loadCourseData = useCallback(async () => {
    if (!user?.id) {
      setError('You must be logged in to view this course.');
      setLoading(false);
      return;
    }
    if (!parsedCourseId) {
      setError('Invalid course link. Please go back and try again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const {
        course,
        videos,
        durationMap,
        progressData,
        assignmentCountByVideo,
        assignmentSubmittedByVideo,
        assignmentMarksByVideo,
      } = await fetchCourseViewData({
        courseId: parsedCourseId,
        userId: user.id
      });

      setCourse(course);
      setVideos(videos);
      setVideoTotalDuration(durationMap);
      setProgressRecords(progressData);

      setSelectedVideoId((prev) => {
        if (prev && videos.some((v) => v.id === prev)) return prev;
        if (videos.length > 0) return videos[0].id;
        return null;
      });

      const hydrated = hydrateProgressFromApi({ progressData, durationMap });
      hydrated.watchedTimeMap.forEach((w, vid) => {
        actualWatchedTimeRef.current.set(vid, w);
      });
      hydrated.lastTrackedInit.forEach((t, vid) => {
        lastTrackedTimeRef.current.set(vid, t);
      });
      setVideoWatched(hydrated.watched);
      setVideoWatchedTime(hydrated.watchedTimeMap);
      setVideoProgress(hydrated.progressMap);
      setAssignmentCountByVideo(assignmentCountByVideo);
      setAssignmentSubmittedByVideo(assignmentSubmittedByVideo);
      setAssignmentMarksByVideo(assignmentMarksByVideo);
    } catch (err: unknown) {
      // Use secure error handler
      logErrorSecurely(err, 'loadCourseData');
      const sanitized = sanitizeError(err);
      setError('Unable to load course content right now.');
      toast.error(sanitized.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [parsedCourseId, user?.id]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const markVideoAsCompleted = useMarkLectureAsCompleted({
    userId: user?.id,
    courseId,
    videos,
    videoWatched,
    videoWatchedTime,
    videoTotalDuration,
    actualWatchedTimeRef,
    setVideoWatched,
    setVideoProgress,
    setVideoWatchedTime,
    setProgressRecords
  });

  useCourseVideoPlaybackTracking({
    selectedVideoId,
    videos,
    youtubeApiReady,
    youtubeUsesIframeApiPlayer: youtubeApiPlayerAvailable,
    youtubeIframeFallbackActive,
    videoWatched,
    videoWatchedTime,
    markVideoAsCompleted,
    videoRef,
    youtubePlayerRef,
    progressIntervalRef,
    watchTimeIntervalRef,
    elapsedTimeRef,
    lastTrackedTimeRef,
    actualWatchedTimeRef,
    setVideoProgress,
    setVideoWatchedTime,
    setVideoTotalDuration
  });

  const {
    completedCount,
    totalVideos,
    progressPercentage,
    totalCourseDuration,
    totalWatchedTime,
    unlockedLectures,
    getNextLectureId,
    getPrevLectureId
  } = useCourseLectureProgressSummary({
    videos,
    progressRecords,
    videoTotalDuration,
    videoWatchedTime,
    videoProgress,
    quizExistsMap,
    quizPassedMap
  });

  const {
    openQuizForVideo,
    handleQuizComplete,
    handleQuizClose
  } = useCourseViewQuizLifecycleHandlers({
    userId: user?.id,
    courseId,
    quizVideoId,
    quizPassedMap,
    quizAttemptCountMap,
    checkQuizStatus,
    checkQuizExists,
    setLectureQuizPassedStatus,
    setQuizAttemptCountMap,
    setQuizLockedMap,
    getNextLectureId,
    setShowQuiz,
    setQuizVideoId,
    setSelectedVideoId,
    setVideoProgress,
    setVideoWatchedTime,
    setVideoWatched,
    setProgressRecords,
    actualWatchedTimeRef,
    lastTrackedTimeRef,
    elapsedTimeRef
  });

  const openAssignmentsForVideo = (videoId: number) => {
    if (!unlockedLectures.has(videoId)) {
      toast.error('This lecture is locked. Complete the previous lecture first.');
      return;
    }

    setSelectedVideoId(videoId);
    setAssignmentsVideoId(videoId);
    setShowAssignments(true);

    // Ensure quiz view isn't showing at the same time.
    setShowQuiz(false);
    setQuizVideoId(null);

    setIframeError(false);
  };

  const handleSelectVideo = (videoId: number) => {
    // Check if lecture is unlocked
    if (!unlockedLectures.has(videoId)) {
      toast.error('This lecture is locked. Complete the previous lecture first.');
      return;
    }
    setSelectedVideoId(videoId);
    // Selecting a lecture should return to the lecture/video view.
    setShowAssignments(false);
    setAssignmentsVideoId(null);
    setShowQuiz(false);
    setQuizVideoId(null);
    setIframeError(false); // Reset error when switching videos
    // Don't reset progress/time when switching - keep accumulated values
  };

  useAutoSelectUnlockedLecture({
    selectedVideoId,
    videos,
    unlockedLectures,
    setSelectedVideoId
  });

  useEffect(() => {
    if (!user?.id || !parsedCourseId || !selectedVideoId) return;

    const watchedSeconds = Math.floor(videoWatchedTime.get(selectedVideoId) || 0);
    if (watchedSeconds <= 0) return;

    const duration = videoTotalDuration.get(selectedVideoId) || 0;
    const progressPct = duration > 0
      ? Math.min((watchedSeconds / duration) * 100, 100)
      : (videoProgress.get(selectedVideoId) || 0);
    const completed = progressPct >= 90;

    const lastSync = lastProgressSyncRef.current.get(selectedVideoId);
    const shouldSync =
      !lastSync ||
      watchedSeconds - lastSync.seconds >= 10 ||
      (completed && !lastSync.completed);

    if (!shouldSync) return;

    if (progressSyncTimeoutRef.current) {
      clearTimeout(progressSyncTimeoutRef.current);
    }

    progressSyncTimeoutRef.current = setTimeout(async () => {
      try {
        await coursesApi.updateProgress({
          user_id: user.id,
          course_id: parsedCourseId,
          video_id: selectedVideoId,
          score: watchedSeconds,
          completed
        });
        lastProgressSyncRef.current.set(selectedVideoId, { seconds: watchedSeconds, completed });
      } catch (err) {
        logErrorSecurely(err, 'syncWatchTime');
      }
    }, 1200);

    return () => {
      if (progressSyncTimeoutRef.current) {
        clearTimeout(progressSyncTimeoutRef.current);
        progressSyncTimeoutRef.current = null;
      }
    };
  }, [
    user?.id,
    parsedCourseId,
    selectedVideoId,
    videoWatchedTime,
    videoTotalDuration,
    videoProgress
  ]);

  // Get selected video, but only if it's unlocked
  const selectedVideo = selectedVideoId
    ? videos.find((video) => video.id === selectedVideoId && unlockedLectures.has(video.id))
    : null;
  const selectedVideoIsYouTube = isEmbeddableYouTubeUrl(selectedVideo?.video_url);

  const courseTitle = course?.title || course?.name || 'Course';
  const selectedVideoIndex = selectedVideo
    ? videos.findIndex((video) => video.id === selectedVideo.id)
    : -1;
  const lecturePosition = selectedVideoIndex >= 0 ? `${selectedVideoIndex + 1} / ${videos.length}` : '';

  const showDesktopLectureListFab = isDesktopView && isSidebarCollapsed;

  const desktopShowListBtnClass = [
    'btn-plain btn-no-glass absolute left-0 top-4 z-20 -translate-x-1/2 grid h-8 w-12 place-items-center justify-end rounded-md border pe-2.5 shadow-sm',
    isDarkMode ? 'border-cyan-600/50 bg-gray-800 text-cyan-300' : 'border-cyan-500/50 bg-white text-cyan-700',
  ].join(' ');

  const selectedVideoWatchedSeconds = selectedVideo ? (videoWatchedTime.get(selectedVideo.id) || 0) : 0;
  const selectedVideoProgress = selectedVideo ? (videoProgress.get(selectedVideo.id) || 0) : 0;
  const selectedVideoTotalSeconds = selectedVideo
    ? (videoTotalDuration.get(selectedVideo.id) || selectedVideo.duration || 0)
    : 0;
  const selectedQuizExists = selectedVideo ? (quizExistsMap.get(selectedVideo.id) || false) : false;
  const selectedQuizPassed = selectedVideo && selectedQuizExists
    ? (quizPassedMap.get(selectedVideo.id) || false)
    : false;
  const selectedQuizLocked = selectedVideo
    ? (quizLockedMap.get(selectedVideo.id) || false)
    : false;
  const selectedNextLectureId = selectedVideo ? getNextLectureId(selectedVideo.id) : null;
  const selectedPrevLectureId = selectedVideo ? getPrevLectureId(selectedVideo.id) : null;
  const selectedHasNext = selectedNextLectureId !== null;
  const selectedHasPrev = selectedPrevLectureId !== null;
  // YouTube embeds can be blocked by Google's anti-bot challenge on some networks.
  // In that case, allow manual completion so course flow doesn't get stuck.
  const selectedCanComplete =
    selectedVideoProgress >= 90 ||
    (selectedVideoIsYouTube && youtubeIframeFallbackActive) ||
    (selectedVideoIsYouTube && iframeError);

  useEffect(() => {
    setIsPlaying(false);
  }, [selectedVideoId]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || selectedVideoIsYouTube) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);

    setIsPlaying(!videoEl.paused);

    return () => {
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [selectedVideoId, selectedVideoIsYouTube]);

  useEffect(() => {
    if (!selectedVideoIsYouTube || !youtubeApiPlayerAvailable) return;

    const interval = setInterval(() => {
      try {
        const player = youtubePlayerRef.current;
        if (!player || typeof player.getPlayerState !== 'function') return;
        const state = player.getPlayerState();
        setIsPlaying(state === (window as any).YT?.PlayerState?.PLAYING);
      } catch {
        /* ignore */
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedVideoIsYouTube, youtubeApiPlayerAvailable]);

  const handleTogglePlay = () => {
    if (selectedVideoIsYouTube) {
      const player = youtubePlayerRef.current;
      if (player && typeof player.getPlayerState === 'function') {
        const state = player.getPlayerState();
        if (state === (window as any).YT?.PlayerState?.PLAYING) {
          player.pauseVideo?.();
          setIsPlaying(false);
        } else {
          player.playVideo?.();
          setIsPlaying(true);
        }
      }
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  };

  if (loading) {
    return <CourseViewLoadingState isDarkMode={isDarkMode} />;
  }

  if (error || !course) {
    return (
      <CourseViewErrorState
        isDarkMode={isDarkMode}
        error={error}
        onBack={() => router.push('/student/courses')}
      />
    );
  }

  return (
    <div className="min-h-0 lg:min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-14 sm:pt-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-3.5rem)] sm:lg:h-[calc(100vh-4rem)]">
          <CourseViewLectureListPanels
            isDarkMode={isDarkMode}
            isSidebarOpen={isSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            courseTitle={courseTitle}
            progressPercentage={progressPercentage}
            completedCount={completedCount}
            totalVideos={totalVideos}
            totalCourseDuration={totalCourseDuration}
            totalWatchedTime={totalWatchedTime}
            videos={videos}
            videoWatched={videoWatched}
            selectedVideoId={selectedVideoId}
            unlockedLectures={unlockedLectures}
            quizExistsMap={quizExistsMap}
            quizScoresMap={quizScoresMap}
            quizLockedMap={quizLockedMap}
            videoTotalDuration={videoTotalDuration}
            videoWatchedTime={videoWatchedTime}
            videoProgress={videoProgress}
            assignmentCountByVideo={assignmentCountByVideo}
            assignmentSubmittedByVideo={assignmentSubmittedByVideo}
            assignmentMarksByVideo={assignmentMarksByVideo}
            onSelectVideo={handleSelectVideo}
            onOpenAssignmentForVideo={openAssignmentsForVideo}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onCollapseSidebar={() => setIsSidebarCollapsed(true)}
          />

          {/* Right Side - Video Player or Quiz */}
          <div
            className={`relative order-1 lg:order-2 flex-1 overflow-visible lg:overflow-hidden ${
              showDesktopLectureListFab ? 'lg:ps-6' : ''
            } ${
              /* Keep a minimal desktop gutter so content stays close to sidebar edge. */
              isDesktopView && !isSidebarCollapsed ? 'lg:ps-2' : ''
            }`}
          >
            {showDesktopLectureListFab && (
              <button
                type="button"
                className={desktopShowListBtnClass}
                onClick={() => {
                  setIsSidebarCollapsed(false);
                }}
                title="Show lecture list"
                aria-label="Show lecture list"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!isDesktopView && (
              <MobileLectureToggleButton
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
              />
            )}
            {showQuiz && quizVideoId ? (
              <div className={`relative z-30 h-full min-h-0 ${showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''}`}>
                <QuizComponent
                  videoId={quizVideoId}
                  courseId={parsedCourseId || 0}
                  onQuizComplete={handleQuizComplete}
                  onClose={handleQuizClose}
                />
              </div>
            ) : showAssignments && assignmentsVideoId ? (
              <div
                className={`relative z-30 h-auto lg:h-full overflow-visible lg:overflow-y-auto p-4 sm:p-6 ${
                  showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''
                } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignments(false);
                      setAssignmentsVideoId(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      isDarkMode
                        ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Back to lecture
                  </button>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignments</h2>
                </div>
                <CourseViewAssignmentsPanel
                  courseId={parsedCourseId || 0}
                  selectedVideoId={assignmentsVideoId}
                  isDarkMode={isDarkMode}
                />
              </div>
            ) : (
              <div
                className={`relative z-30 h-auto lg:h-full overflow-visible lg:overflow-y-auto p-4 sm:p-6 ${
                  showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''
                } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
              >
                {videos.length > 0 && selectedVideo ? (
                <div>
                  <CourseViewLectureHeader
                    isDarkMode={isDarkMode}
                    courseTitle={courseTitle}
                    lectureTitle={selectedVideo.title}
                    lecturePosition={lecturePosition}
                    lectureDescription={selectedVideo.description}
                    watched={videoWatched.has(selectedVideo.id)}
                    canComplete={selectedCanComplete}
                    hasPrev={selectedHasPrev}
                    hasNext={selectedHasNext}
                    quizExists={selectedQuizExists}
                    quizPassed={selectedQuizPassed}
                    quizLocked={selectedQuizLocked}
                    onPrev={() => {
                      if (selectedPrevLectureId) handleSelectVideo(selectedPrevLectureId);
                    }}
                    onTakeQuiz={() => {
                      openQuizForVideo(selectedVideo.id);
                    }}
                    onNext={() => {
                      if (selectedNextLectureId) handleSelectVideo(selectedNextLectureId);
                    }}
                    onCompleteAndNext={async () => {
                      if (!selectedCanComplete) return;

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
                    }}
                  />
                  {/* Video Player */}
                  <div className={`rounded-xl shadow-lg overflow-hidden mb-6 ${
                    isDarkMode
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="aspect-video bg-black relative overflow-hidden">
                      <CourseViewVideoPlayer
                        isDarkMode={isDarkMode}
                        selectedVideo={selectedVideo}
                        iframeError={iframeError}
                        youtubeApiPlayerAvailable={youtubeApiPlayerAvailable}
                        youtubeApiTimedOut={ytApiTimedOut}
                        iframeRef={iframeRef}
                        videoRef={videoRef}
                        onIframeLoaded={() => setIframeError(false)}
                        onIframeError={() => setIframeError(true)}
                        onRetryIframe={() => setIframeError(false)}
                        onVideoEnded={markVideoAsCompleted}
                      />
                    </div>

                    {selectedVideo.video_url && (
                      <CourseViewVideoProgressPanel
                        isDarkMode={isDarkMode}
                        watchedSeconds={selectedVideoWatchedSeconds}
                        progress={selectedVideoProgress}
                        totalSeconds={selectedVideoTotalSeconds}
                        isPlaying={isPlaying}
                        onTogglePlay={handleTogglePlay}
                      />
                    )}
                  </div>

                </div>
              ) : (
                <CourseViewEmptyLecturesState isDarkMode={isDarkMode} />
              )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;

