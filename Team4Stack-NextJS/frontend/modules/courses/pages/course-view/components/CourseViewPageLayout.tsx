'use client';

import React from 'react';
import StudentNavbar from '@/navigation/StudentNavbar';
import CourseViewLectureListPanels from './CourseViewLectureListPanels';
import CourseViewRightPanel from './CourseViewRightPanel';
import MobileLectureToggleButton from './MobileLectureToggleButton';

type CourseViewPageLayoutProps = {
  isDarkMode: boolean;
  isDesktopView: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  showDesktopLectureListFab: boolean;
  desktopShowListBtnClass: string;
  onToggleSidebar: () => void;
  onExpandSidebar: () => void;
  lectureListProps: React.ComponentProps<typeof CourseViewLectureListPanels>;
  rightPanelProps: React.ComponentProps<typeof CourseViewRightPanel>;
};

const CourseViewPageLayout: React.FC<CourseViewPageLayoutProps> = ({
  isDarkMode,
  isDesktopView,
  isSidebarOpen,
  isSidebarCollapsed,
  showDesktopLectureListFab,
  desktopShowListBtnClass,
  onToggleSidebar,
  onExpandSidebar,
  lectureListProps,
  rightPanelProps
}) => {
  return (
    <div className="min-h-0 lg:min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-14 sm:pt-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-3.5rem)] sm:lg:h-[calc(100vh-4rem)]">
          <CourseViewLectureListPanels
            {...lectureListProps}
          />

          <div
            className={`relative order-1 lg:order-2 flex-1 overflow-visible lg:overflow-hidden ${
              showDesktopLectureListFab ? 'lg:ps-6' : ''
            } ${isDesktopView && !isSidebarCollapsed ? 'lg:ps-2' : ''}`}
          >
            {showDesktopLectureListFab && (
              <button
                type="button"
                className={desktopShowListBtnClass}
                onClick={onExpandSidebar}
                title="Show lecture list"
                aria-label="Show lecture list"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!isDesktopView && (
              <MobileLectureToggleButton
                isOpen={isSidebarOpen}
                onToggle={onToggleSidebar}
              />
            )}
            <CourseViewRightPanel {...rightPanelProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPageLayout;
