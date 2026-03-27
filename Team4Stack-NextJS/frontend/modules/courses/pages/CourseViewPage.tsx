'use client';

import React from 'react';
import CourseViewErrorState from './course-view/components/CourseViewErrorState';
import CourseViewLoadingState from './course-view/components/CourseViewLoadingState';
import CourseViewPageLayout from './course-view/components/CourseViewPageLayout';
import { useCourseViewPageState } from './course-view/hooks/useCourseViewPageState';

interface CourseViewPageProps { courseId?: string; }

const CourseViewPage: React.FC<CourseViewPageProps> = ({ courseId }) => {
  const state = useCourseViewPageState(courseId);

  if (state.loading) {
    return <CourseViewLoadingState isDarkMode={state.isDarkMode} />;
  }

  if (state.error || !state.course) {
    return (
      <CourseViewErrorState
        isDarkMode={state.isDarkMode}
        error={state.error}
        onBack={state.onBack}
      />
    );
  }

  return (
    <CourseViewPageLayout
      isDarkMode={state.isDarkMode}
      isDesktopView={state.layout.isDesktopView}
      isSidebarOpen={state.isSidebarOpen}
      isSidebarCollapsed={state.isSidebarCollapsed}
      showDesktopLectureListFab={state.layout.showDesktopLectureListFab}
      desktopShowListBtnClass={state.layout.desktopShowListBtnClass}
      onToggleSidebar={state.onToggleSidebar}
      onExpandSidebar={state.onExpandSidebar}
      lectureListProps={state.layout.lectureListProps}
      rightPanelProps={state.layout.rightPanelProps}
    />
  );
};

export default CourseViewPage;
