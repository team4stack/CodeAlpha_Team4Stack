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
  courseId: string;
  userId: string;
}): Promise<{
  parsedCourseId: number;
  course: Course | null;
  videos: Video[];
  durationMap: Map<number, number>;
  progressData: ProgressRecord[];
  assignmentCountByVideo: Map<number, number>;
}> {
  const parsedCourseId = Number.parseInt(args.courseId, 10);

  const courseResult = await coursesApi.getCourseById(parsedCourseId);
  if (courseResult.error) throw new Error(String(courseResult.error));
  const course = (courseResult.data as Course) || null;

  const videosResult = await coursesApi.getCourseVideos(parsedCourseId);
  if (videosResult.error) throw new Error(String(videosResult.error));
  const videos = (videosResult.data as Video[]) || [];

  const durationMap = new Map<number, number>();
  for (const v of videos) {
    if (v?.duration && v.duration > 0) durationMap.set(v.id, v.duration);
  }

  const progressResult = await coursesApi.getUserProgress(args.userId, parsedCourseId);
  const progressData = progressResult.error ? [] : ((progressResult.data as ProgressRecord[]) || []);

  // For sidebar accordion sub-items (quiz/assignments). Keep it non-blocking.
  const assignmentCountByVideo = new Map<number, number>();
  try {
    const assignmentsResult = await coursesApi.getAssignmentsByCourse(parsedCourseId);
    const list = assignmentsResult.error ? [] : ((assignmentsResult.data as any[]) || []);
    for (const a of list) {
      const vidRaw = a?.video_id;
      const vid = typeof vidRaw === 'number' ? vidRaw : Number(vidRaw);
      if (!Number.isFinite(vid) || vid <= 0) continue;
      const prev = assignmentCountByVideo.get(vid) || 0;
      assignmentCountByVideo.set(vid, prev + 1);
    }
  } catch {
    // ignore
  }

  return { parsedCourseId, course, videos, durationMap, progressData, assignmentCountByVideo };
}

const CourseViewPage: React.FC<CourseViewPageProps> = ({ courseId: courseIdProp }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const courseId = courseIdProp || null;
  const [course, setCourse] = useState<Course | null>(null);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Map<number, number>>(new Map()); // videoId -> progress percentage
  const [videoWatchedTime, setVideoWatchedTime] = useState<Map<number, number>>(new Map()); // videoId -> watched time in seconds
  const [videoTotalDuration, setVideoTotalDuration] = useState<Map<number, number>>(new Map()); // videoId -> total duration in seconds
  const [assignmentCountByVideo, setAssignmentCountByVideo] = useState<Map<number, number>>(new Map());
  const [iframeError, setIframeError] = useState(false);
  // Quiz display state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizVideoId, setQuizVideoId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isDesktopView = useDesktopViewportState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubePlayerRef = useRef<unknown>(null); // YouTube IFrame API player instance
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> elapsed seconds
  const lastTrackedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> last tracked time (for seek detection)
  const actualWatchedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> actual watched time (excluding seeks)

  const selectedVideoMetaForYt = useMemo(
    () => (selectedVideoId ? videos.find((v) => v.id === selectedVideoId) : null),
    [videos, selectedVideoId]
  );
  const selectedUrlIsYouTube = Boolean(
    selectedVideoMetaForYt?.video_url &&
      (selectedVideoMetaForYt.video_url.includes('youtube.com') ||
        selectedVideoMetaForYt.video_url.includes('youtu.be')) &&
      convertToEmbedUrl(selectedVideoMetaForYt.video_url) !== null
  );

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

  const loadCourseData = useCallback(async () => {
    if (!courseId || !user?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      const { course, videos, durationMap, progressData, assignmentCountByVideo } = await fetchCourseViewData({
        courseId,
        userId: user.id
      });

      setCourse(course);
      setVideos(videos);
      setVideoTotalDuration(durationMap);
      setProgressRecords(progressData);

      if (videos.length > 0) setSelectedVideoId(videos[0].id);
      else setSelectedVideoId(null);

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
    } catch (err: unknown) {
      // Use secure error handler
      logErrorSecurely(err, 'loadCourseData');
      const sanitized = sanitizeError(err);
      setError('Unable to load course content right now.');
      toast.error(sanitized.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

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
    checkQuizStatus,
    checkQuizExists,
    setLectureQuizPassedStatus,
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

  const handleSelectVideo = (videoId: number) => {
    // Check if lecture is unlocked
    if (!unlockedLectures.has(videoId)) {
      toast.error('This lecture is locked. Complete the previous lecture first.');
      return;
    }
    setSelectedVideoId(videoId);
    setIframeError(false); // Reset error when switching videos
    // Don't reset progress/time when switching - keep accumulated values
  };

  useAutoSelectUnlockedLecture({
    selectedVideoId,
    videos,
    unlockedLectures,
    setSelectedVideoId
  });

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

  // Get selected video, but only if it's unlocked
  const selectedVideo = selectedVideoId
    ? videos.find((video) => video.id === selectedVideoId && unlockedLectures.has(video.id))
    : null;
  const selectedVideoIsYouTube = Boolean(
    selectedVideo?.video_url &&
      (selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be'))
  );

  const courseTitle = course.title || course.name || 'Course';
  const selectedVideoIndex = selectedVideo
    ? videos.findIndex((video) => video.id === selectedVideo.id)
    : -1;
  const lecturePosition = selectedVideoIndex >= 0 ? `${selectedVideoIndex + 1} / ${videos.length}` : '';

  const showDesktopLectureListFab = isDesktopView && isSidebarCollapsed;

  const desktopShowListBtnClass = [
    'btn-plain btn-no-liquid absolute left-0 top-4 z-20 -translate-x-1/2 grid h-8 w-12 place-items-center justify-end rounded-md border pe-2.5 shadow-sm',
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
  const selectedNextLectureId = selectedVideo ? getNextLectureId(selectedVideo.id) : null;
  const selectedPrevLectureId = selectedVideo ? getPrevLectureId(selectedVideo.id) : null;
  const selectedHasNext = selectedNextLectureId !== null;
  const selectedHasPrev = selectedPrevLectureId !== null;
  // YouTube embeds can be blocked by Google's anti-bot challenge on some networks.
  // In that case, allow manual completion so course flow doesn't get stuck.
  const selectedCanComplete = selectedVideoProgress >= 90 || selectedVideoIsYouTube;

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
            videoTotalDuration={videoTotalDuration}
            videoWatchedTime={videoWatchedTime}
            videoProgress={videoProgress}
            assignmentCountByVideo={assignmentCountByVideo}
            onSelectVideo={handleSelectVideo}
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
                courseId={courseId ? Number.parseInt(courseId) : 0}
                onQuizComplete={handleQuizComplete}
                onClose={handleQuizClose}
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
                    onPrev={() => {
                      if (selectedPrevLectureId) setSelectedVideoId(selectedPrevLectureId);
                    }}
                    onTakeQuiz={() => {
                      openQuizForVideo(selectedVideo.id);
                    }}
                    onNext={() => {
                      if (selectedNextLectureId) setSelectedVideoId(selectedNextLectureId);
                    }}
                    onCompleteAndNext={async () => {
                      if (!selectedCanComplete) return;

                      await markVideoAsCompleted(selectedVideo.id);

                      const exists = await checkQuizExists(selectedVideo.id);
                      if (exists) {
                        const passed = await checkQuizStatus(selectedVideo.id);
                        if (!passed) {
                          openQuizForVideo(selectedVideo.id);
                          return;
                        }
                      }

                      if (selectedHasNext && selectedNextLectureId) {
                        setTimeout(() => {
                          setSelectedVideoId(selectedNextLectureId);
                        }, 500);
                      }
                    }}
                  />
                  <CourseViewGlobalCourseStats
                    isDarkMode={isDarkMode}
                    totalVideos={totalVideos}
                    totalCourseDuration={totalCourseDuration}
                    totalWatchedTime={totalWatchedTime}
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
                      />
                    )}
                  </div>


                  <CourseViewAssignmentsPanel
                    courseId={courseId ? Number.parseInt(courseId, 10) : 0}
                    selectedVideoId={selectedVideo.id}
                    isDarkMode={isDarkMode}
                  />

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

