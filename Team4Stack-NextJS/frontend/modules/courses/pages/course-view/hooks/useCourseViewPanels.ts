'use client';

import { useState } from 'react';

export const useCourseViewPanels = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizVideoId, setQuizVideoId] = useState<number | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);
  const [assignmentsVideoId, setAssignmentsVideoId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  return {
    showQuiz,
    setShowQuiz,
    quizVideoId,
    setQuizVideoId,
    showAssignments,
    setShowAssignments,
    assignmentsVideoId,
    setAssignmentsVideoId,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    iframeError,
    setIframeError
  };
};
