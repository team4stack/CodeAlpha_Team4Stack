'use client';

import { useEffect } from 'react';

type QuizLockingArgs = {
  videoWatched: Set<number>;
  setQuizLockedMap: React.Dispatch<React.SetStateAction<Map<number, boolean>>>;
  setQuizAttemptCountMap: React.Dispatch<React.SetStateAction<Map<number, number>>>;
};

export const useCourseViewQuizLocking = ({
  videoWatched,
  setQuizLockedMap,
  setQuizAttemptCountMap
}: QuizLockingArgs) => {
  useEffect(() => {
    if (videoWatched.size === 0) return;
    setQuizLockedMap((prev) => {
      let changed = false;
      const next = new Map(prev);
      videoWatched.forEach((videoId) => {
        if (next.get(videoId)) {
          next.set(videoId, false);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setQuizAttemptCountMap((prev) => {
      let changed = false;
      const next = new Map(prev);
      videoWatched.forEach((videoId) => {
        if (next.get(videoId)) {
          next.set(videoId, 0);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [setQuizAttemptCountMap, setQuizLockedMap, videoWatched]);
};
