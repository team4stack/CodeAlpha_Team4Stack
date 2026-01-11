'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import StudentNavbar from '@/navigation/StudentNavbar';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Video {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  order_index: number;
  duration?: number;
}

interface Course {
  id: number;
  name?: string;
  title?: string;
  description?: string;
}

interface ProgressRecord {
  id: number;
  user_id: string;
  course_id: number;
  video_id: number;
  completed: boolean;
  score?: number;
}

interface CourseViewPageProps {
  courseId: string;
}

const CourseViewPage: React.FC<CourseViewPageProps> = ({ courseId }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadCourseData = useCallback(async () => {
    if (!courseId || !user?.id) return;
    
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
      
      // Fetch videos ordered by order_index (admin's order)
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
        
      if (videosError) throw videosError;
      setVideos(videosData || []);
      if (videosData && videosData.length > 0) {
        setSelectedVideoId(videosData[0].id);
      } else {
        setSelectedVideoId(null);
      }
      
      // Fetch progress records for current user
      const { data: progressData, error: progressError } = await supabase
        .from('progress_records')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id);
        
      if (progressError) throw progressError;
      setProgressRecords(progressData || []);
      
      // Track which videos have been watched
      const watched = new Set<number>();
      progressData?.forEach((record) => {
        if (record.completed && record.video_id) {
          watched.add(record.video_id);
        }
      });
      setVideoWatched(watched);
    } catch (err: any) {
      console.error('[CourseViewPage] Failed to load course', err);
      setError('Unable to load course content right now.');
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Mark video as completed when watched
  const markVideoAsCompleted = useCallback(async (videoId: number) => {
    if (!user?.id || !courseId || videoWatched.has(videoId)) return;

    try {
      // Check if progress record exists
      const { data: existingRecord } = await supabase
        .from('progress_records')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('video_id', videoId)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('progress_records')
          .update({ completed: true })
          .eq('id', existingRecord.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('progress_records')
          .insert({
            user_id: user.id,
            course_id: Number(courseId),
            video_id: videoId,
            completed: true
          });
        
        if (error) throw error;
      }

      // Update local state
      setVideoWatched(prev => new Set(prev).add(videoId));
      
      // Reload progress records
      const { data: progressData } = await supabase
        .from('progress_records')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id);
      
      setProgressRecords(progressData || []);
    } catch (err: any) {
      console.error('Failed to mark video as completed:', err);
      toast.error('Failed to update progress');
    }
  }, [user?.id, courseId, videoWatched]);

  // Handle video end event
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !selectedVideoId) return;

    const handleVideoEnd = () => {
      markVideoAsCompleted(selectedVideoId);
    };

    videoElement.addEventListener('ended', handleVideoEnd);
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [selectedVideoId, markVideoAsCompleted]);

  const progressByVideo = useMemo(() => {
    const map = new Map<number, ProgressRecord>();
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

  const totalVideos = videos.length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  const handleSelectVideo = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <StudentNavbar />
        <div className={`pt-24 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDarkMode ? 'border-purple-500' : 'border-purple-600'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <StudentNavbar />
        <div className={`pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container-custom">
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Course Error
              </h1>
            </div>
            <div className={`rounded-xl p-6 max-w-2xl mx-auto ${
              isDarkMode 
                ? 'bg-red-900/30 text-red-300 border border-red-700' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <p className="mb-4">{error || 'Course not found'}</p>
              <button
                onClick={() => router.push('/student/courses')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Back to My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedVideo = selectedVideoId ? videos.find((video) => video.id === selectedVideoId) : null;
  const courseTitle = course.title || course.name || 'Course';

  return (
    <div className="min-h-screen transition-colors duration-300">
      <StudentNavbar />
      <div className={`pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Left Sidebar */}
          <div className={`w-80 border-r overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Timeline/Progress Bar at Top */}
            <div className={`p-4 border-b sticky top-0 z-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-3">
                <h2 className={`text-lg font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {courseTitle}
                </h2>
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
                {/* Progress Bar */}
                <div className={`w-full h-3 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {completedCount} of {totalVideos} lectures completed
                </p>
              </div>
            </div>

            {/* Lectures List */}
            <div className="p-4 space-y-2">
              {videos.length > 0 ? (
                videos.map((video, index) => {
                  const isCompleted = videoWatched.has(video.id);
                  const isSelected = video.id === selectedVideoId;

                  return (
                    <div
                      key={video.id}
                      onClick={() => handleSelectVideo(video.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500'
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300'
                          : isDarkMode
                          ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <span className="text-xl">✅</span>
                          ) : (
                            <span className={`text-xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm truncate ${
                              isSelected
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
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
                          {video.duration && (
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`p-6 text-center rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700/30 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="text-4xl mb-3">📚</div>
                  <p className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    No Lectures Available
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Admin hasn't uploaded any lectures for this course yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Video Player */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {videos.length > 0 && selectedVideo ? (
                <div>
                  {/* Video Player */}
                  <div className={`rounded-xl shadow-lg overflow-hidden mb-6 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="aspect-video bg-black">
                      {selectedVideo.video_url ? (
                        selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') || selectedVideo.video_url.includes('embed') ? (
                          <iframe
                            src={selectedVideo.video_url.includes('embed') ? selectedVideo.video_url : selectedVideo.video_url.replace('watch?v=', 'embed/').split('&')[0]}
                            title={selectedVideo.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => {
                              // For iframe videos, we'll mark as completed when user clicks play
                              // This is a simple approach - you might want to use YouTube API for better tracking
                            }}
                          />
                        ) : (
                          <video
                            ref={videoRef}
                            src={selectedVideo.video_url}
                            controls
                            className="w-full h-full"
                            onEnded={() => markVideoAsCompleted(selectedVideo.id)}
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
                          <span className={`text-lg font-semibold mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-100'
                          }`}>
                            Video Player
                          </span>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-300'
                          }`}>
                            No video URL provided
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className={`rounded-xl shadow-lg p-6 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <h2 className={`text-2xl font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedVideo.title}
                    </h2>
                    {selectedVideo.description && (
                      <p className={`mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {selectedVideo.description}
                      </p>
                    )}
                    {videoWatched.has(selectedVideo.id) ? (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode 
                          ? 'bg-green-900/30 border border-green-700' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <p className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}>
                          <span>✅</span>
                          <span className="font-semibold">This lecture has been completed</span>
                        </p>
                      </div>
                    ) : (
                      selectedVideo.video_url && (selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') || selectedVideo.video_url.includes('embed')) && (
                        <button
                          onClick={() => markVideoAsCompleted(selectedVideo.id)}
                          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                            isDarkMode
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          ✅ Mark as Complete
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center min-h-[60vh] ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Lectures Not Available
                  </h2>
                  <p className="text-center max-w-md">
                    The admin hasn't uploaded any lectures for this course yet. 
                    Please check back later or contact the administration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
