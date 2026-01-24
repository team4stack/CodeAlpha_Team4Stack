'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'

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
  name?: string
  title?: string
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

type StudentProgress = {
  userId: string
  userName: string
  userEmail: string
  rollNumber?: string
  cnic?: string
  enrolledCourses: {
    courseId: string
    courseName: string
    totalVideos: number
    completedVideos: number
    progressPercentage: number
  }[]
  totalCourses: number
  totalVideosCompleted: number
}

type StudentListItem = {
  userId: string
  userName: string
  userEmail: string
  rollNumber: string
  cnic?: string
  totalCourses: number
  totalVideosCompleted: number
  overallProgress: number
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
  const [filterProgress, setFilterProgress] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [summary, setSummary] = useState<ProgressSummary[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [studentList, setStudentList] = useState<StudentListItem[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load courses via API
      const coursesResult = await coursesApi.getAllCourses()
      if (coursesResult.error) throw new Error(coursesResult.error)
      const coursesData = coursesResult.data || []
      // Map to only id and title for this component
      setCourses(coursesData.map((c: any) => ({ id: c.id, title: c.title || c.name })))

      // Load progress records via API
      const progressResult = await coursesApi.getAllProgress(
        filterCourse !== 'all' ? { courseId: filterCourse } : undefined
      )
      if (progressResult.error) throw new Error(progressResult.error)
      setProgressRecords(progressResult.data || [])
      const progressData = progressResult.data || []

      // Load users via API
      const userIds = [...new Set(progressData?.map((p: ProgressRecord) => p.user_id) || [])]
      if (userIds.length > 0) {
        const { usersApi } = await import('@/lib/api');
        const usersResult = await Promise.all(
          userIds.map(async (userId) => {
            const result = await usersApi.getUserById(userId);
            return result.data;
          })
        );
        const usersData = usersResult.filter(Boolean) as User[];
        
        const usersMap: Record<string, User> = {}
        usersData.forEach((user: User) => {
          usersMap[user.id] = user
        })
        setUsers(usersMap)
      }

      // Calculate summary (disabled - only students view available)
      if (false && coursesData) {
        const summaryData: ProgressSummary[] = coursesData.map((course) => {
          const courseProgress = progressData?.filter((p: ProgressRecord) => p.course_id === course.id) || []
          const uniqueStudents = new Set(courseProgress.map((p: ProgressRecord) => p.user_id))
          const completedProgress = courseProgress.filter((p: ProgressRecord) => p.completed)
          const scores = completedProgress.map((p: ProgressRecord) => p.score || 0).filter(s => s > 0)
          const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

          return {
            courseId: course.id,
            courseName: course.title || course.name || 'Unknown Course',
            totalStudents: uniqueStudents.size,
            completedStudents: new Set(completedProgress.map((p: ProgressRecord) => p.user_id)).size,
            averageScore: Math.round(averageScore * 10) / 10,
            totalProgress: courseProgress.length
          }
        })
        setSummary(summaryData)
      }

      // Calculate student-wise progress (always show students view)
      // Load all students with approved courses from admission_form via API
      {
        const { coursesApi } = await import('@/lib/api');
        const allAppsResult = await coursesApi.getAdmissionForms();
        
        if (allAppsResult.error) {
          throw new Error(allAppsResult.error);
        }
        
        const allAppsData = allAppsResult.data || [];
        // Filter approved applications (old system: approved=true, new system: approved_1=true or approved_2=true)
        const allApps = allAppsData.filter((app: any) => 
          app.approved === true || app.approved_1 === true || app.approved_2 === true
        ).map((app: any) => ({
          id: app.id,
          email: app.email,
          course_name: app.course_name,
          course_name_2: app.course_name_2,
          approved: app.approved,
          approved_1: app.approved_1,
          approved_2: app.approved_2,
          roll_number: app.roll_number,
          cnic: app.cnic
        }));
        const uniqueAppsMap = new Map()
        allApps.forEach((app: any) => {
          if (!uniqueAppsMap.has(app.id)) {
            uniqueAppsMap.set(app.id, app)
          } else {
            // Merge data if same id exists (for cases where both approved_1 and approved_2 are true)
            const existing = uniqueAppsMap.get(app.id)
            uniqueAppsMap.set(app.id, {
              ...existing,
              approved_1: existing.approved_1 || app.approved_1,
              approved_2: existing.approved_2 || app.approved_2,
              course_name_2: existing.course_name_2 || app.course_name_2
            })
          }
        })
        const applicationsData = Array.from(uniqueAppsMap.values())

        // Get all unique user emails who have approved courses
        const studentEmails = new Set<string>()
        const studentEnrollments: Record<string, Set<string>> = {} // email -> Set of course names

        applicationsData?.forEach((app: any) => {
            if (!app.email) return
            
            const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
            
            if (hasNewApprovals) {
              // New system: check per-course approvals
              if (app.course_name?.trim() && app.approved_1 === true) {
                studentEmails.add(app.email.toLowerCase().trim())
                if (!studentEnrollments[app.email.toLowerCase().trim()]) {
                  studentEnrollments[app.email.toLowerCase().trim()] = new Set()
                }
                studentEnrollments[app.email.toLowerCase().trim()].add(app.course_name.trim())
              }
              if (app.course_name_2?.trim() && app.approved_2 === true) {
                studentEmails.add(app.email.toLowerCase().trim())
                if (!studentEnrollments[app.email.toLowerCase().trim()]) {
                  studentEnrollments[app.email.toLowerCase().trim()] = new Set()
                }
                studentEnrollments[app.email.toLowerCase().trim()].add(app.course_name_2.trim())
              }
            } else {
              // Old system
              if (app.approved === true && app.course_name?.trim()) {
                studentEmails.add(app.email.toLowerCase().trim())
                if (!studentEnrollments[app.email.toLowerCase().trim()]) {
                  studentEnrollments[app.email.toLowerCase().trim()] = new Set()
                }
                studentEnrollments[app.email.toLowerCase().trim()].add(app.course_name.trim())
              }
            }
          })

          // Get user IDs for these emails via API
          const { usersApi } = await import('@/lib/api');
          const usersResult = await Promise.all(
            Array.from(studentEmails).map(async (email) => {
              const result = await usersApi.getUserByEmail(email);
              return result.data;
            })
          );
          const usersData = usersResult.filter(Boolean);

          // Get video counts per course via API - get videos for all courses
          const videosByCourse: Record<string, number> = {}
          const videosPromises = coursesData.map(async (course: any) => {
            const videosResult = await coursesApi.getCourseVideos(parseInt(course.id));
            return videosResult.data || [];
          });
          const allVideosArrays = await Promise.all(videosPromises);
          const videosData = allVideosArrays.flat();
          
          videosData.forEach((video: any) => {
            if (video.course_id) {
              const courseId = String(video.course_id)
              videosByCourse[courseId] = (videosByCourse[courseId] || 0) + 1
            }
          })

          // Extract CNIC numbers from applications (do this early, before roll number generation)
          // CNIC is mandatory, so it should always be present
          const cnicMap: Record<string, string> = {} // email -> cnic
          applicationsData?.forEach((app: any) => {
            if (app.email) {
              const userEmail = app.email.toLowerCase().trim()
              // Use CNIC from application if available, keep first one found
              if (app.cnic && !cnicMap[userEmail]) {
                cnicMap[userEmail] = app.cnic
              }
            }
          })

          // Generate roll numbers for each student per course
          // Roll number format: T4S-{courseId}-{sequence}
          const rollNumberMap: Record<string, Record<string, string>> = {} // email -> courseId -> rollNumber
          const courseSequenceCount: Record<string, number> = {} // courseId -> count
          const processedStudentCourses: Set<string> = new Set() // email-courseId combination
          
          // Collect all approved courses first, then generate roll numbers
          const approvedCourseList: Array<{ email: string; courseId: string; appId: string }> = []
          
          applicationsData?.forEach((app: any) => {
              if (!app.email) return
              const userEmail = app.email.toLowerCase().trim()
              
              const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
              
              if (hasNewApprovals) {
                if (app.course_name?.trim() && app.approved_1 === true) {
                  const course = coursesData?.find(
                    c => (c.title || c.name || '').toLowerCase().trim() === app.course_name.toLowerCase().trim()
                  )
                  if (course) {
                    approvedCourseList.push({ email: userEmail, courseId: String(course.id), appId: String(app.id) })
                  }
                }
                if (app.course_name_2?.trim() && app.approved_2 === true) {
                  const course = coursesData?.find(
                    c => (c.title || c.name || '').toLowerCase().trim() === app.course_name_2.toLowerCase().trim()
                  )
                  if (course) {
                    approvedCourseList.push({ email: userEmail, courseId: String(course.id), appId: String(app.id) })
                  }
                }
              } else {
                if (app.approved === true && app.course_name?.trim()) {
                  const course = coursesData?.find(
                    c => (c.title || c.name || '').toLowerCase().trim() === app.course_name.toLowerCase().trim()
                  )
                  if (course) {
                    approvedCourseList.push({ email: userEmail, courseId: String(course.id), appId: String(app.id) })
                  }
                }
              }
          })
          
          // Generate roll numbers for each unique student-course combination
          approvedCourseList.forEach(({ email, courseId, appId }) => {
            const key = `${email}-${courseId}`
            
            if (!processedStudentCourses.has(key)) {
              processedStudentCourses.add(key)
              
              if (!rollNumberMap[email]) {
                rollNumberMap[email] = {}
              }
              
              // Initialize sequence count for this course if not exists
              if (!courseSequenceCount[courseId]) {
                courseSequenceCount[courseId] = 0
              }
              
              // Generate roll number if not already exists
              if (!rollNumberMap[email][courseId]) {
                courseSequenceCount[courseId]++
                const sequence = String(courseSequenceCount[courseId]).padStart(3, '0')
                rollNumberMap[email][courseId] = `T4S-${courseId}-${sequence}`
                
                // Save roll number to database via API (update the application)
                coursesApi.updateAdmissionForm(appId, { roll_number: rollNumberMap[email][courseId] })
                  .then(() => {})
                  .catch(() => {})
              }
            }
          })

          // Build student progress data
          const studentProgressData: StudentProgress[] = (usersData || []).map((user: User) => {
            const userEmail = (user.email || '').toLowerCase().trim()
            const enrolledCourseNames = Array.from(studentEnrollments[userEmail] || [])
            
            // Find course IDs for enrolled course names
            const enrolledCourses = enrolledCourseNames.map((courseName) => {
              const course = coursesData?.find(
                c => (c.title || c.name || '').toLowerCase().trim() === courseName.toLowerCase().trim()
              )
              return course ? { courseId: course.id, courseName: course.title || course.name || courseName } : null
            }).filter(Boolean) as { courseId: string; courseName: string }[]
            
            // Get roll number (use first enrolled course's roll number as primary)
            const primaryRollNumber = enrolledCourses.length > 0 
              ? rollNumberMap[userEmail]?.[String(enrolledCourses[0].courseId)] 
              : undefined
            
            // Get CNIC number
            const studentCnic = cnicMap[userEmail] || undefined

            // Calculate progress for each enrolled course
            const courseProgress = enrolledCourses.map(({ courseId, courseName }) => {
              // Ensure courseId is string for comparison
              const courseIdStr = String(courseId)
              const totalVideos = videosByCourse[courseIdStr] || 0
              
              // Filter progress records - match both course_id and user_id, and completed status
              // Note: video_id should not be null for completed videos
              const courseProgressRecords = progressData?.filter(
                (p: ProgressRecord) => {
                  const pCourseId = String(p.course_id)
                  const pUserId = String(p.user_id)
                  const uId = String(user.id)
                  // Match course_id, user_id, completed=true, and video_id exists
                  return pCourseId === courseIdStr && pUserId === uId && p.completed === true && p.video_id != null
                }
              ) || []
              
              const completedVideos = courseProgressRecords.length
              const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

              // Debug logging (can be removed later)
              if (completedVideos > 0 || totalVideos > 0) {
                console.log(`Progress for ${user.email} - ${courseName}:`, {
                  courseId: courseIdStr,
                  totalVideos,
                  completedVideos,
                  progressPercentage,
                  progressRecordsCount: courseProgressRecords.length,
                  allProgressForCourse: progressData?.filter((p: ProgressRecord) => String(p.course_id) === courseIdStr).length
                })
              }

              return {
                courseId,
                courseName,
                totalVideos,
                completedVideos,
                progressPercentage
              }
            })

            const totalVideosCompleted = courseProgress.reduce((sum, cp) => sum + cp.completedVideos, 0)
            const totalVideos = courseProgress.reduce((sum, cp) => sum + cp.totalVideos, 0)
            const overallProgress = totalVideos > 0 ? Math.round((totalVideosCompleted / totalVideos) * 100) : 0

            return {
              userId: user.id,
              userName: user.name || 'Unknown',
              userEmail: user.email || 'No email',
              rollNumber: primaryRollNumber,
              cnic: studentCnic,
              enrolledCourses: courseProgress,
              totalCourses: enrolledCourses.length,
              totalVideosCompleted
            }
          }).filter(sp => sp.totalCourses > 0) // Only show students with enrolled courses

          // Sort by total videos completed (descending)
          studentProgressData.sort((a, b) => b.totalVideosCompleted - a.totalVideosCompleted)
          setStudentProgress(studentProgressData)
          
          // Create student list for list view
          const listData: StudentListItem[] = studentProgressData.map((sp) => {
            const totalVideos = sp.enrolledCourses.reduce((sum, cp) => sum + cp.totalVideos, 0)
            const overallProgress = totalVideos > 0 ? Math.round((sp.totalVideosCompleted / totalVideos) * 100) : 0
            
            return {
              userId: sp.userId,
              userName: sp.userName,
              userEmail: sp.userEmail,
              rollNumber: sp.rollNumber || 'N/A',
              totalCourses: sp.totalCourses,
              totalVideosCompleted: sp.totalVideosCompleted,
              overallProgress
            }
          })
          // Sort by roll number for better organization
          listData.sort((a, b) => {
            if (a.rollNumber === 'N/A' && b.rollNumber !== 'N/A') return 1
            if (a.rollNumber !== 'N/A' && b.rollNumber === 'N/A') return -1
            return a.rollNumber.localeCompare(b.rollNumber)
          })
          setStudentList(listData)
      }
    } catch (err: any) {
      setError('Failed to load progress data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterCourse, filterProgress])

  useEffect(() => {
    loadData()
    // Note: Real-time subscriptions removed - using backend API with polling if needed
  }, [loadData])

  const getUserInfo = (userId: string) => {
    const user = users[userId]
    return user ? {
      name: user.name || 'Unknown',
      email: user.email || 'No email'
    } : { name: 'Unknown User', email: 'No email' }
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course?.title || course?.name || 'Unknown Course'
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
              onChange={(e) => setFilterProgress(e.target.value as 'all' | 'high' | 'medium' | 'low')}
              className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all text-sm min-w-[150px]"
            >
              <option value="all" className="bg-gray-800">All Progress</option>
              <option value="high" className="bg-gray-800">High (≥80%)</option>
              <option value="medium" className="bg-gray-800">Medium (50-79%)</option>
              <option value="low" className="bg-gray-800">Low (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Students View - List Format */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      CNIC
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Courses
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Videos Completed
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Overall Progress
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-black text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {studentList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-white/60 font-semibold">
                        {loading ? 'Loading students...' : 'No students found'}
                      </td>
                    </tr>
                  ) : (
                    studentList
                      .filter((student) => {
                        // Search filter
                        if (searchQuery.trim()) {
                          const searchLower = searchQuery.toLowerCase()
                          const matchesSearch = (
                            student.rollNumber.toLowerCase().includes(searchLower) ||
                            student.userName.toLowerCase().includes(searchLower) ||
                            student.userEmail.toLowerCase().includes(searchLower)
                          )
                          if (!matchesSearch) return false
                        }
                        
                        // Course filter
                        if (filterCourse !== 'all') {
                          const fullProgress = studentProgress.find(sp => sp.userId === student.userId)
                          const hasCourse = fullProgress?.enrolledCourses.some(
                            ec => String(ec.courseId) === filterCourse
                          )
                          if (!hasCourse) return false
                        }
                        
                        // Progress filter
                        if (filterProgress !== 'all') {
                          if (filterProgress === 'high' && student.overallProgress < 80) return false
                          if (filterProgress === 'medium' && (student.overallProgress < 50 || student.overallProgress >= 80)) return false
                          if (filterProgress === 'low' && student.overallProgress >= 50) return false
                        }
                        
                        return true
                      })
                      .map((student) => {
                        const fullProgress = studentProgress.find(sp => sp.userId === student.userId)
                        return (
                          <tr key={student.userId} className="hover:bg-white/10 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-black text-purple-300">{student.rollNumber}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs font-black text-white">
                                  {student.userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-bold text-white">{student.userName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-bold text-purple-300">{student.cnic || '-'}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-white/70">{student.userEmail}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-bold text-white">{student.totalCourses}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-bold text-green-400">{student.totalVideosCompleted}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden min-w-[100px]">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      student.overallProgress === 100
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                        : student.overallProgress >= 50
                                        ? 'bg-gradient-to-r from-orange-400 to-red-400'
                                        : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                    }`}
                                    style={{ width: `${student.overallProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-black text-white min-w-[45px]">
                                  {student.overallProgress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={() => {
                                  setSelectedStudent(fullProgress || null)
                                  setShowStudentModal(true)
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white rounded-lg hover:shadow-lg transition-all text-xs font-bold border border-white/20"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-black text-white">
                    {selectedStudent.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedStudent.userName}</h2>
                    <p className="text-sm text-white/60">{selectedStudent.userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStudentModal(false)
                    setSelectedStudent(null)
                  }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Roll Number</div>
                    <div className="text-lg font-black text-purple-300">{selectedStudent.rollNumber || 'N/A'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">CNIC Number</div>
                    <div className="text-lg font-black text-purple-300 break-all font-mono">{selectedStudent.cnic || '-'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Total Courses</div>
                    <div className="text-lg font-black text-white">{selectedStudent.totalCourses}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Videos Completed</div>
                    <div className="text-lg font-black text-green-400">{selectedStudent.totalVideosCompleted}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2">
                    <div className="text-xs text-white/60 mb-1">Email</div>
                    <div className="text-sm font-bold text-white/80 truncate">{selectedStudent.userEmail}</div>
                  </div>
                </div>

                {/* Course Progress */}
                <div>
                  <h3 className="text-lg font-black text-white mb-3">Course Progress</h3>
                  <div className="space-y-3">
                    {selectedStudent.enrolledCourses.map((course) => (
                      <div
                        key={course.courseId}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white">{course.courseName}</h4>
                          <span className="text-sm font-black text-white/80">
                            {course.completedVideos} / {course.totalVideos} Videos
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                course.progressPercentage === 100
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                  : course.progressPercentage >= 50
                                  ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                                  : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                              }`}
                              style={{ width: `${course.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-black text-white min-w-[50px] text-right">
                            {course.progressPercentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary View - Removed */}
        {false && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summary.map((item) => (
              <div
                key={item.courseId}
                className="relative group overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 text-white">{item.courseName}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-white/70 font-bold">Total Students:</span>
                      <span className="font-black text-white text-xl">{item.totalStudents}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-white/70 font-bold">Completed:</span>
                      <span className="font-black text-green-400 text-xl">{item.completedStudents}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-white/70 font-bold">Completion Rate:</span>
                      <span className="font-black text-white text-xl">
                        {item.totalStudents > 0
                          ? Math.round((item.completedStudents / item.totalStudents) * 100)
                          : 0}%
                      </span>
                    </div>
                    {item.averageScore > 0 && (
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                        <span className="text-white/70 font-bold">Average Score:</span>
                        <span className="font-black text-purple-400 text-xl">{item.averageScore}</span>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-1000 shadow-lg"
                          style={{
                            width: `${item.totalStudents > 0 ? (item.completedStudents / item.totalStudents) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed View - Removed */}
        {false && (
          <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/60 font-bold">
                        {loading ? 'Loading...' : 'No progress records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const userInfo = getUserInfo(record.user_id)
                      return (
                        <tr key={record.id} className="hover:bg-white/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-white">{userInfo.name}</div>
                            <div className="text-xs text-white/60">{userInfo.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                            {getCourseName(record.course_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full ${
                                record.completed
                                  ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                                  : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                              }`}
                            >
                              {record.completed ? '✅ Completed' : '⏳ In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-white">
                            {record.score !== null && record.score !== undefined ? `${record.score}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
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
    </div>
  )
}

export default StudentProgressPage
