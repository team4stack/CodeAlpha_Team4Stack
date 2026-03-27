'use client';

import { coursesApi } from '@/lib/api';
import type { Course, ProgressRecord, Video } from '../types';
import { convertToEmbedUrl } from '../youtubeVideoUrlHelpers';

export const isEmbeddableYouTubeUrl = (url?: string | null) => {
  if (!url) return false;
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return false;
  return convertToEmbedUrl(url) !== null;
};

export const parseDurationSeconds = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;

  const parts = trimmed.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return 0;
};

const getRecordVideoId = (record: ProgressRecord | null | undefined): number | null => {
  const raw = record?.video_id;
  const vid = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(vid) || vid <= 0) return null;
  return vid;
};

const getEffectiveWatchedSeconds = (record: ProgressRecord, duration: number): number => {
  const score = typeof record.score === 'number' && record.score >= 0 ? record.score : 0;
  if (duration > 0) {
    if (score > 0) return Math.min(score, duration);
    if (record.completed) return duration;
    return 0;
  }
  return score > 0 ? score : 0;
};

const updateWatchedMaps = (
  videoId: number,
  watchedSeconds: number,
  watchedTimeMap: Map<number, number>,
  lastTrackedInit: Map<number, number>
) => {
  if (watchedSeconds <= 0) return;
  const prev = watchedTimeMap.get(videoId) || 0;
  const next = Math.max(prev, watchedSeconds);
  watchedTimeMap.set(videoId, next);
  lastTrackedInit.set(videoId, Math.floor(next));
};

const computeProgressPercent = (
  videoId: number,
  duration: number,
  watchedTimeMap: Map<number, number>,
  completed: boolean
) => {
  if (duration > 0) {
    const watched = watchedTimeMap.get(videoId) || 0;
    return Math.min(100, (watched / duration) * 100);
  }
  return completed ? 100 : 0;
};

export function hydrateProgressFromApi(args: {
  progressData: ProgressRecord[];
  durationMap: Map<number, number>;
}): {
  watched: Set<number>;
  watchedTimeMap: Map<number, number>;
  progressMap: Map<number, number>;
  lastTrackedInit: Map<number, number>;
} {
  const watched = new Set<number>();
  const watchedTimeMap = new Map<number, number>();
  const progressMap = new Map<number, number>();
  const lastTrackedInit = new Map<number, number>();

  for (const record of args.progressData || []) {
    const vid = getRecordVideoId(record);
    if (!vid) continue;

    const duration = args.durationMap.get(vid) || 0;
    const watchedSeconds = getEffectiveWatchedSeconds(record, duration);
    updateWatchedMaps(vid, watchedSeconds, watchedTimeMap, lastTrackedInit);

    if (record.completed) watched.add(vid);

    const pct = computeProgressPercent(vid, duration, watchedTimeMap, Boolean(record.completed));
    progressMap.set(vid, Math.max(progressMap.get(vid) || 0, pct));
  }

  return { watched, watchedTimeMap, progressMap, lastTrackedInit };
}

type AssignmentRow = {
  video_id?: number | string;
  total_marks?: number | string;
  submission?: {
    awarded_marks?: number | string | null;
    status?: string | null;
    file_url?: string | null;
  } | null;
};

const fetchCourseById = async (courseId: number): Promise<Course | null> => {
  const courseResult = await coursesApi.getCourseById(courseId);
  if (courseResult.error) throw new Error(String(courseResult.error));
  return (courseResult.data as Course) || null;
};

const fetchCourseVideos = async (courseId: number): Promise<Video[]> => {
  const videosResult = await coursesApi.getCourseVideos(courseId);
  if (videosResult.error) throw new Error(String(videosResult.error));
  return (videosResult.data as Video[]) || [];
};

const buildDurationMap = (videos: Video[]) => {
  const durationMap = new Map<number, number>();
  for (const video of videos) {
    const duration = parseDurationSeconds(video?.duration);
    if (duration > 0) durationMap.set(video.id, duration);
  }
  return durationMap;
};

const fetchProgressData = async (userId: string, courseId: number): Promise<ProgressRecord[]> => {
  const progressResult = await coursesApi.getUserProgress(userId, courseId);
  return progressResult.error ? [] : ((progressResult.data as ProgressRecord[]) || []);
};

const fetchAssignmentMeta = async (courseId: number) => {
  const assignmentCountByVideo = new Map<number, number>();
  const assignmentSubmittedByVideo = new Map<number, boolean>();
  const assignmentMarksByVideo = new Map<number, { awarded: number; total: number }>();

  try {
    const assignmentsResult = await coursesApi.getAssignmentsByCourse(courseId);
    const list = assignmentsResult.error ? [] : ((assignmentsResult.data as AssignmentRow[]) || []);
    for (const assignment of list) {
      const vidRaw = assignment?.video_id;
      const vid = typeof vidRaw === 'number' ? vidRaw : Number(vidRaw);
      if (!Number.isFinite(vid) || vid <= 0) continue;

      const prev = assignmentCountByVideo.get(vid) || 0;
      assignmentCountByVideo.set(vid, prev + 1);

      const totalMarks = Number(assignment?.total_marks || 0);
      const awardedMarks = Number(assignment?.submission?.awarded_marks || 0);
      const prevMarks = assignmentMarksByVideo.get(vid) || { awarded: 0, total: 0 };
      assignmentMarksByVideo.set(vid, {
        awarded: prevMarks.awarded + (Number.isFinite(awardedMarks) ? awardedMarks : 0),
        total: prevMarks.total + (Number.isFinite(totalMarks) ? totalMarks : 0)
      });

      const submitted = Boolean(assignment?.submission?.status || assignment?.submission?.file_url);
      if (submitted) assignmentSubmittedByVideo.set(vid, true);
    }
  } catch {
    // ignore assignments errors
  }

  return { assignmentCountByVideo, assignmentSubmittedByVideo, assignmentMarksByVideo };
};

export async function fetchCourseViewData(args: {
  courseId: number;
  userId: string;
}): Promise<{
  course: Course | null;
  videos: Video[];
  durationMap: Map<number, number>;
  progressData: ProgressRecord[];
  assignmentCountByVideo: Map<number, number>;
  assignmentSubmittedByVideo: Map<number, boolean>;
  assignmentMarksByVideo: Map<number, { awarded: number; total: number }>;
}> {
  const [course, videos] = await Promise.all([
    fetchCourseById(args.courseId),
    fetchCourseVideos(args.courseId)
  ]);

  const durationMap = buildDurationMap(videos);
  const progressData = await fetchProgressData(args.userId, args.courseId);
  const assignmentMeta = await fetchAssignmentMeta(args.courseId);

  return {
    course,
    videos,
    durationMap,
    progressData,
    assignmentCountByVideo: assignmentMeta.assignmentCountByVideo,
    assignmentSubmittedByVideo: assignmentMeta.assignmentSubmittedByVideo,
    assignmentMarksByVideo: assignmentMeta.assignmentMarksByVideo
  };
}
