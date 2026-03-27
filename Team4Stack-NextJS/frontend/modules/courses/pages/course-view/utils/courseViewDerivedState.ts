'use client';

import type { Course, Video } from '../types';
import { isEmbeddableYouTubeUrl } from './courseViewData';

type CourseViewDerivedArgs = {
  course: Course | null;
  videos: Video[];
  selectedVideoId: number | null;
  unlockedLectures: Set<number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  videoTotalDuration: Map<number, number>;
  quizExistsMap: Map<number, boolean>;
  quizPassedMap: Map<number, boolean>;
  quizLockedMap: Map<number, boolean>;
  youtubeIframeFallbackActive: boolean;
  iframeError: boolean;
  getNextLectureId: (videoId: number) => number | null;
  getPrevLectureId: (videoId: number) => number | null;
};

export const getCourseViewDerivedState = ({
  course,
  videos,
  selectedVideoId,
  unlockedLectures,
  videoWatchedTime,
  videoProgress,
  videoTotalDuration,
  quizExistsMap,
  quizPassedMap,
  quizLockedMap,
  youtubeIframeFallbackActive,
  iframeError,
  getNextLectureId,
  getPrevLectureId
}: CourseViewDerivedArgs) => {
  const selectedVideo = selectedVideoId
    ? videos.find((video) => video.id === selectedVideoId && unlockedLectures.has(video.id))
    : null;
  const selectedVideoIsYouTube = isEmbeddableYouTubeUrl(selectedVideo?.video_url);
  const courseTitle = course?.title || course?.name || 'Course';
  const selectedVideoIndex = selectedVideo ? videos.findIndex((video) => video.id === selectedVideo.id) : -1;
  const lecturePosition = selectedVideoIndex >= 0 ? `${selectedVideoIndex + 1} / ${videos.length}` : '';

  const selectedVideoWatchedSeconds = selectedVideo ? (videoWatchedTime.get(selectedVideo.id) || 0) : 0;
  const selectedVideoProgress = selectedVideo ? (videoProgress.get(selectedVideo.id) || 0) : 0;
  const selectedVideoTotalSeconds = selectedVideo
    ? (videoTotalDuration.get(selectedVideo.id) || selectedVideo.duration || 0)
    : 0;
  const selectedQuizExists = selectedVideo ? (quizExistsMap.get(selectedVideo.id) || false) : false;
  const selectedQuizPassed = selectedVideo && selectedQuizExists
    ? (quizPassedMap.get(selectedVideo.id) || false)
    : false;
  const selectedQuizLocked = selectedVideo ? (quizLockedMap.get(selectedVideo.id) || false) : false;
  const selectedNextLectureId = selectedVideo ? getNextLectureId(selectedVideo.id) : null;
  const selectedPrevLectureId = selectedVideo ? getPrevLectureId(selectedVideo.id) : null;
  const selectedHasNext = selectedNextLectureId !== null;
  const selectedHasPrev = selectedPrevLectureId !== null;
  const selectedCanComplete =
    selectedVideoProgress >= 90 ||
    (selectedVideoIsYouTube && youtubeIframeFallbackActive) ||
    (selectedVideoIsYouTube && iframeError);

  return {
    selectedVideo,
    selectedVideoIsYouTube,
    courseTitle,
    lecturePosition,
    selectedVideoWatchedSeconds,
    selectedVideoProgress,
    selectedVideoTotalSeconds,
    selectedQuizExists,
    selectedQuizPassed,
    selectedQuizLocked,
    selectedNextLectureId,
    selectedPrevLectureId,
    selectedHasNext,
    selectedHasPrev,
    selectedCanComplete
  };
};
