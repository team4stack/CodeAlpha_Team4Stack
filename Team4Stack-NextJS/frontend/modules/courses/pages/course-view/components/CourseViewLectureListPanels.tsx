import React from 'react';
import CourseViewSidebarContent from './CourseViewSidebarContent';
import type { QuizScore, Video } from '../types';

interface CourseViewLectureListPanelsProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  courseTitle: string;
  progressPercentage: number;
  completedCount: number;
  totalVideos: number;
  totalCourseDuration: number;
  totalWatchedTime: number;
  videos: Video[];
  videoWatched: Set<number>;
  selectedVideoId: number | null;
  unlockedLectures: Set<number>;
  quizExistsMap: Map<number, boolean>;
  quizScoresMap: Map<number, QuizScore>;
  quizLockedMap: Map<number, boolean>;
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  assignmentCountByVideo: Map<number, number>;
  assignmentSubmittedByVideo: Map<number, boolean>;
  assignmentMarksByVideo: Map<number, { awarded: number; total: number }>;
  onSelectVideo: (videoId: number) => void;
  onOpenAssignmentForVideo: (videoId: number) => void;
  onCloseSidebar: () => void;
  onCollapseSidebar: () => void;
}

const CourseViewLectureListPanels: React.FC<CourseViewLectureListPanelsProps> = ({
  isDarkMode,
  isSidebarOpen,
  isSidebarCollapsed,
  courseTitle,
  progressPercentage,
  completedCount,
  totalVideos,
  totalCourseDuration,
  totalWatchedTime,
  videos,
  videoWatched,
  selectedVideoId,
  unlockedLectures,
  quizExistsMap,
  quizScoresMap,
  quizLockedMap,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  assignmentCountByVideo,
  assignmentSubmittedByVideo,
  assignmentMarksByVideo,
  onSelectVideo,
  onOpenAssignmentForVideo,
  onCloseSidebar,
  onCollapseSidebar
}) => {
  const desktopHideListBtnClass = [
    'btn-plain btn-no-glass absolute -right-2 top-3 z-30 grid h-8 w-11 place-items-center justify-start rounded-md border pl-2 shadow-sm opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus:opacity-100 focus:pointer-events-auto',
    isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 bg-white text-gray-700'
  ].join(' ');

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close lecture list overlay"
            onClick={onCloseSidebar}
          />
          <div
            className={`course-sidebar-no-glass absolute left-2 top-[calc(3.5rem+0.5rem)] sm:top-[calc(4rem+0.5rem)] w-[min(22rem,calc(100vw-1rem))] max-w-[92vw] h-auto max-h-[calc(100vh-4.5rem)] overflow-visible rounded-xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="relative h-auto min-h-0 overflow-visible rounded-xl">
              <div className="h-auto max-h-[calc(100vh-6rem)] min-h-0 overflow-x-hidden overflow-y-auto admin-custom-scrollbar rounded-xl">
                <CourseViewSidebarContent
                  isDarkMode={isDarkMode}
                  courseTitle={courseTitle}
                  progressPercentage={progressPercentage}
                  completedCount={completedCount}
                  totalVideos={totalVideos}
                  totalCourseDuration={totalCourseDuration}
                  totalWatchedTime={totalWatchedTime}
                  videos={videos}
                  videoWatched={videoWatched}
                  selectedVideoId={selectedVideoId}
                  unlockedLectures={unlockedLectures}
                  quizExistsMap={quizExistsMap}
                  quizScoresMap={quizScoresMap}
                  quizLockedMap={quizLockedMap}
                  videoTotalDuration={videoTotalDuration}
                  videoWatchedTime={videoWatchedTime}
                  videoProgress={videoProgress}
                  assignmentCountByVideo={assignmentCountByVideo}
                  assignmentSubmittedByVideo={assignmentSubmittedByVideo}
                  assignmentMarksByVideo={assignmentMarksByVideo}
                  onSelectVideo={onSelectVideo}
                onOpenAssignmentForVideo={onOpenAssignmentForVideo}
                  onCloseSidebar={onCloseSidebar}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`course-sidebar-no-glass group hidden lg:block order-2 lg:order-1 transition-[width] duration-300 relative overflow-hidden ${
          isSidebarCollapsed ? 'w-0 border-r-0' : 'w-80 border-r'
        } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {!isSidebarCollapsed && (
          <button
            type="button"
            className={desktopHideListBtnClass}
            onClick={(event) => {
              event.stopPropagation();
              onCollapseSidebar();
            }}
            title="Hide lecture list"
            aria-label="Hide lecture list"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div
          className={
            isSidebarCollapsed
              ? 'hidden'
              : 'block h-full min-h-0 overflow-x-hidden overflow-y-auto admin-custom-scrollbar'
          }
        >
          <CourseViewSidebarContent
            isDarkMode={isDarkMode}
            courseTitle={courseTitle}
            progressPercentage={progressPercentage}
            completedCount={completedCount}
            totalVideos={totalVideos}
            totalCourseDuration={totalCourseDuration}
            totalWatchedTime={totalWatchedTime}
            videos={videos}
            videoWatched={videoWatched}
            selectedVideoId={selectedVideoId}
            unlockedLectures={unlockedLectures}
            quizExistsMap={quizExistsMap}
            quizScoresMap={quizScoresMap}
            quizLockedMap={quizLockedMap}
            videoTotalDuration={videoTotalDuration}
            videoWatchedTime={videoWatchedTime}
            videoProgress={videoProgress}
            assignmentCountByVideo={assignmentCountByVideo}
            assignmentSubmittedByVideo={assignmentSubmittedByVideo}
            assignmentMarksByVideo={assignmentMarksByVideo}
            onSelectVideo={onSelectVideo}
            onOpenAssignmentForVideo={onOpenAssignmentForVideo}
            onCloseSidebar={() => {}}
          />
        </div>
      </div>
    </>
  );
};

export default CourseViewLectureListPanels;
