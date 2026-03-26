import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { logErrorSecurely } from '@/lib/utils/errorHandler';
import { convertToEmbedUrl, extractYouTubeVideoId } from '../youtubeVideoUrlHelpers';
import type { Video } from '../types';

interface UseCourseVideoPlaybackTrackingArgs {
  selectedVideoId: number | null;
  videos: Video[];
  youtubeApiReady: boolean;
  /** True when the UI uses the YT IFrame API host div (not plain iframe-only). */
  youtubeUsesIframeApiPlayer: boolean;
  /** True when API failed to load in time: plain iframe + coarse fallback progress. */
  youtubeIframeFallbackActive: boolean;
  videoWatched: Set<number>;
  videoWatchedTime: Map<number, number>;
  markVideoAsCompleted: (videoId: number) => Promise<void>;
  videoRef: RefObject<HTMLVideoElement | null>;
  youtubePlayerRef: { current: any };
  progressIntervalRef: { current: NodeJS.Timeout | null };
  watchTimeIntervalRef: { current: NodeJS.Timeout | null };
  elapsedTimeRef: { current: Map<number, number> };
  lastTrackedTimeRef: { current: Map<number, number> };
  actualWatchedTimeRef: { current: Map<number, number> };
  setVideoProgress: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoWatchedTime: Dispatch<SetStateAction<Map<number, number>>>;
  setVideoTotalDuration: Dispatch<SetStateAction<Map<number, number>>>;
}

export const useCourseVideoPlaybackTracking = ({
  selectedVideoId,
  videos,
  youtubeApiReady,
  youtubeUsesIframeApiPlayer,
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
}: UseCourseVideoPlaybackTrackingArgs) => {
  useEffect(() => {
    if (!selectedVideoId) return;

    const selectedVideo = videos.find((video) => video.id === selectedVideoId);
    if (!selectedVideo) return;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
      watchTimeIntervalRef.current = null;
    }

    const isYouTube = selectedVideo.video_url && (
      selectedVideo.video_url.includes('youtube.com') ||
      selectedVideo.video_url.includes('youtu.be')
    ) && convertToEmbedUrl(selectedVideo.video_url) !== null;

    const cleanupYouTubeIntervals = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }
    };

    const destroyYoutubePlayer = () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy?.();
        } catch {
          /* ignore */
        }
        youtubePlayerRef.current = null;
      }
    };

    const fallbackYouTubeTracking = (vidId: number, video: Video) => {
      const videoDuration = video.duration || 600;
      const existingTime = videoWatchedTime.get(vidId) || 0;
      elapsedTimeRef.current?.set(vidId, existingTime);

      if (existingTime >= videoDuration && videoDuration > 0) {
        setVideoProgress((prev) => new Map(prev).set(vidId, 100));
        markVideoAsCompleted(vidId);
        return;
      }

      progressIntervalRef.current = setInterval(() => {
        const currentElapsed = (elapsedTimeRef.current?.get(vidId) || 0) + 1;
        elapsedTimeRef.current?.set(vidId, currentElapsed);

        if (videoDuration > 0 && currentElapsed >= videoDuration) {
          setVideoProgress((prev) => new Map(prev).set(vidId, 100));
          setVideoWatchedTime((prev) => new Map(prev).set(vidId, videoDuration));
          if (!videoWatched.has(vidId)) {
            markVideoAsCompleted(vidId);
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        } else if (videoDuration > 0) {
          const progress = Math.min((currentElapsed / videoDuration) * 100, 100);
          setVideoProgress((prev) => new Map(prev).set(vidId, progress));
          setVideoWatchedTime((prev) => {
            if (!videoWatched.has(vidId)) {
              return new Map(prev).set(vidId, currentElapsed);
            }
            return prev;
          });
        }
      }, 1000);
    };

    if (isYouTube) {
      const videoId = extractYouTubeVideoId(selectedVideo.video_url || '');

      if (
        videoId &&
        youtubeUsesIframeApiPlayer &&
        youtubeApiReady &&
        (window as any).YT &&
        (window as any).YT.Player
      ) {
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
            youtubePlayerRef.current = null;
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.log('YouTube player destruction error:', e);
            }
          }
        }

        const checkAndCreatePlayer = () => {
          const element = document.getElementById(`youtube-player-${selectedVideoId}`);
          if (!element) {
            setTimeout(checkAndCreatePlayer, 100);
            return;
          }

          const iframeElement = element.parentElement?.querySelector('iframe');
          if (iframeElement && (iframeElement as HTMLElement).style) {
            (iframeElement as HTMLElement).style.display = 'none';
          }

          element.classList.remove('hidden');

          // Omit playerVars.origin: it often causes postMessage origin warnings on http://localhost vs youtube.com.
          try {
            youtubePlayerRef.current = new (window as any).YT.Player(`youtube-player-${selectedVideoId}`, {
              videoId,
              playerVars: {
                autoplay: 0,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1
              },
              events: {
                onReady: (event: any) => {
                  const duration = event.target.getDuration();
                  if (duration && duration > 0) {
                    setVideoTotalDuration((prev) => new Map(prev).set(selectedVideoId, duration));
                  }
                },
                onStateChange: (event: any) => {
                  if (event.data === (window as any).YT.PlayerState.PLAYING) {
                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                    }

                    let lastYTTime = lastTrackedTimeRef.current?.get(selectedVideoId) || 0;
                    let actualYTWatched = actualWatchedTimeRef.current?.get(selectedVideoId) || 0;
                    let lastYTUpdateTime = Date.now();

                    progressIntervalRef.current = setInterval(() => {
                      if (youtubePlayerRef.current) {
                        try {
                          const currentTime = youtubePlayerRef.current.getCurrentTime();
                          const duration = youtubePlayerRef.current.getDuration();
                          const playerState = youtubePlayerRef.current.getPlayerState();
                          const isYTPlaying = playerState === (window as any).YT.PlayerState.PLAYING;

                          if (duration && duration > 0 && isYTPlaying) {
                            const currentTimeSeconds = Math.floor(currentTime);
                            const timeDiff = currentTimeSeconds - lastYTTime;
                            const realTimeDiff = (Date.now() - lastYTUpdateTime) / 1000;

                            if (timeDiff > realTimeDiff + 1) {
                              actualYTWatched = actualYTWatched + Math.min(realTimeDiff, 1);
                            } else if (timeDiff >= 0 && timeDiff <= realTimeDiff + 1) {
                              actualYTWatched = actualYTWatched + Math.min(realTimeDiff, 1);
                            }

                            const safeActualYTWatched = Math.min(actualYTWatched, duration);

                            lastYTTime = currentTimeSeconds;
                            lastTrackedTimeRef.current?.set(selectedVideoId, lastYTTime);
                            actualWatchedTimeRef.current?.set(selectedVideoId, safeActualYTWatched);
                            elapsedTimeRef.current?.set(selectedVideoId, currentTimeSeconds);
                            lastYTUpdateTime = Date.now();

                            const progress = Math.min((safeActualYTWatched / duration) * 100, 100);

                            setVideoWatchedTime((prev) => new Map(prev).set(selectedVideoId, safeActualYTWatched));
                            setVideoProgress((prev) => new Map(prev).set(selectedVideoId, progress));
                            setVideoTotalDuration((prev) => new Map(prev).set(selectedVideoId, duration));
                          }
                        } catch (e) {
                          console.log('Error getting YouTube player state:', e);
                        }
                      }
                    }, 1000);
                  } else if (event.data === (window as any).YT.PlayerState.ENDED) {
                    if (youtubePlayerRef.current) {
                      try {
                        const duration = youtubePlayerRef.current.getDuration();
                        const actualWatched = actualWatchedTimeRef.current?.get(selectedVideoId) || 0;
                        if (duration) {
                          const safeActualWatched = Math.min(actualWatched, duration);
                          const progress = Math.min((safeActualWatched / duration) * 100, 100);
                          if (progress >= 90) {
                            setVideoWatchedTime((prev) => new Map(prev).set(selectedVideoId, safeActualWatched));
                            setVideoProgress((prev) => new Map(prev).set(selectedVideoId, progress));
                            markVideoAsCompleted(selectedVideoId);
                          }
                        }
                      } catch (e) {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('YouTube video end error:', e);
                        }
                      }
                    }
                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                    }
                  } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                    if (progressIntervalRef.current) {
                      clearInterval(progressIntervalRef.current);
                    }
                  }
                }
              }
            });
          } catch (e) {
            logErrorSecurely(e, 'createYouTubePlayer');
            const playerElement = document.getElementById(`youtube-player-${selectedVideoId}`);
            if (playerElement) {
              playerElement.classList.add('hidden');
            }
            const iframeElement = playerElement?.parentElement?.querySelector('iframe');
            if (iframeElement && (iframeElement as HTMLElement).style) {
              (iframeElement as HTMLElement).style.display = 'block';
            }
            if (!videoWatched.has(selectedVideoId)) {
              fallbackYouTubeTracking(selectedVideoId, selectedVideo);
            }
          }
        };

        checkAndCreatePlayer();
      } else if (
        videoId &&
        youtubeIframeFallbackActive &&
        !videoWatched.has(selectedVideoId)
      ) {
        fallbackYouTubeTracking(selectedVideoId, selectedVideo);
      }
    }

    return () => {
      cleanupYouTubeIntervals();
      destroyYoutubePlayer();
    };
  }, [
    selectedVideoId,
    youtubeApiReady,
    youtubeUsesIframeApiPlayer,
    youtubeIframeFallbackActive
  ]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !selectedVideoId) return;

    const handleLoadedMetadata = () => {
      if (videoElement.duration && videoElement.duration > 0) {
        const totalSeconds = Math.floor(videoElement.duration);
        // Local UI only: duration persistence is admin-only (see courseController.updateVideo).
        setVideoTotalDuration((prev) => new Map(prev).set(selectedVideoId, totalSeconds));
      }
    };

    const initialWatchedTime = videoWatchedTime.get(selectedVideoId) || 0;
    if (!actualWatchedTimeRef.current?.has(selectedVideoId)) {
      actualWatchedTimeRef.current?.set(selectedVideoId, initialWatchedTime);
    }
    if (!lastTrackedTimeRef.current?.has(selectedVideoId)) {
      lastTrackedTimeRef.current?.set(selectedVideoId, 0);
    }

    let isPlaying = false;
    let lastUpdateTime = Date.now();

    const handleTimeUpdate = () => {
      if (videoElement.duration && videoElement.duration > 0 && videoElement.paused === false) {
        const currentTime = Math.floor(videoElement.currentTime);
        const totalSeconds = Math.floor(videoElement.duration);

        const lastTracked = lastTrackedTimeRef.current?.get(selectedVideoId) || 0;
        let actualWatched = actualWatchedTimeRef.current?.get(selectedVideoId) || 0;

        const timeDiff = currentTime - lastTracked;
        const realTimeDiff = (Date.now() - lastUpdateTime) / 1000;

        if (timeDiff > realTimeDiff + 1) {
          actualWatched = actualWatched + Math.min(realTimeDiff, 1);
        } else if (timeDiff >= 0 && timeDiff <= realTimeDiff + 1) {
          actualWatched = actualWatched + Math.min(realTimeDiff, 1);
        }

        const safeActualWatched = Math.min(actualWatched, totalSeconds);

        lastTrackedTimeRef.current?.set(selectedVideoId, currentTime);
        actualWatchedTimeRef.current?.set(selectedVideoId, safeActualWatched);
        elapsedTimeRef.current?.set(selectedVideoId, currentTime);
        lastUpdateTime = Date.now();

        const progress = totalSeconds > 0
          ? Math.min((safeActualWatched / totalSeconds) * 100, 100)
          : 0;

        setVideoProgress((prev) => new Map(prev).set(selectedVideoId, progress));
        setVideoWatchedTime((prev) => new Map(prev).set(selectedVideoId, safeActualWatched));
      }
    };

    const handlePlay = () => {
      isPlaying = true;
      lastUpdateTime = Date.now();
      const currentTime = Math.floor(videoElement.currentTime);
      lastTrackedTimeRef.current?.set(selectedVideoId, currentTime);
    };

    const handlePause = () => {
      isPlaying = false;
    };

    const handleSeeked = () => {
      const currentTime = Math.floor(videoElement.currentTime);
      lastTrackedTimeRef.current?.set(selectedVideoId, currentTime);
      lastUpdateTime = Date.now();
    };

    const handleVideoEnd = () => {
      if (videoElement.duration && videoElement.duration > 0) {
        const totalSeconds = Math.floor(videoElement.duration);
        const actualWatched = actualWatchedTimeRef.current?.get(selectedVideoId) || 0;
        const safeActualWatched = Math.min(actualWatched, totalSeconds);
        const progress = totalSeconds > 0 ? Math.min((safeActualWatched / totalSeconds) * 100, 100) : 0;

        if (progress >= 90) {
          setVideoProgress((prev) => new Map(prev).set(selectedVideoId, progress));
          setVideoWatchedTime((prev) => new Map(prev).set(selectedVideoId, safeActualWatched));
          markVideoAsCompleted(selectedVideoId);
        } else {
          setVideoProgress((prev) => new Map(prev).set(selectedVideoId, progress));
          setVideoWatchedTime((prev) => new Map(prev).set(selectedVideoId, safeActualWatched));
        }
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('ended', handleVideoEnd);

    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [selectedVideoId, markVideoAsCompleted, videoWatchedTime]);
};
