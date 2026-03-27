'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StudentProgressTable from './student-progress/components/StudentProgressTable'
import { loadStudentProgressData } from './student-progress/loadStudentProgressData'
import type {
  Course,
  ProgressFilter,
  ProgressRecord,
  StudentListItem,
  StudentProgress
} from './student-progress/types'

const StudentProgressPage: React.FC = () => {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterProgress, setFilterProgress] = useState<ProgressFilter>('all')
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [studentList, setStudentList] = useState<StudentListItem[]>([])
  const [newSubmissionCount, setNewSubmissionCount] = useState(0)
  const router = useRouter()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { courses, progressRecords, studentProgress, studentList, newSubmissionCount } =
        await loadStudentProgressData(filterCourse)

      setCourses(courses)
      setProgressRecords(progressRecords)
      setStudentProgress(studentProgress)
      setStudentList(studentList)
      setNewSubmissionCount(newSubmissionCount)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load progress data: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [filterCourse])

  useEffect(() => {
    loadData()
    // Note: Real-time subscriptions removed - using backend API with polling if needed
  }, [loadData])

  if (loading && progressRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 opacity-50" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-4">

        {/* Error Message */}
        {error && (
          <div className="relative bg-red-500/20 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-5 shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">⚠️</span>
              <p className="text-red-200 font-bold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Filters with Glassmorphism */}
        <div className="relative bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search by Roll Number, Name, or Email */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">🔍</div>
              <input
                type="text"
                placeholder="Search by roll number, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all text-sm"
              />
            </div>

            {/* Course Filter */}
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all text-sm min-w-[180px]"
            >
              <option value="all" className="bg-gray-800">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-gray-800">
                  {course.title || course.name || `Course ${course.id}`}
                </option>
              ))}
            </select>

            {/* Progress Filter */}
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value as ProgressFilter)}
              className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all text-sm min-w-[150px]"
            >
              <option value="all" className="bg-gray-800">All Progress</option>
              <option value="high" className="bg-gray-800">High (≥80%)</option>
              <option value="medium" className="bg-gray-800">Medium (50-79%)</option>
              <option value="low" className="bg-gray-800">Low (&lt;50%)</option>
            </select>

            <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90">
              <span className="text-white/70">New Submissions</span>
              <span
                className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-black ${
                  newSubmissionCount > 0 ? 'bg-rose-500/80 text-white' : 'bg-white/20 text-white/70'
                }`}
              >
                {newSubmissionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Students View - List Format */}
        <StudentProgressTable
          loading={loading}
          searchQuery={searchQuery}
          filterCourse={filterCourse}
          filterProgress={filterProgress}
          studentList={studentList}
          studentProgress={studentProgress}
          onViewDetails={(student) => {
            if (!student?.userId) return
            router.push(`/admincourset4s/progress/student?userId=${student.userId}`)
          }}
        />
      </div>
    </div>
  )
}

export default StudentProgressPage
