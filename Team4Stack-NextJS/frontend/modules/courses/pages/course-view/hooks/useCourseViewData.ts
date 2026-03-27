'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { logErrorSecurely, sanitizeError } from '@/lib/utils/errorHandler';
import type { Course, ProgressRecord, Video } from '../types';
import { fetchCourseViewData, hydrateProgressFromApi } from '../utils/courseViewData';

type CourseViewDataArgs = {
  userId?: string;
  parsedCourseId: number | null;
};

export const useCourseViewData = ({ userId, parsedCourseId }: CourseViewDataArgs) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Map<number, number>>(new Map());
  const [videoWatchedTime, setVideoWatchedTime] = useState<Map<number, number>>(new Map());
  const [videoTotalDuration, setVideoTotalDuration] = useState<Map<number, number>>(new Map());
  const [assignmentCountByVideo, setAssignmentCountByVideo] = useState<Map<number, number>>(new Map());
  const [assignmentSubmittedByVideo, setAssignmentSubmittedByVideo] = useState<Map<number, boolean>>(new Map());
  const [assignmentMarksByVideo, setAssignmentMarksByVideo] = useState<Map<number, { awarded: number; total: number }>>(new Map());

  const actualWatchedTimeRef = useRef<Map<number, number>>(new Map());
  const lastTrackedTimeRef = useRef<Map<number, number>>(new Map());

  const loadCourseData = useCallback(async () => {
    if (!userId) {
      setError('You must be logged in to view this course.');
      setLoading(false);
      return;
    }
    if (!parsedCourseId) {
      setError('Invalid course link. Please go back and try again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const {
        course,
        videos,
        durationMap,
        progressData,
        assignmentCountByVideo,
        assignmentSubmittedByVideo,
        assignmentMarksByVideo
      } = await fetchCourseViewData({ courseId: parsedCourseId, userId });

      setCourse(course);
      setVideos(videos);
      setVideoTotalDuration(durationMap);
      setProgressRecords(progressData);

      setSelectedVideoId((prev) => {
        if (prev && videos.some((v) => v.id === prev)) return prev;
        return videos.length > 0 ? videos[0].id : null;
      });

      const hydrated = hydrateProgressFromApi({ progressData, durationMap });
      hydrated.watchedTimeMap.forEach((w, vid) => {
        actualWatchedTimeRef.current.set(vid, w);
      });
      hydrated.lastTrackedInit.forEach((t, vid) => {
        lastTrackedTimeRef.current.set(vid, t);
      });
      setVideoWatched(hydrated.watched);
      setVideoWatchedTime(hydrated.watchedTimeMap);
      setVideoProgress(hydrated.progressMap);
      setAssignmentCountByVideo(assignmentCountByVideo);
      setAssignmentSubmittedByVideo(assignmentSubmittedByVideo);
      setAssignmentMarksByVideo(assignmentMarksByVideo);
    } catch (err: unknown) {
      logErrorSecurely(err, 'loadCourseData');
      const sanitized = sanitizeError(err);
      setError('Unable to load course content right now.');
      toast.error(sanitized.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [parsedCourseId, userId]);

  useEffect(() => {
    void loadCourseData();
  }, [loadCourseData]);

  return {
    course,
    videos,
    progressRecords,
    selectedVideoId,
    setSelectedVideoId,
    loading,
    error,
    videoWatched,
    videoProgress,
    videoWatchedTime,
    videoTotalDuration,
    assignmentCountByVideo,
    assignmentSubmittedByVideo,
    assignmentMarksByVideo,
    actualWatchedTimeRef,
    lastTrackedTimeRef,
    setVideoWatched,
    setVideoProgress,
    setVideoWatchedTime,
    setProgressRecords
  };
};
