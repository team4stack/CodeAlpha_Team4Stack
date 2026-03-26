import { useEffect } from 'react';
import type { Video } from '../types';

interface UseAutoSelectUnlockedLectureArgs {
  selectedVideoId: number | null;
  videos: Video[];
  unlockedLectures: Set<number>;
  setSelectedVideoId: (videoId: number) => void;
}

export const useAutoSelectUnlockedLecture = ({
  selectedVideoId,
  videos,
  unlockedLectures,
  setSelectedVideoId
}: UseAutoSelectUnlockedLectureArgs) => {
  useEffect(() => {
    if (selectedVideoId && !unlockedLectures.has(selectedVideoId)) {
      const firstUnlocked = videos.find((video) => unlockedLectures.has(video.id));
      if (firstUnlocked) setSelectedVideoId(firstUnlocked.id);
      return;
    }

    if (!selectedVideoId && videos.length > 0) {
      const firstUnlocked = videos.find((video) => unlockedLectures.has(video.id));
      if (firstUnlocked) setSelectedVideoId(firstUnlocked.id);
    }
  }, [selectedVideoId, unlockedLectures, videos, setSelectedVideoId]);
};
