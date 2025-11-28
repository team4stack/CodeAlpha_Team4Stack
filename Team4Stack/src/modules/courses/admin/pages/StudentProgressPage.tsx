import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../../utils/supabaseClient'
import { useTheme } from '../../../../context/ThemeContext'

type ProgressRecord = {
  id: string
  user_id: string
  course_id: string
  video_id?: string
  completed: boolean
  score?: number
  created_at: string
  updated_at?: string
}

type Course = {
  id: string
  name: string
}

type User = {
  id: string
  email: string | null
  name: string | null
}

type ProgressSummary = {
  courseId: string
  courseName: string
  totalStudents: number
  completedStudents: number
  averageScore: number
  totalProgress: number
}

const StudentProgressPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all')
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('summary')
  const [summary, setSummary] = useState<ProgressSummary[]>([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name')
        .order('name', { ascending: true })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Load progress records
      let query = supabase
        .from('progress_records')
        .select('*')

      if (filterCourse !== 'all') {
        query = query.eq('course_id', filterCourse)
      }

      if (filterStatus === 'completed') {
        query = query.eq('completed', true)
      } else if (filterStatus === 'incomplete') {
        query = query.eq('completed', false)
      }

      const { data: progressData, error: progressError } = await query
        .order('created_at', { ascending: false })

      if (progressError) throw progressError
      setProgressRecords(progressData || [])

      // Load users
      const userIds = [...new Set(progressData?.map((p: ProgressRecord) => p.user_id) || [])]
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, name')
          .in('id', userIds)

        if (usersError) throw usersError
        const usersMap: Record<string, User> = {}
        usersData?.forEach((user: User) => {
          usersMap[user.id] = user
        })
        setUsers(usersMap)
      }

      // Calculate summary
      if (viewMode === 'summary' && coursesData) {
        const summaryData: ProgressSummary[] = coursesData.map((course) => {
          const courseProgress = progressData?.filter((p: ProgressRecord) => p.course_id === course.id) || []
          const uniqueStudents = new Set(courseProgress.map((p: ProgressRecord) => p.user_id))
          const completedProgress = courseProgress.filter((p: ProgressRecord) => p.completed)
          const scores = completedProgress.map((p: ProgressRecord) => p.score || 0).filter(s => s > 0)
          const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

          return {
            courseId: course.id,
            courseName: course.name,
            totalStudents: uniqueStudents.size,
            completedStudents: new Set(completedProgress.map((p: ProgressRecord) => p.user_id)).size,
            averageScore: Math.round(averageScore * 10) / 10,
            totalProgress: courseProgress.length
          }
        })
        setSummary(summaryData)
      }
    } catch (err: any) {
      setError('Failed to load progress data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterCourse, filterStatus, viewMode])

  useEffect(() => {
    loadData()

    // Real-time subscription
    const channel = supabase
      .channel('progress_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_records' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const getUserInfo = (userId: string) => {
    const user = users[userId]
    return user ? {
      name: user.name || 'Unknown',
      email: user.email || 'No email'
    } : { name: 'Unknown User', email: 'No email' }
  }

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course'
  }

  const filteredRecords = progressRecords.filter((record) => {
    if (!searchQuery.trim()) return true
    const userInfo = getUserInfo(record.user_id)
    const courseName = getCourseName(record.course_id)
    const searchLower = searchQuery.toLowerCase()
    return (
      userInfo.name.toLowerCase().includes(searchLower) ||
      userInfo.email.toLowerCase().includes(searchLower) ||
      courseName.toLowerCase().includes(searchLower)
    )
  })

  if (loading && progressRecords.length === 0) {
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
        <h1 className="text-3xl font-bold mb-2">📊 Student Progress</h1>
        <p className="text-white/90">Track and monitor student progress across all courses</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Filters and View Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
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
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'incomplete')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                viewMode === 'summary'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.map((item) => (
            <div
              key={item.courseId}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{item.courseName}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{item.completedStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.totalStudents > 0
                      ? Math.round((item.completedStudents / item.totalStudents) * 100)
                      : 0}%
                  </span>
                </div>
                {item.averageScore > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Score:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.averageScore}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Progress Records:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.totalProgress}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${item.totalStudents > 0 ? (item.completedStudents / item.totalStudents) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {loading ? 'Loading...' : 'No progress records found'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const userInfo = getUserInfo(record.user_id)
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{userInfo.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getCourseName(record.course_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.completed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {record.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {record.score !== null && record.score !== undefined ? `${record.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.updated_at || record.created_at).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProgressPage

