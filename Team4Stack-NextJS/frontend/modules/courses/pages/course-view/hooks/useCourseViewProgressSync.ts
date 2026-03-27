'use client';

import { useEffect, useRef } from 'react';
import { coursesApi } from '@/lib/api';
import { logErrorSecurely } from '@/lib/utils/errorHandler';

type ProgressSyncArgs = {
  userId?: string;
  parsedCourseId: number | null;
  selectedVideoId: number | null;
  videoWatchedTime: Map<number, number>;
  videoTotalDuration: Map<number, number>;
  videoProgress: Map<number, number>;
};

export const useCourseViewProgressSync = ({
  userId,
  parsedCourseId,
  selectedVideoId,
  videoWatchedTime,
  videoTotalDuration,
  videoProgress
}: ProgressSyncArgs) => {
  const progressSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSyncRef = useRef<Map<number, { seconds: number; completed: boolean }>>(new Map());

  useEffect(() => {
    if (!userId || !parsedCourseId || !selectedVideoId) return;

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
          user_id: userId,
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
  }, [userId, parsedCourseId, selectedVideoId, videoWatchedTime, videoTotalDuration, videoProgress]);
};
