'use client';

import { useCallback, useEffect, useState } from 'react';

type YoutubePlayer = {
  getPlayerState?: () => number;
  playVideo?: () => void;
  pauseVideo?: () => void;
};

type CourseViewPlaybackArgs = {
  selectedVideoId: number | null;
  selectedVideoIsYouTube: boolean;
  youtubeApiPlayerAvailable: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  youtubePlayerRef: React.RefObject<YoutubePlayer | null>;
  getYouTubePlayingState: () => number | undefined;
};

export const useCourseViewPlaybackState = ({
  selectedVideoId,
  selectedVideoIsYouTube,
  youtubeApiPlayerAvailable,
  videoRef,
  youtubePlayerRef,
  getYouTubePlayingState
}: CourseViewPlaybackArgs) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [selectedVideoId]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || selectedVideoIsYouTube) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);
    setIsPlaying(!videoEl.paused);

    return () => {
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [selectedVideoId, selectedVideoIsYouTube, videoRef]);

  useEffect(() => {
    if (!selectedVideoIsYouTube || !youtubeApiPlayerAvailable) return;

    const interval = setInterval(() => {
      try {
        const player = youtubePlayerRef.current;
        if (!player || typeof player.getPlayerState !== 'function') return;
        const state = player.getPlayerState();
        const playingState = getYouTubePlayingState();
        setIsPlaying(playingState != null && state === playingState);
      } catch {
        /* ignore */
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getYouTubePlayingState, selectedVideoIsYouTube, youtubeApiPlayerAvailable, youtubePlayerRef]);

  const handleTogglePlay = useCallback(() => {
    if (selectedVideoIsYouTube) {
      const player = youtubePlayerRef.current;
      if (player && typeof player.getPlayerState === 'function') {
        const state = player.getPlayerState();
        const playingState = getYouTubePlayingState();
        if (playingState != null && state === playingState) {
          player.pauseVideo?.();
          setIsPlaying(false);
        } else {
          player.playVideo?.();
          setIsPlaying(true);
        }
      }
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      void videoEl.play();
    } else {
      videoEl.pause();
    }
  }, [getYouTubePlayingState, selectedVideoIsYouTube, videoRef, youtubePlayerRef]);

  return { isPlaying, handleTogglePlay };
};
