import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { coursesApi } from '@/lib/api';
import { logErrorSecurely, sanitizeError } from '@/lib/utils/errorHandler';
import type { ProgressRecord, Video } from '../types';

interface UseMarkLectureAsCompletedArgs {
  userId?: string;
  courseId: string | null;
  videos: Video[];
  videoWatched: Set<number>;
  videoWatchedTime: Map<number, number>;
  videoTotalDuration: Map<number, number>;
  actualWatchedTimeRef: RefObject<Map<number, number>>;
  setVideoWatched: Dispatch<SetStateAction<Set<number>>>;
  setVideoProgress: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatchedTime: Dispatch<SetStateAction<Map<number, number>>>;
  setProgressRecords: Dispatch<SetStateAction<ProgressRecord[]>>;
}

export const useMarkLectureAsCompleted = ({
  userId,
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
}: UseMarkLectureAsCompletedArgs) => {
  return useCallback(async (videoId: number) => {
    if (!userId || !courseId || videoWatched.has(videoId)) return;

    try {
      const currentVideo = videos.find((video) => video.id === videoId);
      if (!currentVideo) {
        throw new Error('Video not found');
      }

      const videoDuration = videoTotalDuration.get(videoId) || currentVideo.duration || 0;
      const actualWatchedTime = actualWatchedTimeRef.current?.get(videoId) || videoWatchedTime.get(videoId) || 0;
      const clampedWatchedTime = videoDuration > 0
        ? Math.min(actualWatchedTime, videoDuration)
        : actualWatchedTime;
      const finalWatchedTime = Math.max(clampedWatchedTime, 1);
      const actualProgress = videoDuration > 0
        ? Math.min((finalWatchedTime / videoDuration) * 100, 100)
        : 0;

      setVideoWatched((prev) => new Set(prev).add(videoId));
      setVideoProgress((prev) => new Map(prev).set(videoId, actualProgress));
      setVideoWatchedTime((prev) => new Map(prev).set(videoId, finalWatchedTime));

      const progressResult = await coursesApi.updateProgress({
        user_id: userId,
        course_id: Number(courseId),
        video_id: videoId,
        completed: true,
        score: Math.round(finalWatchedTime)
      });

      if (progressResult.error) {
        logErrorSecurely(progressResult.error, 'updateVideoProgress');
        const sanitized = sanitizeError(progressResult.error);
        toast.error(sanitized.message || 'Failed to update progress');
        return;
      }

      try {
        const reloadResult = await coursesApi.getUserProgress(userId, Number.parseInt(courseId));
        if (reloadResult.error) {
          logErrorSecurely(reloadResult.error, 'reloadProgressAfterUpdate');
        } else {
          setProgressRecords((reloadResult.data as ProgressRecord[]) || []);
        }
      } catch (reloadErr) {
        logErrorSecurely(reloadErr, 'reloadProgressAfterUpdate');
      }

      toast.success('Lecture marked as complete!');
    } catch (err: unknown) {
      logErrorSecurely(err, 'updateProgress');
      const sanitized = sanitizeError(err);
      toast.error(sanitized.message);
    }
  }, [
    userId,
    courseId,
    videoWatched,
    videos,
    videoTotalDuration,
    actualWatchedTimeRef,
    videoWatchedTime,
    setVideoWatched,
    setVideoProgress,
    setVideoWatchedTime,
    setProgressRecords
  ]);
};
