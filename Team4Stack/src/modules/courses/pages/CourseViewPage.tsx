import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { ProgressBar, Certificate } from '../components';
import { supabase } from '../../../utils/supabaseClient';

interface Video {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  order: number;
}

interface Course {
  id: string;
  name: string;
  description?: string;
}

interface ProgressRecord {
  id: string;
  video_id: string;
  completed: boolean;
  score?: number;
}

const CourseViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
      if (courseError) throw courseError;
      setCourse(courseData);
      
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('course_id', courseId)
        .order('order');
        
      if (videosError) throw videosError;
      setVideos(videosData || []);
      if (videosData && videosData.length > 0) {
        setSelectedVideoId(videosData[0].id);
      }
      
      // Fetch progress records
      const { data: progressData } = await supabase
        .from('progress_records')
        .select('*')
        .eq('course_id', courseId);
        
      setProgressRecords(progressData || []);
    } catch (err: any) {
      console.error('[CourseViewPage] Failed to load course', err);
      setError('Unable to load course content right now.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const progressByVideo = useMemo(() => {
    const map = new Map<string, ProgressRecord>();
    progressRecords.forEach((record) => {
      if (record.video_id) {
        map.set(record.video_id, record);
      }
    });
    return map;
  }, [progressRecords]);

  const completedCount = useMemo(
    () => progressRecords.filter((record) => record.video_id && record.completed).length,
    [progressRecords]
  );

  const unlockedVideoIds = useMemo(
    () => new Set(progressRecords.filter((record) => record.video_id).map((record) => record.video_id)),
    [progressRecords]
  );

  const totalVideos = videos.length;
  const courseCompleted = totalVideos > 0 && completedCount === totalVideos;

  const handleSelectVideo = (videoId: string, unlocked: boolean) => {
    if (!unlocked) return;
    setSelectedVideoId(videoId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          isDarkMode ? 'border-purple-500' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className={`rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-red-900/30 text-red-300 border border-red-700' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const selectedVideo = videos.find((video) => video.id === selectedVideoId) || videos[0];
  const selectedProgress = selectedVideo ? progressByVideo.get(selectedVideo.id) : null;
  const selectedUnlocked = selectedVideo ? unlockedVideoIds.has(selectedVideo.id) || selectedVideo === videos[0] : false;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header Section */}
      <div className={`pt-24 md:pt-28 pb-8 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <div className="inline-block mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isDarkMode
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                }`}>
                  Course
                </span>
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {course.name}
              </h1>
              {course.description && (
                <p className={`text-lg max-w-3xl ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {course.description}
                </p>
              )}
            </div>
            {courseCompleted && <Certificate courseName={course.name} />}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-lg overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="aspect-video bg-black">
                {selectedVideo?.video_url ? (
                  <iframe
                    src={selectedVideo.video_url}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
                    <span className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-100'
                    }`}>
                      Video player
                    </span>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      No video URL provided
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className={`text-2xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedVideo?.title}
                </h2>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {selectedVideo?.description || 'No description available'}
                </p>
                {selectedProgress?.score != null && (
                  <div className={`rounded-lg p-4 mb-4 ${
                    isDarkMode 
                      ? 'bg-blue-900/30 border border-blue-700' 
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`mb-2 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Your previous score: {selectedProgress.score}%
                    </p>
                    <button className={`px-4 py-2 rounded-lg text-sm ${
                      isDarkMode
                        ? 'bg-blue-700 text-white hover:bg-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      Request Review
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  {selectedProgress?.completed ? (
                    <button className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold" disabled>
                      Approved
                    </button>
                  ) : (
                    <button className={`px-4 py-2 rounded-lg font-semibold ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-300 text-gray-700'
                    }`} disabled>
                      Locked
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(-1)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg p-6 sticky top-24 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Course Content
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isDarkMode
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {totalVideos} Videos
                </span>
              </div>
              <div className={`rounded-lg p-4 mb-6 ${
                isDarkMode
                  ? 'bg-gray-700/50 border border-gray-600'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Progress
                  </span>
                  <span className={`text-sm font-bold ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {completedCount} / {totalVideos}
                  </span>
                </div>
                <ProgressBar completed={completedCount} total={totalVideos} />
                <p className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0}% Complete
                </p>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {videos.map((video, index) => {
                  const progress = progressByVideo.get(video.id);
                  const unlocked = unlockedVideoIds.has(video.id) || video === videos[0];
                  const isSelected = video.id === selectedVideoId;

                  return (
                    <div
                      key={video.id}
                      onClick={() => handleSelectVideo(video.id, unlocked)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500 shadow-lg'
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 shadow-lg'
                          : isDarkMode
                          ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      } ${!unlocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {!unlocked ? (
                            <span className="text-xl">🔒</span>
                          ) : progress?.completed ? (
                            <span className="text-2xl">✅</span>
                          ) : progress ? (
                            <span className="text-2xl">⏸️</span>
                          ) : (
                            <span className={`text-xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>⭕</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {index + 1}.
                            </span>
                            <span className={`font-semibold truncate ${
                              unlocked 
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {video.title}
                            </span>
                          </div>
                          {video.description && (
                            <p className={`text-xs line-clamp-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {video.description}
                            </p>
                          )}
                        </div>
                        {video.thumbnail_url && (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="rounded-lg w-16 h-10 object-cover flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;

