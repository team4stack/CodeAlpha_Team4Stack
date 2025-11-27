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
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 md:mb-0 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {course.name}
          </h1>
          {courseCompleted && <Certificate courseName={course.name} />}
        </div>

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
            <div className={`rounded-xl shadow-lg p-6 ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Course Content
              </h2>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Progress
                </span>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {completedCount} of {totalVideos} videos completed
                </span>
              </div>
              <ProgressBar completed={completedCount} total={totalVideos} />
              <div className="mt-6">
                <ul className="space-y-2">
                  {videos.map((video) => {
                    const progress = progressByVideo.get(video.id);
                    const unlocked = unlockedVideoIds.has(video.id) || video === videos[0];
                    const isSelected = video.id === selectedVideoId;

                    return (
                      <li
                        key={video.id}
                        onClick={() => handleSelectVideo(video.id, unlocked)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-purple-900/30 border border-purple-700'
                              : 'bg-purple-50 border border-purple-200'
                            : isDarkMode
                            ? 'bg-gray-700/50 hover:bg-gray-700'
                            : 'bg-gray-50 hover:bg-gray-100'
                        } ${!unlocked ? 'opacity-60' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {!unlocked ? (
                              <span className="text-lg">🔒</span>
                            ) : progress?.completed ? (
                              <span className="text-green-500">✓</span>
                            ) : progress ? (
                              <span className="text-yellow-500">●</span>
                            ) : (
                              <span className="text-gray-400">○</span>
                            )}
                            <span className={`${
                              unlocked 
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {video.title}
                            </span>
                          </div>
                          {video.thumbnail_url && (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="rounded w-10 h-6 object-cover"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;

