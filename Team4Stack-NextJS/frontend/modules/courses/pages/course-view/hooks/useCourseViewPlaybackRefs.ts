'use client';

import { useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { useCourseVideoPlaybackTracking } from './useCourseVideoPlaybackTracking';
import type { Video } from '../types';

type YoutubePlayer = { getPlayerState?: () => number; playVideo?: () => void; pauseVideo?: () => void; };

type CourseViewPlaybackRefsArgs = {
  selectedVideoId: number | null;
  videos: Video[];
  youtubeApiReady: boolean;
  youtubeApiPlayerAvailable: boolean;
  youtubeIframeFallbackActive: boolean;
  videoWatched: Set<number>;
  videoWatchedTime: Map<number, number>;
  markVideoAsCompleted: (videoId: number) => Promise<void>;
  lastTrackedTimeRef: RefObject<Map<number, number>>;
  actualWatchedTimeRef: RefObject<Map<number, number>>;
  setVideoProgress: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatchedTime: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoTotalDuration: Dispatch<SetStateAction<Map<number, number>>>;
};

export const useCourseViewPlaybackRefs = ({
  selectedVideoId,
  videos,
  youtubeApiReady,
  youtubeApiPlayerAvailable,
  youtubeIframeFallbackActive,
  videoWatched,
  videoWatchedTime,
  markVideoAsCompleted,
  lastTrackedTimeRef,
  actualWatchedTimeRef,
  setVideoProgress,
  setVideoWatchedTime,
  setVideoTotalDuration
}: CourseViewPlaybackRefsArgs) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubePlayerRef = useRef<YoutubePlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<Map<number, number>>(new Map());

  useCourseVideoPlaybackTracking({
    selectedVideoId,
    videos,
    youtubeApiReady,
    youtubeUsesIframeApiPlayer: youtubeApiPlayerAvailable,
    youtubeIframeFallbackActive,
    videoWatched,
    videoWatchedTime,
    markVideoAsCompleted,
    videoRef,
    youtubePlayerRef,
    progressIntervalRef,
    watchTimeIntervalRef,
    elapsedTimeRef,
    lastTrackedTimeRef,
    actualWatchedTimeRef,
    setVideoProgress,
    setVideoWatchedTime,
    setVideoTotalDuration
  });

  return { videoRef, iframeRef, youtubePlayerRef, elapsedTimeRef };
};
