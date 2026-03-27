'use client';

import React from 'react';
import QuizComponent from '../../components/QuizComponent';

type CourseViewQuizViewProps = {
  quizVideoId: number;
  parsedCourseId: number;
  showDesktopLectureListFab: boolean;
  onQuizComplete: () => void;
  onClose: () => void;
};

const CourseViewQuizView: React.FC<CourseViewQuizViewProps> = ({
  quizVideoId,
  parsedCourseId,
  showDesktopLectureListFab,
  onQuizComplete,
  onClose
}) => {
  return (
    <div className={`relative z-30 h-full min-h-0 ${showDesktopLectureListFab ? 'ms-1.5 sm:ms-2' : ''}`}>
      <QuizComponent
        videoId={quizVideoId}
        courseId={parsedCourseId}
        onQuizComplete={onQuizComplete}
        onClose={onClose}
      />
    </div>
  );
};

export default CourseViewQuizView;
