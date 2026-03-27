'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AssignmentManagementModal from '../components/AssignmentManagementModal'

const AssignmentManagementPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoIdParam = searchParams.get('videoId') || ''
  const courseIdParam = searchParams.get('courseId') || ''
  const titleParam = searchParams.get('title') || ''
  const videoId = Number.parseInt(videoIdParam, 10)
  const courseId = Number.parseInt(courseIdParam, 10)
  const videoTitle = titleParam ? decodeURIComponent(titleParam) : 'Lecture'

  if (!Number.isFinite(videoId) || videoId <= 0 || !Number.isFinite(courseId) || courseId <= 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Assignment Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Missing or invalid lecture. Please go back and select a video first.
        </p>
        <button
          onClick={() => router.push('/admincourset4s/videos')}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Back to Videos
        </button>
      </div>
    )
  }

  return (
    <AssignmentManagementModal
      isOpen
      variant="page"
      onClose={() => {
        const courseId = courseIdParam ? `?courseId=${encodeURIComponent(courseIdParam)}` : ''
        router.replace(`/admincourset4s/videos${courseId}`)
      }}
      videoId={videoId}
      videoTitle={videoTitle}
      courseId={courseId}
    />
  )
}

export default AssignmentManagementPage
