'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'
import toast from 'react-hot-toast'

type Video = {
  id: string
  course_id: string
  title: string
  description?: string
  video_url?: string
  order: number
  order_index?: number
  created_at?: string
  updated_at?: string
}

type Course = {
  id: string
  title?: string
}

const VideosManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [videos, setVideos] = useState<Video[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState<{
    course_id: string;
    title: string;
    description: string;
    video_url: string;
    order: number;
    order_index: number;
  }>({
    course_id: '',
    title: '',
    description: '',
    video_url: '',
    order: 0,
    order_index: 0
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load courses - show all courses (title or name)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .order('order_index', { ascending: true })
        .order('id', { ascending: false })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Load videos
      let query = supabase
        .from('videos')
        .select('*')

      if (filterCourse !== 'all') {
        query = query.eq('course_id', filterCourse)
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data: videosData, error: videosError } = await query
        .order('order_index', { ascending: true })
        .order('id', { ascending: false })

      if (videosError) throw videosError
      setVideos(videosData || [])
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterCourse])

  useEffect(() => {
    loadData()

    // Real-time subscription
    const channel = supabase
      .channel('videos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const handleAdd = () => {
    setEditingVideo(null)
    // Get max order_index for the selected course
    const maxOrder = filterCourse !== 'all' 
      ? videos.filter(v => v.course_id === filterCourse).reduce((max, v) => Math.max(max, (v.order_index || v.order || 0)), 0)
      : videos.reduce((max, v) => Math.max(max, (v.order_index || v.order || 0)), 0)
    
    setFormData({
      course_id: filterCourse !== 'all' ? filterCourse : '',
      title: '',
      description: '',
      video_url: '',
      order: maxOrder + 1,
      order_index: maxOrder + 1
    })
    setShowAddForm(true)
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      course_id: video.course_id,
      title: video.title,
      description: video.description || '',
      video_url: video.video_url || '',
      order: video.order_index || video.order || 0,
      order_index: video.order_index || video.order || 0
    })
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      setSuccess(null)

      if (editingVideo) {
        // Update existing video
        const { error: updateError } = await supabase
          .from('videos')
          .update({
            course_id: formData.course_id,
            title: formData.title,
            description: formData.description || null,
            video_url: formData.video_url || null,
            order_index: formData.order_index || formData.order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVideo.id)

        if (updateError) throw updateError
        toast.success('Video updated successfully!')
        setSuccess('Video updated successfully!')
      } else {
        // Create new video
        const { error: insertError } = await supabase
          .from('videos')
          .insert({
            course_id: formData.course_id,
            title: formData.title,
            description: formData.description || null,
            video_url: formData.video_url || null,
            order_index: formData.order_index || formData.order
          })

        if (insertError) throw insertError
        toast.success('Video added successfully!')
        setSuccess('Video added successfully!')
      }

      setShowAddForm(false)
      setEditingVideo(null)
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save video'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete video "${videoTitle}"?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (deleteError) throw deleteError

      toast.success('Video deleted successfully!')
      setSuccess('Video deleted successfully!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete video'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? (course.title || `Course ${courseId}`) : 'Unknown Course';
  }

  if (loading && videos.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🎥 Videos Management</h1>
        <p className="text-white/90">Add, edit, and organize course videos</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl p-4">
          {success}
        </div>
      )}

      {/* Filters and Add Button */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search videos by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title || `Course ${course.id}`}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold whitespace-nowrap"
          >
            + Add Video
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course *
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title || `Course ${course.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order/Position *
                </label>
                <input
                  type="number"
                  value={formData.order_index || formData.order}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, order: val, order_index: val });
                  }}
                  required
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="1, 2, 3..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lower numbers appear first
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Video description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video URL *
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                💡 Paste YouTube <strong>individual video</strong> link (watch or youtu.be format). <strong>Playlist URLs are not supported.</strong>
              </p>
              {formData.video_url && (() => {
                const isPlaylist = formData.video_url.includes('playlist?list=') || formData.video_url.includes('/playlist');
                const isYouTube = formData.video_url.includes('youtube.com') || formData.video_url.includes('youtu.be');
                
                if (isPlaylist) {
                  return (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                      ❌ Playlist URLs are not supported. Please use an individual video URL (e.g., https://youtube.com/watch?v=VIDEO_ID)
                    </div>
                  );
                } else if (isYouTube && !isPlaylist) {
                  return (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
                      ✅ Valid YouTube video link detected
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold"
              >
                {editingVideo ? 'Update Video' : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingVideo(null)
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thumbnail
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Video URL
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading...' : 'No videos found'}
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-28 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                        🎥
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{video.title}</div>
                      {video.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {video.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getCourseName(video.course_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {video.order_index || video.order || 0}
                    </td>
                    <td className="px-6 py-4">
                      {video.video_url ? (
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Video
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No URL</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(video)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VideosManagementPage

