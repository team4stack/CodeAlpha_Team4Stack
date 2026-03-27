'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';

type CourseViewPanelActionsArgs = {
  unlockedLectures: Set<number>;
  setSelectedVideoId: (id: number) => void;
  setShowAssignments: (value: boolean) => void;
  setAssignmentsVideoId: (value: number | null) => void;
  setShowQuiz: (value: boolean) => void;
  setQuizVideoId: (value: number | null) => void;
  setIframeError: (value: boolean) => void;
};

export const useCourseViewPanelActions = ({
  unlockedLectures,
  setSelectedVideoId,
  setShowAssignments,
  setAssignmentsVideoId,
  setShowQuiz,
  setQuizVideoId,
  setIframeError
}: CourseViewPanelActionsArgs) => {
  const openAssignmentsForVideo = useCallback(
    (videoId: number) => {
      if (!unlockedLectures.has(videoId)) {
        toast.error('This lecture is locked. Complete the previous lecture first.');
        return;
      }

      setSelectedVideoId(videoId);
      setAssignmentsVideoId(videoId);
      setShowAssignments(true);
      setShowQuiz(false);
      setQuizVideoId(null);
      setIframeError(false);
    },
    [setAssignmentsVideoId, setIframeError, setQuizVideoId, setSelectedVideoId, setShowAssignments, setShowQuiz, unlockedLectures]
  );

  const handleSelectVideo = useCallback(
    (videoId: number) => {
      if (!unlockedLectures.has(videoId)) {
        toast.error('This lecture is locked. Complete the previous lecture first.');
        return;
      }
      setSelectedVideoId(videoId);
      setShowAssignments(false);
      setAssignmentsVideoId(null);
      setShowQuiz(false);
      setQuizVideoId(null);
      setIframeError(false);
    },
    [setAssignmentsVideoId, setIframeError, setQuizVideoId, setSelectedVideoId, setShowAssignments, setShowQuiz, unlockedLectures]
  );

  return { openAssignmentsForVideo, handleSelectVideo };
};
