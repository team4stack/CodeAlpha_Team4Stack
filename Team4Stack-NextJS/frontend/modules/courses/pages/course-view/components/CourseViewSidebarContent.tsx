import React, { useEffect, useMemo } from 'react';
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
        <span className={`text-sm font-bold tabular-nums ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          {progressPercentage}%
        </span>
        <span className={`text-xs font-semibold tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {completedCount}/{totalVideos}
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
  const totalLabel = totalCourseDuration > 0 ? formatPlaybackTime(totalCourseDuration) : '--';
  return (
    <div className={`mt-3 pt-3 border-t ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`flex flex-col gap-1 text-xs tabular-nums ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Total</span>
          <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{totalLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Watched</span>
          <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {formatPlaybackTime(totalWatchedTime)}
          </span>
        </div>
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
  quizLockedMap,
  videoTotalDuration,
  videoWatchedTime,
  videoProgress,
  assignmentCountByVideo,
  assignmentSubmittedByVideo,
  assignmentMarksByVideo,
  onSelectVideo,
  onOpenAssignmentForVideo,
  onCloseSidebar
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedVideoId == null) return;
    const el = document.getElementById(`lecture-row-${selectedVideoId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedVideoId]);

  const { quizIndexByVideo, assignmentRangeByVideo } = useMemo(() => {
    let quizCounter = 0;
    let assignmentCounter = 0;
    const quizMap = new Map<number, number>();
    const assignmentMap = new Map<number, { start: number; end: number }>();

    videos.forEach((video) => {
      if (quizExistsMap.get(video.id)) {
        quizCounter += 1;
        quizMap.set(video.id, quizCounter);
      }
      const count = assignmentCountByVideo.get(video.id) || 0;
      if (count > 0) {
        const start = assignmentCounter + 1;
        assignmentCounter += count;
        assignmentMap.set(video.id, { start, end: assignmentCounter });
      }
    });

    return { quizIndexByVideo: quizMap, assignmentRangeByVideo: assignmentMap };
  }, [videos, quizExistsMap, assignmentCountByVideo]);

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
            const quizLocked = quizLockedMap.get(video.id) || false;
            const quizIndex = quizIndexByVideo.get(video.id) ?? null;
            const assignmentRange = assignmentRangeByVideo.get(video.id);

            return (
              <div key={video.id} id={`lecture-row-${video.id}`}>
                <CourseViewLectureAccordionItem
                  isDarkMode={isDarkMode}
                  video={video}
                  index={index}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  isCompleted={isCompleted}
                  quizExists={quizExists}
                  quizScore={quizScore}
                  quizIndex={quizIndex}
                  quizLocked={quizLocked}
                  videoTotalDuration={videoTotalDuration}
                  videoWatchedTime={videoWatchedTime}
                  videoProgress={videoProgress}
                  assignmentCount={assignmentCountByVideo.get(video.id) || 0}
                  assignmentSubmitted={assignmentSubmittedByVideo.get(video.id) || false}
                  assignmentMarks={assignmentMarksByVideo.get(video.id) || null}
                  assignmentStartIndex={assignmentRange?.start ?? null}
                  assignmentEndIndex={assignmentRange?.end ?? null}
                  onSelect={() => {
                    onSelectVideo(video.id);
                    onCloseSidebar();
                  }}
                  onOpenAssignmentForVideo={onOpenAssignmentForVideo}
                />
              </div>
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

