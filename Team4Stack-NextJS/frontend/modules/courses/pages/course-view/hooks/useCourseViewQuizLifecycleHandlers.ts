import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { coursesApi } from '@/lib/api';
import { logErrorSecurely, sanitizeError } from '@/lib/utils/errorHandler';
import type { ProgressRecord } from '../types';

interface UseCourseViewQuizLifecycleHandlersArgs {
  userId?: string;
  courseId: string | null;
  quizVideoId: number | null;
  quizPassedMap: Map<number, boolean>;
  quizAttemptCountMap: Map<number, number>;
  checkQuizStatus: (videoId: number) => Promise<boolean>;
  checkQuizExists: (videoId: number) => Promise<boolean>;
  setLectureQuizPassedStatus: (videoId: number, passed: boolean) => void;
  setQuizAttemptCountMap: Dispatch<SetStateAction<Map<number, number>>>;
  setQuizLockedMap: Dispatch<SetStateAction<Map<number, boolean>>>;
  getNextLectureId: (currentVideoId: number) => number | null;
  setShowQuiz: (show: boolean) => void;
  setQuizVideoId: (videoId: number | null) => void;
  setSelectedVideoId: (videoId: number) => void;
  setVideoProgress: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatchedTime: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatched: Dispatch<SetStateAction<Set<number>>>;
  setProgressRecords: Dispatch<SetStateAction<ProgressRecord[]>>;
  actualWatchedTimeRef: RefObject<Map<number, number>>;
  lastTrackedTimeRef: RefObject<Map<number, number>>;
  elapsedTimeRef: RefObject<Map<number, number>>;
}

export const useCourseViewQuizLifecycleHandlers = ({
  userId,
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
}: UseCourseViewQuizLifecycleHandlersArgs) => {
  const openQuizForVideo = useCallback((videoId: number) => {
    setQuizVideoId(videoId);
    setShowQuiz(true);
  }, [setQuizVideoId, setShowQuiz]);

  const handleQuizComplete = useCallback(async (passed: boolean, _attemptCount: number) => {
    const currentQuizVideoId = quizVideoId;
    if (!currentQuizVideoId || !userId) return;

    setLectureQuizPassedStatus(currentQuizVideoId, passed);

    try {
      await Promise.all([
        checkQuizStatus(currentQuizVideoId),
        checkQuizExists(currentQuizVideoId)
      ]);
    } catch (err) {
      logErrorSecurely(err, 'refreshQuizStatus');
    }

    const previousAttempts = quizAttemptCountMap.get(currentQuizVideoId) || 0;
    const nextAttempts = passed ? 0 : previousAttempts + 1;
    setQuizAttemptCountMap((prev) => {
      const next = new Map(prev);
      next.set(currentQuizVideoId, nextAttempts);
      return next;
    });

    if (passed) {
      setQuizLockedMap((prev) => {
        const next = new Map(prev);
        next.set(currentQuizVideoId, false);
        return next;
      });
    }

    if (!passed && nextAttempts >= 2) {
      setQuizLockedMap((prev) => {
        const next = new Map(prev);
        next.set(currentQuizVideoId, true);
        return next;
      });
      try {
        const progressResult = await coursesApi.updateProgress({
          user_id: userId,
          course_id: Number(courseId),
          video_id: currentQuizVideoId,
          completed: false,
          score: 0
        });

        if (progressResult.error) {
          logErrorSecurely(progressResult.error, 'resetProgress');
          const sanitized = sanitizeError(progressResult.error);
          toast.error(sanitized.message || 'Failed to reset video progress. Please try again.');
          return;
        }

        setVideoProgress((prev) => {
          const next = new Map(prev);
          next.set(currentQuizVideoId, 0);
          return next;
        });
        setVideoWatchedTime((prev) => {
          const next = new Map(prev);
          next.set(currentQuizVideoId, 0);
          return next;
        });
        setVideoWatched((prev) => {
          const next = new Set(prev);
          next.delete(currentQuizVideoId);
          return next;
        });

        actualWatchedTimeRef.current.set(currentQuizVideoId, 0);
        lastTrackedTimeRef.current.set(currentQuizVideoId, 0);
        elapsedTimeRef.current.set(currentQuizVideoId, 0);

        try {
          const reloadResult = await coursesApi.getUserProgress(userId, Number.parseInt(courseId || '0'));
          if (!reloadResult.error && reloadResult.data) {
            setProgressRecords(reloadResult.data as ProgressRecord[]);
          }
        } catch (reloadErr) {
          logErrorSecurely(reloadErr, 'reloadProgressAfterReset');
        }

        toast.success('Video progress has been reset. Please watch the video again before retaking the quiz.');
      } catch (err) {
        logErrorSecurely(err, 'resetVideoProgress');
        const sanitized = sanitizeError(err);
        toast.error(sanitized.message || 'Failed to reset video progress. Please try again.');
      }
    }
  }, [
    quizVideoId,
    userId,
    setLectureQuizPassedStatus,
    quizAttemptCountMap,
    setQuizAttemptCountMap,
    setQuizLockedMap,
    checkQuizStatus,
    checkQuizExists,
    courseId,
    setVideoProgress,
    setVideoWatchedTime,
    setVideoWatched,
    actualWatchedTimeRef,
    lastTrackedTimeRef,
    elapsedTimeRef,
    setProgressRecords
  ]);

  const handleQuizClose = useCallback(async () => {
    const currentQuizVideoId = quizVideoId;
    setShowQuiz(false);
    setQuizVideoId(null);

    if (currentQuizVideoId && userId) {
      try {
        await Promise.all([
          checkQuizStatus(currentQuizVideoId),
          checkQuizExists(currentQuizVideoId)
        ]);

        const quizPassed = quizPassedMap.get(currentQuizVideoId);
        if (quizPassed) {
          const nextId = getNextLectureId(currentQuizVideoId);
          if (nextId) {
            setTimeout(() => {
              setSelectedVideoId(nextId);
              toast.success('Next lecture unlocked!');
            }, 300);
          } else {
            toast.success('Congratulations! You have completed all lectures in this course.');
          }
        }
      } catch (err) {
        logErrorSecurely(err, 'postQuizClose');
      }
    }
  }, [
    quizVideoId,
    setShowQuiz,
    setQuizVideoId,
    userId,
    checkQuizStatus,
    checkQuizExists,
    quizPassedMap,
    getNextLectureId,
    setSelectedVideoId
  ]);

  return {
    openQuizForVideo,
    handleQuizComplete,
    handleQuizClose
  };
};
