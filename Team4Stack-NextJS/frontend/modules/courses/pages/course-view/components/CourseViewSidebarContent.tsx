import React from 'react';
import type { QuizScore, Video } from '../types';
import { formatPlaybackTime } from '../utils/formatPlaybackTime';
import CourseViewLectureAccordionItem from './CourseViewLectureAccordionItem';

interface CourseViewSidebarContentProps {
  isDarkMode: boolean;
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
  videoTotalDuration: Map<number, number>;
  videoWatchedTime: Map<number, number>;
  videoProgress: Map<number, number>;
  assignmentCountByVideo: Map<number, number>;
  onSelectVideo: (videoId: number) => void;
  onCloseSidebar: () => void;
}

const SidebarProgressBar: React.FC<{
  isDarkMode: boolean;
  progressPercentage: number;
  completedCount: number;
  totalVideos: number;
}> = ({ isDarkMode, progressPercentage, completedCount, totalVideos }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-semibold ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Course Progress
        </span>
        <span className={`text-sm font-bold ${
          isDarkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          {progressPercentage}%
        </span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className={`text-xs mt-2 text-center ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {completedCount} of {totalVideos} lectures completed
      </p>
    </>
  );
};

const SidebarTimeSummary: React.FC<{
  isDarkMode: boolean;
  totalVideos: number;
  totalCourseDuration: number;
  totalWatchedTime: number;
}> = ({ isDarkMode, totalVideos, totalCourseDuration, totalWatchedTime }) => {
  if (totalVideos <= 0) return null;
  return (
    <div className={`mt-3 pt-3 border-t ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-center gap-2">
        <span className={`text-xs font-semibold ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Total course time
        </span>
        <span className={`text-xs font-bold tabular-nums ${
          isDarkMode ? 'text-purple-400' : 'text-purple-600'
        }`}>
          {totalCourseDuration > 0 ? formatPlaybackTime(totalCourseDuration) : '—'}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2 mt-1">
        <span className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Watched (all lectures)
        </span>
        <span className={`text-xs font-medium tabular-nums ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {formatPlaybackTime(totalWatchedTime)}
        </span>
      </div>
    </div>
  );
};

const SidebarHeader: React.FC<Pick<CourseViewSidebarContentProps,
  'isDarkMode' | 'courseTitle' | 'progressPercentage' | 'completedCount' | 'totalVideos' | 'totalCourseDuration' | 'totalWatchedTime'
>> = ({
  isDarkMode,
  courseTitle,
  progressPercentage,
  completedCount,
  totalVideos,
  totalCourseDuration,
  totalWatchedTime
}) => {
  return (
    <div className={`p-4 border-b lg:sticky lg:top-0 z-10 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {courseTitle}
          </h2>
        </div>
        <SidebarProgressBar
          isDarkMode={isDarkMode}
          progressPercentage={progressPercentage}
          completedCount={completedCount}
          totalVideos={totalVideos}
        />
        <SidebarTimeSummary
          isDarkMode={isDarkMode}
          totalVideos={totalVideos}
          totalCourseDuration={totalCourseDuration}
          totalWatchedTime={totalWatchedTime}
        />
      </div>
    </div>
  );
};

const CourseViewSidebarContent: React.FC<CourseViewSidebarContentProps> = ({
  isDarkMode,
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
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  assignmentCountByVideo,
  onSelectVideo,
  onCloseSidebar
}) => {
  return (
    <>
      <SidebarHeader
        isDarkMode={isDarkMode}
        courseTitle={courseTitle}
        progressPercentage={progressPercentage}
        completedCount={completedCount}
        totalVideos={totalVideos}
        totalCourseDuration={totalCourseDuration}
        totalWatchedTime={totalWatchedTime}
      />

      <div className="p-4 space-y-2">
        {videos.length > 0 ? (
          videos.map((video, index) => {
            const isCompleted = videoWatched.has(video.id);
            const isSelected = video.id === selectedVideoId;
            const isLocked = !unlockedLectures.has(video.id);
            const quizExists = Boolean(quizExistsMap.get(video.id));
            const quizScore = quizExists ? quizScoresMap.get(video.id) : undefined;

            return (
              <CourseViewLectureAccordionItem
                key={video.id}
                isDarkMode={isDarkMode}
                video={video}
                index={index}
                isSelected={isSelected}
                isLocked={isLocked}
                isCompleted={isCompleted}
                quizExists={quizExists}
                quizScore={quizScore}
                videoTotalDuration={videoTotalDuration}
                videoWatchedTime={videoWatchedTime}
                videoProgress={videoProgress}
                assignmentCount={assignmentCountByVideo.get(video.id) || 0}
                onSelect={() => {
                  onSelectVideo(video.id);
                  onCloseSidebar();
                }}
              />
            );
          })
        ) : (
          <div className={`p-6 text-center rounded-lg ${
            isDarkMode
              ? 'bg-gray-700/30 border border-gray-600'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <p className={`font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No Lectures Available
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Admin hasn&apos;t uploaded any lectures for this course yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseViewSidebarContent;

