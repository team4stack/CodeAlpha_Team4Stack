'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Video } from '../types';
import { isEmbeddableYouTubeUrl } from '../utils/courseViewData';
import { useYouTubeIframeApiLazy } from './useYouTubeIframeApiLazy';

type CourseViewYouTubeArgs = {
  selectedVideoId: number | null;
  videos: Video[];
};

export const useCourseViewYouTubeState = ({ selectedVideoId, videos }: CourseViewYouTubeArgs) => {
  const selectedVideoMetaForYt = useMemo(
    () => (selectedVideoId ? videos.find((v) => v.id === selectedVideoId) : null),
    [videos, selectedVideoId]
  );
  const selectedUrlIsYouTube = isEmbeddableYouTubeUrl(selectedVideoMetaForYt?.video_url);
  const youtubeApiReady = useYouTubeIframeApiLazy(selectedUrlIsYouTube);

  const [ytApiTimedOut, setYtApiTimedOut] = useState(false);
  useEffect(() => {
    if (!selectedUrlIsYouTube) {
      setYtApiTimedOut(false);
      return;
    }
    if (youtubeApiReady) {
      setYtApiTimedOut(false);
      return;
    }
    const id = globalThis.setTimeout(() => setYtApiTimedOut(true), 12000);
    return () => globalThis.clearTimeout(id);
  }, [selectedUrlIsYouTube, youtubeApiReady]);

  const youtubeApiPlayerAvailable = selectedUrlIsYouTube && youtubeApiReady && !ytApiTimedOut;
  const youtubeIframeFallbackActive = selectedUrlIsYouTube && ytApiTimedOut;

  return {
    selectedUrlIsYouTube,
    youtubeApiReady,
    youtubeApiPlayerAvailable,
    youtubeIframeFallbackActive,
    ytApiTimedOut
  };
};
