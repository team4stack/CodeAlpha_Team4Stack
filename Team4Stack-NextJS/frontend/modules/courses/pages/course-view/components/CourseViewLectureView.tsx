'use client';

import React from 'react';
import type { Video } from '../types';
import CourseViewEmptyLecturesState from './CourseViewEmptyLecturesState';
import CourseViewLectureHeader from './CourseViewLectureHeader';
import CourseViewVideoPlayer from './CourseViewVideoPlayer';
import CourseViewVideoProgressPanel from './CourseViewVideoProgressPanel';

type CourseViewLectureViewProps = {
  isDarkMode: boolean;
  courseTitle: string;
  lecturePosition: string;
  selectedVideo: Video | null;
  videos: Video[];
  selectedVideoWatched: boolean;
  selectedCanComplete: boolean;
  selectedHasPrev: boolean;
  selectedHasNext: boolean;
  selectedQuizExists: boolean;
  selectedQuizPassed: boolean;
  selectedQuizLocked: boolean;
  selectedVideoWatchedSeconds: number;
  selectedVideoProgress: number;
  selectedVideoTotalSeconds: number;
  showDesktopLectureListFab: boolean;
  iframeError: boolean;
  youtubeApiPlayerAvailable: boolean;
  youtubeApiTimedOut: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onIframeLoaded: () => void;
  onIframeError: () => void;
  onRetryIframe: () => void;
  onVideoEnded: (videoId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onTakeQuiz: () => void;
  onCompleteAndNext: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
};

const CourseViewLectureView: React.FC<CourseViewLectureViewProps> = ({
  isDarkMode,
  courseTitle,
  lecturePosition,
  selectedVideo,
  videos,
  selectedVideoWatched,
  selectedCanComplete,
  selectedHasPrev,
  selectedHasNext,
  selectedQuizExists,
  selectedQuizPassed,
  selectedQuizLocked,
  selectedVideoWatchedSeconds,
  selectedVideoProgress,
  selectedVideoTotalSeconds,
  showDesktopLectureListFab,
  iframeError,
  youtubeApiPlayerAvailable,
  youtubeApiTimedOut,
  iframeRef,
  videoRef,
  onIframeLoaded,
  onIframeError,
  onRetryIframe,
  onVideoEnded,
  onPrev,
  onNext,
  onTakeQuiz,
  onCompleteAndNext,
  onTogglePlay,
  isPlaying
}) => {
  return (
    <div
      className={`relative z-30 h-auto lg:h-full overflow-visible lg:overflow-y-auto p-4 sm:p-6 ${
        showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''
      } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      {videos.length > 0 && selectedVideo ? (
        <div>
          <CourseViewLectureHeader
            isDarkMode={isDarkMode}
            courseTitle={courseTitle}
            lectureTitle={selectedVideo.title}
            lecturePosition={lecturePosition}
            lectureDescription={selectedVideo.description}
            watched={selectedVideoWatched}
            canComplete={selectedCanComplete}
            hasPrev={selectedHasPrev}
            hasNext={selectedHasNext}
            quizExists={selectedQuizExists}
            quizPassed={selectedQuizPassed}
            quizLocked={selectedQuizLocked}
            onPrev={onPrev}
            onTakeQuiz={onTakeQuiz}
            onNext={onNext}
            onCompleteAndNext={onCompleteAndNext}
          />
          <div className={`rounded-xl shadow-lg overflow-hidden mb-6 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="aspect-video bg-black relative overflow-hidden">
              <CourseViewVideoPlayer
                isDarkMode={isDarkMode}
                selectedVideo={selectedVideo}
                iframeError={iframeError}
                youtubeApiPlayerAvailable={youtubeApiPlayerAvailable}
                youtubeApiTimedOut={youtubeApiTimedOut}
                iframeRef={iframeRef}
                videoRef={videoRef}
                onIframeLoaded={onIframeLoaded}
                onIframeError={onIframeError}
                onRetryIframe={onRetryIframe}
                onVideoEnded={onVideoEnded}
              />
            </div>

            {selectedVideo.video_url && (
              <CourseViewVideoProgressPanel
                isDarkMode={isDarkMode}
                watchedSeconds={selectedVideoWatchedSeconds}
                progress={selectedVideoProgress}
                totalSeconds={selectedVideoTotalSeconds}
                onTogglePlay={onTogglePlay}
                isPlaying={isPlaying}
              />
            )}
          </div>
        </div>
      ) : (
        <CourseViewEmptyLecturesState isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

export default CourseViewLectureView;
