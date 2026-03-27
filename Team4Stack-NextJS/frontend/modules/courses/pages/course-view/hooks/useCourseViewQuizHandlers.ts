'use client';

import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCourseViewQuizLifecycleHandlers } from './useCourseViewQuizLifecycleHandlers';
import type { ProgressRecord } from '../types';

type QuizHandlersArgs = {
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
  getNextLectureId: (videoId: number) => number | null;
  setShowQuiz: (value: boolean) => void;
  setQuizVideoId: (value: number | null) => void;
  setSelectedVideoId: (value: number | null) => void;
  setVideoProgress: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatchedTime: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatched: Dispatch<SetStateAction<Set<number>>>;
  setProgressRecords: Dispatch<SetStateAction<ProgressRecord[]>>;
  actualWatchedTimeRef: RefObject<Map<number, number>>;
  lastTrackedTimeRef: RefObject<Map<number, number>>;
  elapsedTimeRef: RefObject<Map<number, number>>;
};

export const useCourseViewQuizHandlers = (args: QuizHandlersArgs) => {
  return useCourseViewQuizLifecycleHandlers({
    userId: args.userId,
    courseId: args.courseId,
    quizVideoId: args.quizVideoId,
    quizPassedMap: args.quizPassedMap,
    quizAttemptCountMap: args.quizAttemptCountMap,
    checkQuizStatus: args.checkQuizStatus,
    checkQuizExists: args.checkQuizExists,
    setLectureQuizPassedStatus: args.setLectureQuizPassedStatus,
    setQuizAttemptCountMap: args.setQuizAttemptCountMap,
    setQuizLockedMap: args.setQuizLockedMap,
    getNextLectureId: args.getNextLectureId,
    setShowQuiz: args.setShowQuiz,
    setQuizVideoId: args.setQuizVideoId,
    setSelectedVideoId: args.setSelectedVideoId,
    setVideoProgress: args.setVideoProgress,
    setVideoWatchedTime: args.setVideoWatchedTime,
    setVideoWatched: args.setVideoWatched,
    setProgressRecords: args.setProgressRecords,
    actualWatchedTimeRef: args.actualWatchedTimeRef,
    lastTrackedTimeRef: args.lastTrackedTimeRef,
    elapsedTimeRef: args.elapsedTimeRef
  });
};
