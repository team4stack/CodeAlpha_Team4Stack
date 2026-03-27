'use client';

import React from 'react';
import CourseViewAssignmentsView from './CourseViewAssignmentsView';
import CourseViewLectureView from './CourseViewLectureView';
import CourseViewQuizView from './CourseViewQuizView';
import type { Video } from '../types';

type CourseViewRightPanelProps = {
  showQuiz: boolean;
  quizVideoId: number | null;
  showAssignments: boolean;
  assignmentsVideoId: number | null;
  parsedCourseId: number;
  isDarkMode: boolean;
  showDesktopLectureListFab: boolean;
  lectureViewProps: {
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
  onAssignmentsBack: () => void;
  onQuizComplete: (passed: boolean, attemptCount: number) => void | Promise<void>;
  onQuizClose: () => void;
};

const CourseViewRightPanel: React.FC<CourseViewRightPanelProps> = ({
  showQuiz,
  quizVideoId,
  showAssignments,
  assignmentsVideoId,
  parsedCourseId,
  isDarkMode,
  showDesktopLectureListFab,
  lectureViewProps,
  onAssignmentsBack,
  onQuizComplete,
  onQuizClose
}) => {
  if (showQuiz && quizVideoId) {
    return (
      <CourseViewQuizView
        quizVideoId={quizVideoId}
        parsedCourseId={parsedCourseId}
        showDesktopLectureListFab={showDesktopLectureListFab}
        onQuizComplete={onQuizComplete}
        onClose={onQuizClose}
      />
    );
  }

  if (showAssignments && assignmentsVideoId) {
    return (
      <CourseViewAssignmentsView
        parsedCourseId={parsedCourseId}
        assignmentsVideoId={assignmentsVideoId}
        isDarkMode={isDarkMode}
        showDesktopLectureListFab={showDesktopLectureListFab}
        onBack={onAssignmentsBack}
      />
    );
  }

  return <CourseViewLectureView {...lectureViewProps} />;
};

export default CourseViewRightPanel;
