import { useCallback, useEffect, useState } from 'react';
import { coursesApi } from '@/lib/api';
import { logErrorSecurely } from '@/lib/utils/errorHandler';
import type { QuizScore, Video } from '../types';

interface UseLectureQuizStatusTrackingArgs {
  userId?: string;
  videos: Video[];
  selectedVideoId: number | null;
  showQuiz: boolean;
  quizVideoId: number | null;
}

export const useLectureQuizStatusTracking = ({
  userId,
  videos,
  selectedVideoId,
  showQuiz,
  quizVideoId
}: UseLectureQuizStatusTrackingArgs) => {
  const [quizPassedMap, setQuizPassedMap] = useState<Map<number, boolean>>(new Map());
  const [quizExistsMap, setQuizExistsMap] = useState<Map<number, boolean>>(new Map());
  const [quizScoresMap, setQuizScoresMap] = useState<Map<number, QuizScore>>(new Map());

  const setLectureQuizPassedStatus = useCallback((videoId: number, passed: boolean) => {
    setQuizPassedMap((prev) => {
      const next = new Map(prev);
      next.set(videoId, passed);
      return next;
    });
  }, []);

  const checkQuizStatus = useCallback(async (videoId: number) => {
    if (!userId) return false;

    try {
      const result = await coursesApi.hasUserPassedQuiz(videoId, userId);
      if (result.success && result.data) {
        const quizData = result.data as { passed?: boolean };
        const passed = quizData.passed || false;
        setLectureQuizPassedStatus(videoId, passed);

        try {
          const attemptsResult = await coursesApi.getUserQuizAttempts(videoId, userId);
          if (attemptsResult.success && attemptsResult.data) {
            const attemptsData = attemptsResult.data as Array<{
              score?: number;
              total_marks?: number;
              percentage?: number;
            }>;
            if (Array.isArray(attemptsData) && attemptsData.length > 0) {
              const latestAttempt = attemptsData[0];
              setQuizScoresMap((prev) => {
                const next = new Map(prev);
                next.set(videoId, {
                  score: latestAttempt.score || 0,
                  total_marks: latestAttempt.total_marks || 10,
                  percentage: latestAttempt.percentage || 0
                });
                return next;
              });
            }
          }
        } catch (scoreErr) {
          logErrorSecurely(scoreErr, 'fetchQuizScores');
        }

        return passed;
      }
    } catch (err) {
      logErrorSecurely(err, 'checkQuizStatus');
    }
    return false;
  }, [setLectureQuizPassedStatus, userId]);

  const checkQuizExists = useCallback(async (videoId: number) => {
    try {
      const result = await coursesApi.getQuizByVideoId(videoId);
      const exists = result.success && result.data !== null;
      setQuizExistsMap((prev) => {
        const next = new Map(prev);
        next.set(videoId, exists);
        return next;
      });
      return exists;
    } catch (err) {
      logErrorSecurely(err, 'checkQuizExists');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!userId || videos.length === 0) return;
    let active = true;

    const checkAllQuizzes = async () => {
      for (const video of videos) {
        if (!active) break;
        const exists = await checkQuizExists(video.id);
        if (exists) {
          await checkQuizStatus(video.id);
        }
      }
    };

    checkAllQuizzes();
    return () => {
      active = false;
    };
  }, [videos, userId, checkQuizExists, checkQuizStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId && videos.length > 0 && selectedVideoId) {
        checkQuizExists(selectedVideoId).then((exists) => {
          if (exists) {
            checkQuizStatus(selectedVideoId);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedVideoId, userId, videos.length, checkQuizExists, checkQuizStatus]);

  useEffect(() => {
    if (!showQuiz && quizVideoId === null && userId && videos.length > 0) {
      const refreshAllQuizStatus = async () => {
        for (const video of videos) {
          const exists = await checkQuizExists(video.id);
          if (exists) {
            await checkQuizStatus(video.id);
          }
        }
      };
      refreshAllQuizStatus();
    }
  }, [showQuiz, quizVideoId, userId, videos, checkQuizExists, checkQuizStatus]);

  return {
    quizPassedMap,
    quizExistsMap,
    quizScoresMap,
    checkQuizStatus,
    checkQuizExists,
    setLectureQuizPassedStatus
  };
};
