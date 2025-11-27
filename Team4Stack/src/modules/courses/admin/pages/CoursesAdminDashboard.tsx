import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { supabase } from '../../../../utils/supabaseClient';

interface Course {
  id: string;
  name: string;
  description?: string;
}

interface Video {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  order: number;
}

interface ProgressRecord {
  id: string;
  completed: boolean;
  score?: number;
  course_id: string;
  video_id: string;
  user_id: string;
  users?: { name: string; email: string };
  courses?: { name: string };
  videos?: { title: string };
}

const defaultVideoForm = {
  course_id: '',
  title: '',
  description: '',
  video_url: '',
  order: 1,
};

const CoursesAdminPanel: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoForm, setVideoForm] = useState(defaultVideoForm);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [status, setStatus] = useState<{ message: string | null; variant: string }>({ message: null, variant: 'success' });

  const showStatus = useCallback((message: string, variant: string = 'success') => {
    setStatus({ message, variant });
    setTimeout(() => setStatus({ message: null, variant: 'success' }), 4000);
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('[CoursesAdminPanel] Failed to fetch courses', error);
      return [];
    }
  }, []);

  const fetchVideos = useCallback(async (courseId: string) => {
    if (!courseId) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('course_id', courseId)
        .order('order');
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('[CoursesAdminPanel] Failed to fetch videos', error);
      return [];
    }
  }, []);

  const fetchProgressRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('progress_records')
        .select(`
          *,
          users:user_id (name, email),
          courses:course_id (name),
          videos:video_id (title)
        `);
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('[CoursesAdminPanel] Failed to fetch progress records', error);
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initialise = async () => {
      try {
        const fetchedCourses = await fetchCourses();
        setCourses(fetchedCourses);
        
        if (fetchedCourses.length > 0) {
          setVideoForm(prev => ({ ...prev, course_id: fetchedCourses[0].id }));
          const fetchedVideos = await fetchVideos(fetchedCourses[0].id);
          if (fetchedVideos.length > 0) {
            setVideos(fetchedVideos);
          }
        }
        
        // Fetch progress records
        const fetchedProgress = await fetchProgressRecords();
        setProgressRecords(fetchedProgress);
        
        showStatus('Admin panel loaded successfully.');
      } catch (error: any) {
        console.error('[CoursesAdminPanel] Initial load failed', error);
        if (isMounted) {
          showStatus(`Unable to load admin data: ${error.message}`, 'danger');
        }
      }
    };
    initialise();
    return () => {
      isMounted = false;
    };
  }, [fetchCourses, fetchVideos, fetchProgressRecords, showStatus]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setVideoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVideo = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (!videoForm.course_id) {
        showStatus('No valid course found. Please refresh the page.', 'danger');
        return;
      }
      
      const { data, error } = await supabase
        .from('videos')
        .insert([
          {
            ...videoForm,
            course_id: videoForm.course_id,
            order: Number(videoForm.order) || 1,
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('[CoursesAdminPanel] Supabase error details:', error);
        if (error.message.includes('permission') || error.message.includes('authorized') || error.message.includes('denied')) {
          showStatus('Permission denied. Videos can only be added by administrators in production.', 'warning');
        } else {
          showStatus(`Failed to add video: ${error.message}`, 'danger');
        }
        return;
      }
      
      setVideos([...videos, data]);
      showStatus('Video added successfully.');
      setVideoForm({ ...defaultVideoForm, course_id: videoForm.course_id });
    } catch (error: any) {
      console.error('[CoursesAdminPanel] Failed to add video', error);
      showStatus(`Failed to add video: ${error.message || 'Please try again.'}`, 'danger');
    }
  };

  const handleApproveProgress = async (record: ProgressRecord) => {
    try {
      const { error } = await supabase
        .from('progress_records')
        .update({ completed: true })
        .eq('id', record.id);
        
      if (error) throw error;
      
      setProgressRecords(prev => 
        prev.map(item => 
          item.id === record.id ? { ...item, completed: true } : item
        )
      );
      showStatus('Progress approved.');
    } catch (error: any) {
      console.error('[CoursesAdminPanel] Failed to approve progress', error);
      showStatus(`Failed to approve: ${error.message}`, 'danger');
    }
  };

  const pendingProgress = useMemo(
    () => progressRecords.filter((record) => record.completed === false),
    [progressRecords]
  );

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Courses Admin Panel
          </h1>
        </div>

        {status.message && (
          <div className={`rounded-lg p-4 mb-6 ${
            status.variant === 'danger'
              ? isDarkMode
                ? 'bg-red-900/30 text-red-300 border border-red-700'
                : 'bg-red-100 text-red-700 border border-red-300'
              : status.variant === 'warning'
              ? isDarkMode
                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              : isDarkMode
              ? 'bg-green-900/30 text-green-300 border border-green-700'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-xl shadow-lg p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Add Course Video
            </h2>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Video Title
                </label>
                <input
                  name="title"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={videoForm.title}
                  onChange={handleVideoChange}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  name="description"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  rows={2}
                  value={videoForm.description}
                  onChange={handleVideoChange}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Video URL
                </label>
                <input
                  name="video_url"
                  type="url"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  placeholder="https://youtube.com/embed/..."
                  value={videoForm.video_url}
                  onChange={handleVideoChange}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Order
                </label>
                <input
                  name="order"
                  type="number"
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-300'
                  }`}
                  value={videoForm.order}
                  onChange={handleVideoChange}
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Save Video
              </button>
            </form>
          </div>

          <div className={`rounded-xl shadow-lg p-6 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Pending Approvals
            </h2>
            <div className="overflow-x-auto">
              <table className={`w-full ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className="text-left py-2 px-2">Student</th>
                    <th className="text-left py-2 px-2">Course</th>
                    <th className="text-left py-2 px-2">Video</th>
                    <th className="text-left py-2 px-2">Score</th>
                    <th className="text-right py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProgress.map((record) => (
                    <tr key={record.id} className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <td className="py-2 px-2">
                        <div className="font-semibold">{record.users?.name || 'N/A'}</div>
                        <div className="text-sm opacity-75">{record.users?.email || ''}</div>
                      </td>
                      <td className="py-2 px-2">{record.courses?.name || 'N/A'}</td>
                      <td className="py-2 px-2">{record.videos?.title || 'N/A'}</td>
                      <td className="py-2 px-2">{record.score ?? 'N/A'}</td>
                      <td className="py-2 px-2 text-right">
                        <button
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                          onClick={() => handleApproveProgress(record)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingProgress.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`text-center py-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No pending approvals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesAdminPanel;

