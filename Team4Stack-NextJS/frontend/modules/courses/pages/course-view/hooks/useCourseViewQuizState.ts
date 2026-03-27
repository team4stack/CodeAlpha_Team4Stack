'use client';

import { useState } from 'react';
import type { ProgressRecord, Video } from '../types';
import { useLectureQuizStatusTracking } from './useLectureQuizStatusTracking';
import { useCourseLectureProgressSummary } from './useCourseLectureProgressSummary';
import { useCourseViewQuizLocking } from './useCourseViewQuizLocking';

type CourseViewQuizStateArgs = {
  userId?: string;
  videos: Video[];
  selectedVideoId: number | null;
  showQuiz: boolean;
  quizVideoId: number | null;
  progressRecords: ProgressRecord[];
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  videoWatched: Set<number>;
};

export const useCourseViewQuizState = ({
  userId,
  videos,
  selectedVideoId,
  showQuiz,
  quizVideoId,
  progressRecords,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  videoWatched
}: CourseViewQuizStateArgs) => {
  const [quizAttemptCountMap, setQuizAttemptCountMap] = useState<Map<number, number>>(new Map());
  const [quizLockedMap, setQuizLockedMap] = useState<Map<number, boolean>>(new Map());

  const quizStatus = useLectureQuizStatusTracking({
    userId,
    videos,
    selectedVideoId,
    showQuiz,
    quizVideoId
  });

  const summary = useCourseLectureProgressSummary({
    videos,
    progressRecords,
    videoTotalDuration,
    videoWatchedTime,
    videoProgress,
    quizExistsMap: quizStatus.quizExistsMap,
    quizPassedMap: quizStatus.quizPassedMap
  });

  useCourseViewQuizLocking({
    videoWatched,
    setQuizLockedMap,
    setQuizAttemptCountMap
  });

  return {
    quizAttemptCountMap,
    quizLockedMap,
    setQuizAttemptCountMap,
    setQuizLockedMap,
    quizStatus,
    summary
  };
};
