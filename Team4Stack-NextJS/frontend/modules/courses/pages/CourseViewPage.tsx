'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Video {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  order_index: number;
  duration?: number;
}

interface Course {
  id: number;
  name?: string;
  title?: string;
  description?: string;
}

interface ProgressRecord {
  id: number;
  user_id: string;
  course_id: number;
  video_id: number;
  completed: boolean;
  score?: number;
}

interface CourseViewPageProps {
  courseId: string;
}

const CourseViewPage: React.FC<CourseViewPageProps> = ({ courseId }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Map<number, number>>(new Map()); // videoId -> progress percentage
  const [videoWatchedTime, setVideoWatchedTime] = useState<Map<number, number>>(new Map()); // videoId -> watched time in seconds
  const [videoTotalDuration, setVideoTotalDuration] = useState<Map<number, number>>(new Map()); // videoId -> total duration in seconds
  const [iframeError, setIframeError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubePlayerRef = useRef<any>(null); // YouTube IFrame API player instance
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> elapsed seconds
  const lastTrackedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> last tracked time (for seek detection)
  const actualWatchedTimeRef = useRef<Map<number, number>>(new Map()); // videoId -> actual watched time (excluding seeks)
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);

  const loadCourseData = useCallback(async () => {
    if (!courseId || !user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course
      const courseResult = await coursesApi.getCourseById(parseInt(courseId));
      if (courseResult.error) {
        setError(courseResult.error);
        setLoading(false);
        return;
      }
      setCourse(courseResult.data || null);
      
      // Fetch videos ordered by order_index (admin's order)
      const videosResult = await coursesApi.getCourseVideos(parseInt(courseId));
      if (videosResult.error) {
        setError(videosResult.error);
        setLoading(false);
        return;
      }
      const videosData = videosResult.data || [];
      setVideos(videosData);
      
      // Initialize video total durations from database
      const durationMap = new Map<number, number>();
      videosData?.forEach((video) => {
        if (video.duration && video.duration > 0) {
          durationMap.set(video.id, video.duration);
        }
      });
      setVideoTotalDuration(durationMap);
      
      if (videosData && videosData.length > 0) {
        setSelectedVideoId(videosData[0].id);
      } else {
        setSelectedVideoId(null);
      }
      
      // Fetch progress records for current user
      const progressResult = await coursesApi.getUserProgress(user.id, parseInt(courseId));
      if (progressResult.error) {
        console.error('Error loading progress:', progressResult.error);
        // Continue without progress data
      }
      const progressData = progressResult.data || [];
      setProgressRecords(progressData);
      
      // Track which videos have been watched and their watched time
      const watched = new Set<number>();
      const watchedTimeMap = new Map<number, number>();
      progressData?.forEach((record) => {
        if (record.completed && record.video_id) {
          watched.add(record.video_id);
          // Store watched time from score field (or 0 if not set)
          if (record.score) {
            watchedTimeMap.set(record.video_id, record.score);
            // Initialize actual watched time refs
            actualWatchedTimeRef.current.set(record.video_id, record.score);
          }
        }
      });
      setVideoWatched(watched);
      setVideoWatchedTime(watchedTimeMap);
    } catch (err: any) {
      console.error('[CourseViewPage] Failed to load course', err);
      setError('Unable to load course content right now.');
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Load YouTube IFrame API script
  useEffect(() => {
    // Check if API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      setYoutubeApiReady(true);
      return;
    }

    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set callback when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      setYoutubeApiReady(true);
    };

    return () => {
      // Cleanup
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady;
      }
    };
  }, []);

  // Mark video as completed when watched
  const markVideoAsCompleted = useCallback(async (videoId: number) => {
    if (!user?.id || !courseId || videoWatched.has(videoId)) return;

    try {
      // Get the video to ensure we have the correct duration
      const currentVideo = videos.find(v => v.id === videoId);
      if (!currentVideo) {
        throw new Error('Video not found');
      }
      
      const videoDuration = videoTotalDuration.get(videoId) || currentVideo.duration || 0;
      
      // Get current actual watched time (not seek position)
      const actualWatchedTime = actualWatchedTimeRef.current?.get(videoId) || videoWatchedTime.get(videoId) || 0;
      
      // Ensure we have a valid watched time (at least 1 second if video was watched)
      const finalWatchedTime = Math.max(actualWatchedTime, 1);
      
      // Calculate actual progress based on watched time (preserve actual progress, don't force 100%)
      const actualProgress = videoDuration > 0 
        ? Math.min((finalWatchedTime / videoDuration) * 100, 100) 
        : 0;
      
      // Update local state - mark as watched but preserve actual progress
      setVideoWatched(prev => new Set(prev).add(videoId));
      setVideoProgress(prev => new Map(prev).set(videoId, actualProgress)); // Preserve actual progress
      setVideoWatchedTime(prev => new Map(prev).set(videoId, finalWatchedTime)); // Preserve actual watched time
      
      // Update or insert progress record
      const progressResult = await coursesApi.updateProgress({
        user_id: user.id,
        course_id: Number(courseId),
        video_id: videoId,
        completed: true,
        score: Math.round(finalWatchedTime) // Store actual watched time, rounded to integer
      });
      
      if (progressResult.error) {
        console.error('Error updating progress:', progressResult.error);
        toast.error(progressResult.error);
        return;
      }
      
      // Reload progress records
      const reloadResult = await coursesApi.getUserProgress(user.id, parseInt(courseId));
      if (reloadResult.error) {
        console.error('Error reloading progress records:', reloadResult.error);
        // Don't throw here, just log - progress was already saved
      } else {
        setProgressRecords(reloadResult.data || []);
      }
      
      toast.success('Lecture marked as complete!');
      
      // Auto-unlock next lecture if exists (handled by unlockedLectures useMemo)
      // Next lecture will be automatically unlocked when progress >= 90%
    } catch (err: any) {
      console.error('Failed to mark video as completed:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        fullError: err
      });
      const errorMessage = err?.message || err?.details || 'Failed to update progress';
      toast.error(errorMessage);
    }
  }, [user?.id, courseId, videoWatched, videoWatchedTime, videos, videoTotalDuration]);

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    
    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    
    // youtube.com/v/VIDEO_ID
    const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
    if (vMatch) return vMatch[1];
    
    return null;
  };

  // Convert YouTube URL to embed format
  const convertToEmbedUrl = (url: string): string | null => {
    if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
    
    // Check if it's a playlist URL - these cannot be embedded
    if (url.includes('playlist?list=') || url.includes('/playlist')) {
      return null; // Playlist URLs cannot be embedded
    }
    
    // Check if it's just the base YouTube URL without video ID
    if (url === 'https://www.youtube.com/' || url === 'https://youtube.com/' || url === 'http://www.youtube.com/' || url === 'http://youtube.com/') {
      return null;
    }
    
    // Already in embed format
    if (url.includes('/embed/')) {
      const videoId = url.split('/embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
      if (videoId && videoId.length > 0 && videoId.length <= 11) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts.length > 1) {
        const videoId = parts[1]?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('#')[0];
        if (videoId && videoId.length > 0 && videoId.length <= 11) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    }
    
    // Handle youtube.com/watch?v= format
    if (url.includes('watch?v=')) {
      const parts = url.split('watch?v=');
      if (parts.length > 1) {
        const videoId = parts[1]?.split('&')[0]?.split('#')[0]?.split(' ')[0];
        if (videoId && videoId.length > 0 && videoId.length <= 11) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    }
    
    // Handle youtube.com/v/ format
    if (url.includes('youtube.com/v/')) {
      const parts = url.split('youtube.com/v/');
      if (parts.length > 1) {
        const videoId = parts[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
        if (videoId && videoId.length > 0 && videoId.length <= 11) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
    }
    
    return null; // Invalid URL
  };

  // Track video progress and watched time for iframe videos (time-based estimation)
  useEffect(() => {
    if (!selectedVideoId) return;
    
    // Get selected video from videos array
    const selectedVideo = videos.find(v => v.id === selectedVideoId);
    if (!selectedVideo) return;
    
    // Clear previous intervals
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
    ) && convertToEmbedUrl(selectedVideo.video_url) !== null; // Only if valid embed URL

    // Fallback function for YouTube tracking without API
    const fallbackYouTubeTracking = (vidId: number, video: Video) => {
      const videoDuration = video.duration || 600;
      const existingTime = videoWatchedTime.get(vidId) || 0;
      elapsedTimeRef.current.set(vidId, existingTime);
      
      if (existingTime >= videoDuration && videoDuration > 0) {
        setVideoProgress(prev => new Map(prev).set(vidId, 100));
        markVideoAsCompleted(vidId);
        return;
      }
      
      progressIntervalRef.current = setInterval(() => {
        const currentElapsed = (elapsedTimeRef.current.get(vidId) || 0) + 1;
        elapsedTimeRef.current.set(vidId, currentElapsed);
        
        if (videoDuration > 0 && currentElapsed >= videoDuration) {
          setVideoProgress(prev => new Map(prev).set(vidId, 100));
          setVideoWatchedTime(prev => new Map(prev).set(vidId, videoDuration));
          if (!videoWatched.has(vidId)) {
            markVideoAsCompleted(vidId);
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        } else if (videoDuration > 0) {
          const progress = Math.min((currentElapsed / videoDuration) * 100, 100);
          setVideoProgress(prev => new Map(prev).set(vidId, progress));
          setVideoWatchedTime(prev => {
            if (!videoWatched.has(vidId)) {
              return new Map(prev).set(vidId, currentElapsed);
            }
            return prev;
          });
        }
      }, 1000);
    };

    if (isYouTube && !videoWatched.has(selectedVideoId)) {
      const videoId = extractYouTubeVideoId(selectedVideo.video_url || '');
      if (!videoId) return;

      // Use YouTube IFrame API for accurate tracking if available
      if (youtubeApiReady && (window as any).YT && (window as any).YT.Player) {
        // Check if player already exists for this video
        const playerElement = document.getElementById(`youtube-player-${selectedVideoId}`);
        if (youtubePlayerRef.current && playerElement) {
          // Player already exists, don't recreate
          return;
        }

        // Destroy existing player if any (for different video)
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
            youtubePlayerRef.current = null;
          } catch (e) {
            console.log('Error destroying YouTube player:', e);
          }
        }

        // Wait for DOM to be ready and element to exist
        const checkAndCreatePlayer = () => {
          const element = document.getElementById(`youtube-player-${selectedVideoId}`);
          if (!element) {
            // Retry after a short delay
            setTimeout(checkAndCreatePlayer, 100);
            return;
          }

          // Hide the fallback iframe
          const iframeElement = element.parentElement?.querySelector('iframe');
          if (iframeElement) {
            (iframeElement as HTMLElement).style.display = 'none';
          }
          
          // Show the player div
          element.classList.remove('hidden');

          // Create YouTube player with IFrame API
          try {
            youtubePlayerRef.current = new (window as any).YT.Player(`youtube-player-${selectedVideoId}`, {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: (event: any) => {
                const duration = event.target.getDuration();
                if (duration && duration > 0) {
                  setVideoTotalDuration(prev => new Map(prev).set(selectedVideoId, duration));
                  // Update database if duration is different (don't reload to avoid re-render)
                  if (selectedVideo.duration !== duration) {
                    (async () => {
                      const { error } = await supabase
                        .from('videos')
                        .update({ duration: Math.floor(duration) })
                        .eq('id', selectedVideoId);
                      if (error) {
                        console.log('Could not update video duration:', error);
                      }
                    })();
                  }
                }
              },
              onStateChange: (event: any) => {
                // Track when video is playing
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  // Clear any existing interval first
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                  
                  // Initialize tracking refs
                  let lastYTTime = lastTrackedTimeRef.current.get(selectedVideoId) || 0;
                  let actualYTWatched = actualWatchedTimeRef.current.get(selectedVideoId) || 0;
                  let lastYTUpdateTime = Date.now();
                  
                  // Start tracking progress with seek detection
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
                          const realTimeDiff = (Date.now() - lastYTUpdateTime) / 1000; // Real elapsed seconds
                          
                          // Detect seek: if video time jumps more than real time, it's a seek
                          if (timeDiff > realTimeDiff + 1) {
                            // User seeked forward - only count real time passed (max 1 second per interval)
                            actualYTWatched = actualYTWatched + Math.min(realTimeDiff, 1);
                          } else if (timeDiff >= 0 && timeDiff <= realTimeDiff + 1) {
                            // Normal playback - add real time difference
                            actualYTWatched = actualYTWatched + Math.min(realTimeDiff, 1);
                          }
                          
                          // Update refs
                          lastYTTime = currentTimeSeconds;
                          lastTrackedTimeRef.current.set(selectedVideoId, lastYTTime);
                          actualWatchedTimeRef.current.set(selectedVideoId, actualYTWatched);
                          elapsedTimeRef.current.set(selectedVideoId, currentTimeSeconds);
                          lastYTUpdateTime = Date.now();
                          
                          // Calculate progress based on ACTUAL watched time, not current position
                          const progress = Math.min((actualYTWatched / duration) * 100, 100);
                          
                          setVideoWatchedTime(prev => new Map(prev).set(selectedVideoId, actualYTWatched));
                          setVideoProgress(prev => new Map(prev).set(selectedVideoId, progress));
                          setVideoTotalDuration(prev => new Map(prev).set(selectedVideoId, duration));
                          
                          // Don't auto-complete, let user click button at 90%+
                        }
                      } catch (e) {
                        console.log('Error getting YouTube player state:', e);
                      }
                    }
                  }, 1000);
                } else if (event.data === (window as any).YT.PlayerState.ENDED) {
                  // Video ended - use actual watched time, not duration
                  if (youtubePlayerRef.current) {
                    try {
                      const duration = youtubePlayerRef.current.getDuration();
                      const actualWatched = actualWatchedTimeRef.current.get(selectedVideoId) || 0;
                      if (duration) {
                        // Only mark complete if actual watched time is 90%+
                        const progress = (actualWatched / duration) * 100;
                        if (progress >= 90) {
                          setVideoWatchedTime(prev => new Map(prev).set(selectedVideoId, actualWatched));
                          setVideoProgress(prev => new Map(prev).set(selectedVideoId, progress));
                          markVideoAsCompleted(selectedVideoId);
                        }
                      }
                    } catch (e) {
                      console.log('Error handling video end:', e);
                    }
                  }
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                  // Paused - keep current progress
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                  }
                }
              },
            },
          });
          } catch (e) {
            console.error('Error creating YouTube player:', e);
            // Show fallback iframe if player creation fails
            const playerElement = document.getElementById(`youtube-player-${selectedVideoId}`);
            if (playerElement) {
              playerElement.classList.add('hidden');
            }
            const iframeElement = playerElement?.parentElement?.querySelector('iframe');
            if (iframeElement) {
              (iframeElement as HTMLElement).style.display = 'block';
            }
            // Fallback to time-based estimation
            fallbackYouTubeTracking(selectedVideoId, selectedVideo);
          }
        };
        
        // Start checking for element
        checkAndCreatePlayer();
      } else {
        // Fallback to time-based estimation if API not ready
        fallbackYouTubeTracking(selectedVideoId, selectedVideo);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }
      // Don't destroy YouTube player on cleanup - let it persist
      // Only destroy when switching to a different video
    };
  }, [selectedVideoId, youtubeApiReady]); // Reduced dependencies to prevent re-renders

  // Handle video end event for direct video files
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !selectedVideoId) return;

    // Get video from database to check if duration is set
    const currentVideo = videos.find(v => v.id === selectedVideoId);
    
    // Handle when video metadata is loaded (duration available)
    const handleLoadedMetadata = () => {
      if (videoElement.duration && videoElement.duration > 0) {
        const totalSeconds = Math.floor(videoElement.duration);
        // Store in state for real-time display
        setVideoTotalDuration(prev => new Map(prev).set(selectedVideoId, totalSeconds));
        
        // Update database if duration is not set or different
        if (currentVideo && (!currentVideo.duration || currentVideo.duration !== totalSeconds)) {
          // Optionally update database, but don't block UI
          (async () => {
            const { error } = await supabase
              .from('videos')
              .update({ duration: totalSeconds })
              .eq('id', selectedVideoId);
            
            if (!error) {
              // Reload videos to get updated duration
              loadCourseData();
            } else {
              console.log('Could not update video duration:', error);
            }
          })();
        }
      }
    };

    // Initialize watched time from state
    const initialWatchedTime = videoWatchedTime.get(selectedVideoId) || 0;
    if (!actualWatchedTimeRef.current.has(selectedVideoId)) {
      actualWatchedTimeRef.current.set(selectedVideoId, initialWatchedTime);
    }
    if (!lastTrackedTimeRef.current.has(selectedVideoId)) {
      lastTrackedTimeRef.current.set(selectedVideoId, 0);
    }

    let isPlaying = false;
    let lastUpdateTime = Date.now();

    const handleTimeUpdate = () => {
      if (videoElement.duration && videoElement.duration > 0 && videoElement.paused === false) {
        const currentTime = Math.floor(videoElement.currentTime);
        const totalSeconds = Math.floor(videoElement.duration);
        
        // Get last tracked values
        const lastTracked = lastTrackedTimeRef.current.get(selectedVideoId) || 0;
        let actualWatched = actualWatchedTimeRef.current.get(selectedVideoId) || 0;
        
        // Calculate time difference
        const timeDiff = currentTime - lastTracked;
        const realTimeDiff = (Date.now() - lastUpdateTime) / 1000; // Real elapsed seconds
        
        // Detect seek: if video time jumps more than real time, it's a seek
        if (timeDiff > realTimeDiff + 1) {
          // User seeked forward - only count real time passed (max 1 second per update)
          actualWatched = actualWatched + Math.min(realTimeDiff, 1);
        } else if (timeDiff >= 0 && timeDiff <= realTimeDiff + 1) {
          // Normal playback - add real time difference
          actualWatched = actualWatched + Math.min(realTimeDiff, 1);
        }
        
        // Update refs
        lastTrackedTimeRef.current.set(selectedVideoId, currentTime);
        actualWatchedTimeRef.current.set(selectedVideoId, actualWatched);
        elapsedTimeRef.current.set(selectedVideoId, currentTime);
        lastUpdateTime = Date.now();
        
        // Calculate progress based on ACTUAL watched time, not current position
        const progress = totalSeconds > 0 
          ? Math.min((actualWatched / totalSeconds) * 100, 100) 
          : 0;
        
        // Update state with actual watched time
        setVideoProgress(prev => new Map(prev).set(selectedVideoId, progress));
        setVideoWatchedTime(prev => new Map(prev).set(selectedVideoId, actualWatched));
      }
    };

    const handlePlay = () => {
      isPlaying = true;
      lastUpdateTime = Date.now();
      const currentTime = Math.floor(videoElement.currentTime);
      lastTrackedTimeRef.current.set(selectedVideoId, currentTime);
    };

    const handlePause = () => {
      isPlaying = false;
    };

    const handleSeeked = () => {
      // User seeked - reset last tracked time to current position
      const currentTime = Math.floor(videoElement.currentTime);
      lastTrackedTimeRef.current.set(selectedVideoId, currentTime);
      lastUpdateTime = Date.now();
      // Don't add to watched time when seeking
    };

    const handleVideoEnd = () => {
      // Use actual watched time when video ends, not duration
      if (videoElement.duration && videoElement.duration > 0) {
        const totalSeconds = Math.floor(videoElement.duration);
        const actualWatched = actualWatchedTimeRef.current.get(selectedVideoId) || 0;
        const progress = totalSeconds > 0 ? Math.min((actualWatched / totalSeconds) * 100, 100) : 0;
        
        // Only mark complete if actual watched time is 90%+
        if (progress >= 90) {
          setVideoProgress(prev => new Map(prev).set(selectedVideoId, progress));
          setVideoWatchedTime(prev => new Map(prev).set(selectedVideoId, actualWatched));
          markVideoAsCompleted(selectedVideoId);
        } else {
          // Update progress but don't mark complete
          setVideoProgress(prev => new Map(prev).set(selectedVideoId, progress));
          setVideoWatchedTime(prev => new Map(prev).set(selectedVideoId, actualWatched));
        }
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('ended', handleVideoEnd);
    
    // Trigger loadedmetadata if already loaded
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
  }, [selectedVideoId, markVideoAsCompleted, videos, loadCourseData, videoWatchedTime]);

  const progressByVideo = useMemo(() => {
    const map = new Map<number, ProgressRecord>();
    progressRecords.forEach((record) => {
      if (record.video_id) {
        map.set(record.video_id, record);
      }
    });
    return map;
  }, [progressRecords]);

  const completedCount = useMemo(
    () => progressRecords.filter((record) => record.video_id && record.completed).length,
    [progressRecords]
  );

  const totalVideos = videos.length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  // Calculate total course duration (sum of ALL videos - locked + unlocked) - use actual detected durations
  const totalCourseDuration = useMemo(() => {
    // Sum ALL videos regardless of lock status
    return videos.reduce((total, video) => {
      // Use videoTotalDuration state (actual detected) or fallback to database duration
      // Include ALL videos, even if locked
      const duration = videoTotalDuration.get(video.id) || video.duration || 0;
      return total + duration;
    }, 0);
  }, [videos, videoTotalDuration]);

  // Calculate total watched time across all videos (accumulates as user watches)
  const totalWatchedTime = useMemo(() => {
    return videos.reduce((total, video) => {
      const watched = videoWatchedTime.get(video.id) || 0;
      return total + watched;
    }, 0);
  }, [videos, videoWatchedTime]);

  // Determine which lectures are unlocked
  const unlockedLectures = useMemo(() => {
    const unlocked = new Set<number>();
    
    if (videos.length === 0) return unlocked;
    
    // First lecture is always unlocked
    unlocked.add(videos[0].id);
    
    // Check each subsequent lecture
    for (let i = 1; i < videos.length; i++) {
      const previousVideo = videos[i - 1];
      const previousProgress = videoProgress.get(previousVideo.id) || 0;
      
      // Unlock ONLY if previous lecture is 90%+ watched OR completed
      // Lock remains until 90% is reached
      if (previousProgress >= 90 || videoWatched.has(previousVideo.id)) {
        unlocked.add(videos[i].id);
      } else {
        // Stop unlocking if previous is not 90%+ - keep locked
        break;
      }
    }
    
    return unlocked;
  }, [videos, videoProgress, videoWatched]);

  // Get next lecture ID
  const getNextLectureId = useCallback((currentVideoId: number): number | null => {
    const currentIndex = videos.findIndex(v => v.id === currentVideoId);
    if (currentIndex >= 0 && currentIndex < videos.length - 1) {
      return videos[currentIndex + 1].id;
    }
    return null;
  }, [videos]);

  const handleSelectVideo = (videoId: number) => {
    // Check if lecture is unlocked
    if (!unlockedLectures.has(videoId)) {
      toast.error('This lecture is locked. Complete the previous lecture first.');
      return;
    }
    setSelectedVideoId(videoId);
    setIframeError(false); // Reset error when switching videos
    // Don't reset progress/time when switching - keep accumulated values
  };

  // If selected video is locked, select first unlocked video instead
  // This must be BEFORE early returns to maintain hook order
  useEffect(() => {
    if (selectedVideoId && !unlockedLectures.has(selectedVideoId)) {
      const firstUnlocked = videos.find(v => unlockedLectures.has(v.id));
      if (firstUnlocked) {
        setSelectedVideoId(firstUnlocked.id);
      }
    } else if (!selectedVideoId && videos.length > 0) {
      // Select first unlocked video on load
      const firstUnlocked = videos.find(v => unlockedLectures.has(v.id));
      if (firstUnlocked) {
        setSelectedVideoId(firstUnlocked.id);
      }
    }
  }, [selectedVideoId, unlockedLectures, videos]);

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <StudentNavbar />
        <div className={`pt-24 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDarkMode ? 'border-purple-500' : 'border-purple-600'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <StudentNavbar />
        <div className={`pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Course Error
              </h1>
            </div>
            <div className={`rounded-xl p-6 max-w-2xl mx-auto ${
              isDarkMode 
                ? 'bg-red-900/30 text-red-300 border border-red-700' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <p className="mb-4">{error || 'Course not found'}</p>
              <button
                onClick={() => router.push('/student/courses')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Back to My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get selected video, but only if it's unlocked
  const selectedVideo = selectedVideoId 
    ? videos.find((video) => video.id === selectedVideoId && unlockedLectures.has(video.id)) 
    : null;
  
  const courseTitle = course.title || course.name || 'Course';

  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Left Sidebar */}
          <div className={`w-80 border-r overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Timeline/Progress Bar at Top */}
            <div className={`p-4 border-b sticky top-0 z-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-3">
                <h2 className={`text-lg font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {courseTitle}
                </h2>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Course Progress
                  </span>
                  <span className={`text-sm font-bold ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {progressPercentage}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className={`w-full h-3 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {completedCount} of {totalVideos} lectures completed
                </p>
                {/* Total Course Time */}
                {totalCourseDuration > 0 && (() => {
                  // Format time helper function
                  const formatTime = (seconds: number) => {
                    const totalSeconds = Math.floor(seconds); // Ensure integer
                    const mins = Math.floor(totalSeconds / 60);
                    const secs = totalSeconds % 60;
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                  };
                  
                  return (
                    <div className={`mt-3 pt-3 border-t ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-semibold ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Total Course Time
                        </span>
                        <span className={`text-xs font-bold ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {formatTime(totalCourseDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Watched
                        </span>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatTime(totalWatchedTime)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Lectures List */}
            <div className="p-4 space-y-2">
              {videos.length > 0 ? (
                videos.map((video, index) => {
                  const isCompleted = videoWatched.has(video.id);
                  const isSelected = video.id === selectedVideoId;
                  const isUnlocked = unlockedLectures.has(video.id);
                  const isLocked = !isUnlocked;

                  return (
                    <div
                      key={video.id}
                      onClick={() => {
                        if (!isLocked) {
                          handleSelectVideo(video.id);
                        }
                      }}
                      className={`p-3 rounded-lg transition-all ${
                        isLocked
                          ? 'opacity-60 cursor-not-allowed bg-gray-700/20 dark:bg-gray-800/20 border border-gray-500'
                          : isSelected
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500 cursor-pointer'
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 cursor-pointer'
                          : isDarkMode
                          ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 cursor-pointer'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isLocked ? (
                            <span className="text-xl">🔒</span>
                          ) : isCompleted ? (
                            <span className="text-xl">✅</span>
                          ) : (
                            <span className={`text-xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm truncate ${
                              isLocked
                                ? isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                : isSelected
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {video.title}
                            </span>
                            {isLocked && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                              }`}>
                                Locked
                              </span>
                            )}
                          </div>
                          {video.description && (
                            <p className={`text-xs line-clamp-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {video.description}
                            </p>
                          )}
                          {/* Time and Progress Display */}
                          <div className="flex items-center gap-2 mt-1">
                            {video.duration ? (
                              <>
                                <p className={`text-xs font-medium ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {(() => {
                                    // Use videoTotalDuration state if available, otherwise database duration
                                    const totalSeconds = Math.floor(videoTotalDuration.get(video.id) || video.duration || 0);
                                    const watchedSeconds = Math.floor(isCompleted 
                                      ? (videoWatchedTime.get(video.id) || totalSeconds)
                                      : (videoWatchedTime.get(video.id) || 0));
                                    
                                    // Format time properly
                                    const totalMin = Math.floor(totalSeconds / 60);
                                    const totalSec = totalSeconds % 60;
                                    const watchedMin = Math.floor(watchedSeconds / 60);
                                    const watchedSec = watchedSeconds % 60;
                                    
                                    return `${watchedMin}:${watchedSec.toString().padStart(2, '0')} / ${totalMin}:${totalSec.toString().padStart(2, '0')}`;
                                  })()}
                                </p>
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  •
                                </span>
                                <p className={`text-xs font-semibold ${
                                  isCompleted 
                                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                                    : isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                }`}>
                                  {(() => {
                                    // Get progress from videoProgress state (shows actual progress, not forced 100%)
                                    const progressFromState = videoProgress.get(video.id);
                                    if (progressFromState !== undefined) {
                                      return `${Math.round(progressFromState)}%`;
                                    }
                                    
                                    // Fallback to calculated progress
                                    const totalSeconds = videoTotalDuration.get(video.id) || video.duration || 0;
                                    const watchedSeconds = videoWatchedTime.get(video.id) || 0;
                                    const progress = totalSeconds > 0 
                                      ? Math.round((watchedSeconds / totalSeconds) * 100) 
                                      : 0;
                                    return `${progress}%`;
                                  })()}
                                </p>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`p-6 text-center rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700/30 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="text-4xl mb-3">📚</div>
                  <p className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    No Lectures Available
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Admin hasn't uploaded any lectures for this course yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Video Player */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {videos.length > 0 && selectedVideo ? (
                <div>
                  {/* Video Player */}
                  <div className={`rounded-xl shadow-lg overflow-hidden mb-6 ${
                    isDarkMode
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="aspect-video bg-black relative overflow-hidden">
                      {selectedVideo.video_url ? (
                        (() => {
                          const isYouTube = selectedVideo.video_url.includes('youtube.com') || 
                                           selectedVideo.video_url.includes('youtu.be');
                          
                          if (isYouTube) {
                            const embedUrl = convertToEmbedUrl(selectedVideo.video_url);
                            
                            if (!embedUrl) {
                              // Check if it's a playlist URL
                              const isPlaylist = selectedVideo.video_url.includes('playlist?list=') || selectedVideo.video_url.includes('/playlist');
                              
                              return (
                                <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
                                  <span className={`text-4xl mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    ⚠️
                                  </span>
                                  <span className={`text-lg font-semibold mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-100'
                                  }`}>
                                    {isPlaylist ? 'Playlist URL Not Supported' : 'Invalid Video URL'}
                                  </span>
                                  <span className={`text-sm text-center px-4 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-300'
                                  }`}>
                                    {isPlaylist 
                                      ? 'Playlist URLs cannot be embedded. Please use an individual video URL instead (e.g., https://youtube.com/watch?v=VIDEO_ID).'
                                      : 'The video URL provided is not valid. Please contact the administrator.'}
                                  </span>
                                </div>
                              );
                            }
                            
                            return (
                              <>
                                {iframeError ? (
                                  <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
                                    <span className={`text-4xl mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      ⚠️
                                    </span>
                                    <span className={`text-lg font-semibold mb-2 ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-100'
                                    }`}>
                                      Unable to Load Video
                                    </span>
                                    <span className={`text-sm text-center px-4 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-300'
                                    }`}>
                                      The video content could not be displayed. Please try again later or contact support.
                                    </span>
                                  </div>
                                ) : (
                                  // Always show iframe first, YouTube API will replace it if available
                                  <>
                                    {/* Div for YouTube IFrame API player (hidden initially, shown when API ready) */}
                                    <div 
                                      id={`youtube-player-${selectedVideo.id}`} 
                                      className={`w-full h-full ${youtubeApiReady && (window as any).YT && (window as any).YT.Player ? '' : 'hidden'}`}
                                    />
                                    {/* Fallback iframe - always visible unless YouTube API player is active */}
                                    <iframe
                                      ref={iframeRef}
                                      src={embedUrl}
                                      title={selectedVideo.title}
                                      className={`w-full h-full absolute inset-0 ${youtubeApiReady && (window as any).YT && (window as any).YT.Player ? 'hidden' : ''}`}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                      onLoad={() => {
                                        setIframeError(false);
                                      }}
                                    />
                                  </>
                                )}
                              </>
                            );
                          } else {
                            return (
                              <video
                                ref={videoRef}
                                src={selectedVideo.video_url}
                                controls
                                className="w-full h-full"
                                onEnded={() => markVideoAsCompleted(selectedVideo.id)}
                              />
                            );
                          }
                        })()
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
                          <span className={`text-lg font-semibold mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-100'
                          }`}>
                            Video Player
                          </span>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-300'
                          }`}>
                            No video URL provided
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Real-Time Video Progress & Time Display */}
                    {selectedVideo.video_url && (() => {
                      const watchedSeconds = videoWatchedTime.get(selectedVideo.id) || 0;
                      const progress = videoProgress.get(selectedVideo.id) || 0;
                      
                      // Get total duration from state, video element, or database
                      let totalSeconds = videoTotalDuration.get(selectedVideo.id) || selectedVideo.duration || 0;
                      
                      // For direct videos, try to get from video element (most accurate)
                      if (videoRef.current && videoRef.current.duration && videoRef.current.duration > 0) {
                        totalSeconds = Math.floor(videoRef.current.duration);
                        // Update state if different
                        if (videoTotalDuration.get(selectedVideo.id) !== totalSeconds) {
                          setVideoTotalDuration(prev => new Map(prev).set(selectedVideo.id, totalSeconds));
                        }
                      }
                      
                      // Format time helper
                      const formatTime = (seconds: number) => {
                        const mins = Math.floor(seconds / 60);
                        const secs = Math.floor(seconds % 60);
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                      };
                      
                      return (
                        <div className={`mt-4 p-4 rounded-lg ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border border-gray-700' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* Watched Time / Total Time */}
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Time:
                              </span>
                              <span className={`text-lg font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatTime(watchedSeconds)}
                              </span>
                              {totalSeconds > 0 && (
                                <>
                                  <span className={`text-sm ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                    /
                                  </span>
                                  <span className={`text-lg font-bold ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {formatTime(totalSeconds)}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Progress Percentage */}
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Progress:
                              </span>
                              <span className={`text-lg font-bold ${
                                isDarkMode ? 'text-purple-400' : 'text-purple-600'
                              }`}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            {totalSeconds > 0 && (
                              <div className="flex-1 min-w-[200px]">
                                <div className={`w-full h-2 rounded-full overflow-hidden ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                  </div>

                  {/* Video Info */}
                  <div className={`rounded-xl shadow-lg p-6 mb-4 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <h2 className={`text-2xl font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedVideo.title}
                    </h2>
                    {selectedVideo.description && (
                      <p className={`mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {selectedVideo.description}
                      </p>
                    )}
                    {videoWatched.has(selectedVideo.id) && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-green-900/30 border border-green-700' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <p className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}>
                          <span>✅</span>
                          <span className="font-semibold">This lecture has been completed</span>
                        </p>
                      </div>
                    )}
                    {!videoWatched.has(selectedVideo.id) && (
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Watch at least 90% of the lecture to mark it as complete.
                        {videoProgress.get(selectedVideo.id) ? (
                          <span className="ml-2 font-semibold">
                            Progress: {Math.round(videoProgress.get(selectedVideo.id) || 0)}%
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Complete and Next Button - Below Video Info */}
                  {!videoWatched.has(selectedVideo.id) && selectedVideo.video_url && (() => {
                    const progress = videoProgress.get(selectedVideo.id) || 0;
                    const isActive = progress >= 90;
                    const nextLectureId = getNextLectureId(selectedVideo.id);
                    const hasNext = nextLectureId !== null;

                    return (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={async () => {
                            if (!isActive) return; // Prevent click if locked
                            
                            await markVideoAsCompleted(selectedVideo.id);
                            // Auto-switch to next lecture if available
                            if (hasNext && nextLectureId) {
                              setTimeout(() => {
                                setSelectedVideoId(nextLectureId);
                              }, 500);
                            }
                          }}
                          disabled={!isActive}
                          className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md ${
                            isActive
                              ? isDarkMode
                                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 cursor-pointer'
                                : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 cursor-pointer'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          {isActive ? (
                            <>✅ {hasNext ? 'Complete & Next' : 'Mark Complete'}</>
                          ) : (
                            <>🔒 {hasNext ? 'Complete & Next' : 'Mark Complete'} (Watch 90% to unlock)</>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center min-h-[60vh] ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Lectures Not Available
                  </h2>
                  <p className="text-center max-w-md">
                    The admin hasn't uploaded any lectures for this course yet. 
                    Please check back later or contact the administration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
