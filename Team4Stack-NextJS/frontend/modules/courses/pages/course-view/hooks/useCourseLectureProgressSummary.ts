import { useCallback, useMemo } from 'react';
import type { ProgressRecord, Video } from '../types';

interface UseCourseLectureProgressSummaryArgs {
  videos: Video[];
  progressRecords: ProgressRecord[];
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  quizExistsMap: Map<number, boolean>;
  quizPassedMap: Map<number, boolean>;
}

export const useCourseLectureProgressSummary = ({
  videos,
  progressRecords,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  quizExistsMap,
  quizPassedMap
}: UseCourseLectureProgressSummaryArgs) => {
  const progressByVideo = useMemo(() => {
    const map = new Map<number, ProgressRecord>();
    progressRecords.forEach((record) => {
      if (record.video_id) {
        map.set(record.video_id, record);
      }
    });
    return map;
  }, [progressRecords]);

  const completedCount = useMemo(
    () => progressRecords.filter((record) => record.video_id && record.completed).length,
    [progressRecords]
  );

  const totalVideos = videos.length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  const normalizeDuration = useCallback((value: unknown) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) && value > 0 ? value : 0;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
      const parts = trimmed.split(':').map((part) => Number(part));
      if (parts.some((part) => Number.isNaN(part))) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return 0;
  }, []);

  const totalCourseDuration = useMemo(() => {
    return videos.reduce((total, video) => {
      const rawDuration = videoTotalDuration.get(video.id) ?? video.duration;
      const safeDuration = normalizeDuration(rawDuration);
      return total + safeDuration;
    }, 0);
  }, [videos, videoTotalDuration, normalizeDuration]);

  const totalWatchedTime = useMemo(() => {
    return videos.reduce((total, video) => {
      const watchedFromMap = videoWatchedTime.get(video.id);
      const record = progressByVideo.get(video.id);
      const watched = typeof watchedFromMap === 'number' && watchedFromMap > 0
        ? watchedFromMap
        : (record?.score || 0);
      const rawDuration = videoTotalDuration.get(video.id) ?? video.duration;
      const safeDuration = normalizeDuration(rawDuration);
      const safeWatched = safeDuration > 0 ? Math.min(watched, safeDuration) : Math.max(watched, 0);
      return total + safeWatched;
    }, 0);
  }, [videos, videoWatchedTime, videoTotalDuration, progressByVideo, normalizeDuration]);

  const getVideoDuration = useCallback((video: Video) => {
    const rawDuration = videoTotalDuration.get(video.id) ?? video.duration;
    return normalizeDuration(rawDuration);
  }, [videoTotalDuration, normalizeDuration]);

  const getVideoProgressPercent = useCallback((video: Video) => {
    const record = progressByVideo.get(video.id);
    if (record?.completed) return 100;

    const watchedFromMap = videoWatchedTime.get(video.id);
    const watched = typeof watchedFromMap === 'number' && watchedFromMap > 0
      ? watchedFromMap
      : (record?.score || 0);
    const duration = getVideoDuration(video);
    const fromTime = duration > 0 ? Math.min(100, (watched / duration) * 100) : 0;
    const fromMap = videoProgress.get(video.id) || 0;
    return Math.max(fromTime, fromMap);
  }, [getVideoDuration, progressByVideo, videoProgress, videoWatchedTime]);

  const unlockedLectures = useMemo(() => {
    const unlocked = new Set<number>();
    if (videos.length === 0) return unlocked;

    unlocked.add(videos[0].id);

    for (let i = 1; i < videos.length; i++) {
      const previousVideo = videos[i - 1];
      const previousProgress = getVideoProgressPercent(previousVideo);
      const progressMet = previousProgress >= 90;

      if (!progressMet) break;

      unlocked.add(videos[i].id);
    }

    return unlocked;
  }, [
    videos,
    getVideoProgressPercent
  ]);

  const getNextLectureId = useCallback(
    (currentVideoId: number): number | null => {
      const currentIndex = videos.findIndex((video) => video.id === currentVideoId);
      if (currentIndex < 0) return null;

      // Only return the next *unlocked* lecture so header navigation matches sidebar state.
      for (let i = currentIndex + 1; i < videos.length; i += 1) {
        const vid = videos[i]?.id;
        if (vid != null && unlockedLectures.has(vid)) return vid;
      }
      return null;
    },
    [videos, unlockedLectures]
  );

  const getPrevLectureId = useCallback((currentVideoId: number): number | null => {
    const currentIndex = videos.findIndex((video) => video.id === currentVideoId);
    if (currentIndex <= 0) return null;

    for (let i = currentIndex - 1; i >= 0; i -= 1) {
      const video = videos[i];
      if (video && unlockedLectures.has(video.id)) {
        return video.id;
      }
    }
    return null;
  }, [videos, unlockedLectures]);

  return {
    progressByVideo,
    completedCount,
    totalVideos,
    progressPercentage,
    totalCourseDuration,
    totalWatchedTime,
    unlockedLectures,
    getNextLectureId,
    getPrevLectureId
  };
};
