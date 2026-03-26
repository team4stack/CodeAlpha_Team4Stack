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

  const totalCourseDuration = useMemo(() => {
    return videos.reduce((total, video) => {
      const duration = videoTotalDuration.get(video.id) || video.duration || 0;
      return total + duration;
    }, 0);
  }, [videos, videoTotalDuration]);

  const totalWatchedTime = useMemo(() => {
    return videos.reduce((total, video) => {
      const watched = videoWatchedTime.get(video.id) || 0;
      const duration = videoTotalDuration.get(video.id) || video.duration || 0;
      const safeWatched = duration > 0 ? Math.min(watched, duration) : watched;
      return total + safeWatched;
    }, 0);
  }, [videos, videoWatchedTime, videoTotalDuration]);

  const unlockedLectures = useMemo(() => {
    const unlocked = new Set<number>();
    if (videos.length === 0) return unlocked;

    unlocked.add(videos[0].id);

    for (let i = 1; i < videos.length; i++) {
      const previousVideo = videos[i - 1];
      const duration =
        videoTotalDuration.get(previousVideo.id) || previousVideo.duration || 0;
      const watchedSeconds = videoWatchedTime.get(previousVideo.id) || 0;
      const fromTime =
        duration > 0 ? Math.min(100, (watchedSeconds / duration) * 100) : 0;
      const fromMap = videoProgress.get(previousVideo.id) || 0;
      const previousProgress = Math.max(fromTime, fromMap);
      const progressMet = previousProgress >= 90;

      if (!progressMet) break;

      const quizExists = quizExistsMap.get(previousVideo.id);
      if (quizExists) {
        const quizPassed = quizPassedMap.get(previousVideo.id);
        if (!quizPassed) break;
      }

      unlocked.add(videos[i].id);
    }

    return unlocked;
  }, [
    videos,
    videoProgress,
    videoWatchedTime,
    videoTotalDuration,
    quizExistsMap,
    quizPassedMap
  ]);

  const getNextLectureId = useCallback((currentVideoId: number): number | null => {
    const currentIndex = videos.findIndex((video) => video.id === currentVideoId);
    if (currentIndex >= 0 && currentIndex < videos.length - 1) {
      return videos[currentIndex + 1].id;
    }
    return null;
  }, [videos]);

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
