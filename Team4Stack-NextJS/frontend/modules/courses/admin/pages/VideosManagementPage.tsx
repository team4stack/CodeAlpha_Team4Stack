'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import QuizManagementModal from '../components/QuizManagementModal'
import AssignmentManagementModal from '../components/AssignmentManagementModal'

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
  video_count?: number
}

const VideosManagementPage: React.FC = () => {
  useTheme()
  const [videos, setVideos] = useState<Video[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('') // No default, must select course
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedVideoForQuiz, setSelectedVideoForQuiz] = useState<{ id: number; title: string } | null>(null)
  const [selectedVideoForAssignment, setSelectedVideoForAssignment] = useState<{
    id: number
    title: string
    course_id: number
  } | null>(null)
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

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load courses with video counts via API
      const coursesResult = await coursesApi.getAllCourses()
      if (coursesResult.error) throw new Error(coursesResult.error)
      const coursesData = Array.isArray(coursesResult.data) ? coursesResult.data : []

      // Get video count for each course via API
      const coursesWithCounts = await Promise.all(
        coursesData.map(async (course: any) => {
          const videosResult = await coursesApi.getCourseVideos(Number.parseInt(course.id, 10))
          const videosData = Array.isArray(videosResult.data) ? videosResult.data : []
          const videoCount = videosData.length || 0
          
          return {
            ...course,
            video_count: videoCount
          }
        })
      )

      setCourses(coursesWithCounts)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load courses'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadVideos = useCallback(async () => {
    if (!filterCourse) {
      setVideos([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load videos via API
      const videosResult = await coursesApi.getCourseVideos(Number.parseInt(filterCourse, 10))
      if (videosResult.error) throw new Error(videosResult.error)
      
      let videosData = Array.isArray(videosResult.data) ? videosResult.data : []

      // Filter by search query if provided
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase()
        videosData = videosData.filter((video: any) => 
          video.title?.toLowerCase().includes(searchLower) ||
          video.description?.toLowerCase().includes(searchLower)
        )
      }

      setVideos(videosData)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load videos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterCourse])

  useEffect(() => {
    if (filterCourse) {
      loadVideos()
      return
    }
    loadCourses()
  }, [filterCourse, loadCourses, loadVideos])

  // Note: Real-time subscriptions removed - using backend API

  const handleCourseSelect = (courseId: string) => {
    setFilterCourse(courseId)
    setSearchQuery('') // Reset search when switching courses
    setShowAddForm(false) // Close form if open
  }

  const handleBackToCourses = () => {
    setFilterCourse('')
    setVideos([])
    setShowAddForm(false)
    setEditingVideo(null)
    setSearchQuery('')
  }

  const handleAdd = () => {
    if (!filterCourse) {
      toast.error('Please select a course first to add videos')
      return
    }
    
    setEditingVideo(null)
    // Get max order_index for the selected course
    const maxOrder = videos
      .filter(v => v.course_id === filterCourse)
      .reduce((max, v) => Math.max(max, (v.order_index || v.order || 0)), 0)
    
    setFormData({
      course_id: filterCourse,
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
        // Update existing video via API
        const updateResult = await coursesApi.updateVideo(Number.parseInt(editingVideo.id, 10), {
          course_id: Number.parseInt(formData.course_id, 10),
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
          order_index: formData.order_index || formData.order
        })

        if (updateResult.error) throw new Error(updateResult.error)
        toast.success('Video updated successfully!')
        setSuccess('Video updated successfully!')
      } else {
        // Create new video via API
        const createResult = await coursesApi.createVideo({
          course_id: Number.parseInt(formData.course_id, 10),
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
          order_index: formData.order_index || formData.order
        })

        if (createResult.error) throw new Error(createResult.error)
        toast.success('Video added successfully!')
        setSuccess('Video added successfully!')
      }

      setShowAddForm(false)
      setEditingVideo(null)
      await loadVideos()
      await loadCourses() // Refresh course counts
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save video'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (!globalThis.confirm(`Are you sure you want to delete video "${videoTitle}"?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Delete video via API
      const deleteResult = await coursesApi.deleteVideo(Number.parseInt(videoId, 10))
      if (deleteResult.error) throw new Error(deleteResult.error)

      toast.success('Video deleted successfully!')
      setSuccess('Video deleted successfully!')
      await loadVideos()
      await loadCourses() // Refresh course counts
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete video'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const openAssignmentModal = (video: Video) => {
    setSelectedVideoForAssignment({
      id: Number.parseInt(video.id, 10),
      title: video.title,
      course_id: Number.parseInt(video.course_id, 10)
    })
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? (course.title || `Course ${courseId}`) : 'Unknown Course';
  }

  let videosTableBody: React.ReactNode
  if (loading) {
    videosTableBody = (
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </td>
      </tr>
    )
  } else if (videos.length === 0) {
    videosTableBody = (
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          No videos found for {getCourseName(filterCourse)}. Click "Add Video" to add videos to this course.
        </td>
      </tr>
    )
  } else {
    videosTableBody = videos.map((video) => (
      <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="h-12 w-16 sm:h-16 sm:w-28 bg-linear-to-br from-orange-500 to-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
            🎥
          </div>
        </td>
        <td className="px-3 sm:px-6 py-3 sm:py-4 min-w-0">
          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{video.title}</div>
          {video.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 hidden sm:block">
              {video.description}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
            Order: {video.order_index || video.order || 0}
          </div>
        </td>
        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white hidden md:table-cell">
          {video.order_index || video.order || 0}
        </td>
        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
          {video.video_url ? (
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:underline truncate block max-w-xs"
            >
              View Video
            </a>
          ) : (
            <span className="text-xs sm:text-sm text-gray-400">No URL</span>
          )}
        </td>
        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
          <div className="flex justify-end gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedVideoForQuiz({ id: Number.parseInt(video.id, 10), title: video.title })
                setShowQuizModal(true)
              }}
              className="px-2 sm:px-3 py-1 bg-linear-to-r from-orange-500/90 to-red-500/90 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-xs border border-white/20"
              title="Manage Quiz"
            >
              <span className="hidden sm:inline">Quiz</span>
              <span className="sm:hidden">📝</span>
            </button>
            <button
              onClick={() => openAssignmentModal(video)}
              className="px-2 sm:px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs"
              title="Manage Assignments"
            >
              <span className="hidden sm:inline">Assignment</span>
              <span className="sm:hidden">📎</span>
            </button>
            <button
              onClick={() => handleEdit(video)}
              className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
              title="Edit"
            >
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">✏️</span>
            </button>
            <button
              onClick={() => handleDelete(video.id, video.title)}
              className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
              title="Delete"
            >
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden">🗑️</span>
            </button>
          </div>
        </td>
      </tr>
    ))
  }

  if (loading && !filterCourse && courses.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">🎥 Videos Management</h1>
              <p className="text-white/90 text-xs sm:text-sm truncate">
                {filterCourse ? `Managing videos for: ${getCourseName(filterCourse)}` : 'Select a course to manage videos'}
              </p>
            </div>
            {filterCourse && (
              <button
                onClick={handleBackToCourses}
                className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
              >
                ← Back to Courses
              </button>
            )}
          </div>
        </div>
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

      {/* Course Cards View - Show when no course selected */}
      {!filterCourse && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Select a Course to Manage Videos
          </h2>
          {courses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No courses found. Please add courses first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseSelect(course.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-16 w-16 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      📚
                    </div>
                    <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold">
                      {course.video_count || 0} {course.video_count === 1 ? 'Video' : 'Videos'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title || `Course ${course.id}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to manage videos for this course
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos Management View - Show when course selected */}
      {filterCourse && (
        <>
          {/* Search and Add Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={handleAdd}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-linear-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold whitespace-nowrap text-sm border border-white/20"
              >
                + Add Video
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="video-form-course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course *
                </label>
                <select
                  id="video-form-course"
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                  disabled={!!editingVideo} // Disable if editing (course shouldn't change)
                  className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    editingVideo ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title || `Course ${course.id}`}
                    </option>
                  ))}
                </select>
                {!editingVideo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    💡 Course is pre-selected
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="video-form-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order/Position *
                </label>
                <input
                  id="video-form-order"
                  type="number"
                  value={formData.order_index || formData.order}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10) || 0;
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
              <label htmlFor="video-form-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                id="video-form-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Video title"
              />
            </div>
            <div>
              <label htmlFor="video-form-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="video-form-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Video description"
              />
            </div>
            <div>
              <label htmlFor="video-form-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video URL *
              </label>
              <input
                id="video-form-url"
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

      {/* Videos List - Only show when course is selected */}
      {filterCourse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <span className="hidden sm:inline">Thumbnail</span>
                    <span className="sm:hidden">Thumb</span>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Order
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Video URL
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {videosTableBody}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz Management Modal */}
      {selectedVideoForQuiz && (
        <QuizManagementModal
          isOpen={showQuizModal}
          onClose={() => {
            setShowQuizModal(false)
            setSelectedVideoForQuiz(null)
          }}
          videoId={selectedVideoForQuiz.id}
          videoTitle={selectedVideoForQuiz.title}
        />
      )}

      {selectedVideoForAssignment && (
        <AssignmentManagementModal
          isOpen={Boolean(selectedVideoForAssignment)}
          onClose={() => setSelectedVideoForAssignment(null)}
          videoId={selectedVideoForAssignment.id}
          videoTitle={selectedVideoForAssignment.title}
          courseId={selectedVideoForAssignment.course_id}
        />
      )}
    </div>
  )
}

export default VideosManagementPage

