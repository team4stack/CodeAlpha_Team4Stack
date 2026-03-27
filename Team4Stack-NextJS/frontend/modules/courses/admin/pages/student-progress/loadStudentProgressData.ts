import { coursesApi, usersApi } from '@/lib/api'
import type { ProgressRecord, User } from './types'
import { collectApprovedApplications, getCnicMap, getStudentEnrollments } from './admissionsData'
import { getVideosByCourse } from './courseData'
import { buildStudentList, buildStudentProgress } from './progressBuilders'
import { generateAndPersistRollNumbers } from './rollNumberAssignment'
import { mapCourseOption } from './shared'

type AssignmentSubmissionRow = {
  id: number
  user_id?: string | null
  status?: string | null
}

type CourseReportSummary = {
  quizzes?: { obtained_marks?: number; total_marks?: number }
  assignments?: { obtained_marks?: number; total_marks?: number }
}

export const loadStudentProgressData = async (filterCourse: string) => {
  const coursesResult = await coursesApi.getAllCourses()
  if (coursesResult.error) {
    throw new Error(coursesResult.error)
  }

  const rawCourses = Array.isArray(coursesResult.data) ? coursesResult.data : []
  const courses = rawCourses.map((course) =>
    mapCourseOption(course as { id: string | number; title?: string; name?: string })
  )

  const progressResult = await coursesApi.getAllProgress(filterCourse !== 'all' ? { courseId: filterCourse } : undefined)
  if (progressResult.error) {
    throw new Error(progressResult.error)
  }
  const progressRecords = Array.isArray(progressResult.data) ? (progressResult.data as ProgressRecord[]) : []

  const admissionsResult = await coursesApi.getAdmissionForms()
  if (admissionsResult.error) {
    throw new Error(admissionsResult.error)
  }
  const admissionRows = Array.isArray(admissionsResult.data) ? admissionsResult.data : []
  const approvedApplications = collectApprovedApplications(admissionRows)

  const { studentEmails, studentEnrollments } = getStudentEnrollments(approvedApplications)

  const userResponses = await Promise.all(
    Array.from(studentEmails).map(async (email) => {
      const response = await usersApi.getUserByEmail(email)
      return response.data
    })
  )
  const users = userResponses.filter(Boolean) as User[]

  const videosByCourse = await getVideosByCourse(courses)
  const cnicMap = getCnicMap(approvedApplications)
  const rollNumberMap = generateAndPersistRollNumbers({ applications: approvedApplications, courses })

  const studentProgress = buildStudentProgress({
    users,
    studentEnrollments,
    courses,
    rollNumberMap,
    cnicMap,
    videosByCourse,
    progressRecords
  })

  const avatarByUserId: Record<string, string | null> = {}
  users.forEach((user) => {
    avatarByUserId[String(user.id)] = user.avatar_url || null
  })

  const submissionsResult = await coursesApi.getAssignmentSubmissions()
  if (submissionsResult.error) {
    throw new Error(submissionsResult.error)
  }
  const submissions = Array.isArray(submissionsResult.data)
    ? (submissionsResult.data as AssignmentSubmissionRow[])
    : []
  const newSubmissionsByUserId: Record<string, number> = {}
  let newSubmissionCount = 0
  submissions.forEach((submission) => {
    const status = String(submission.status || '').toLowerCase()
    if (status !== 'submitted') return
    const userId = String(submission.user_id || '')
    if (!userId) return
    newSubmissionCount += 1
    newSubmissionsByUserId[userId] = (newSubmissionsByUserId[userId] || 0) + 1
  })

  const reportEntries = await Promise.all(
    studentProgress.flatMap((student) =>
      student.enrolledCourses.map(async (course) => {
        const result = await coursesApi.getStudentCourseReport(course.courseId, student.userId)
        if (result.error) {
          return null
        }
        return {
          userId: student.userId,
          courseId: String(course.courseId),
          report: (result.data as CourseReportSummary | null) || null
        }
      })
    )
  )
  const courseReportsByUserId: Record<string, Record<string, CourseReportSummary>> = {}
  reportEntries.forEach((entry) => {
    if (!entry || !entry.report) return
    if (!courseReportsByUserId[entry.userId]) {
      courseReportsByUserId[entry.userId] = {}
    }
    courseReportsByUserId[entry.userId][entry.courseId] = entry.report
  })

  const enrichedStudentProgress = studentProgress.map((student) => {
    const reportsByCourse = courseReportsByUserId[student.userId] || {}
    const quizMarksObtained = student.enrolledCourses.reduce(
      (sum, course) => sum + Number(reportsByCourse[String(course.courseId)]?.quizzes?.obtained_marks || 0),
      0
    )
    const quizMarksTotal = student.enrolledCourses.reduce(
      (sum, course) => sum + Number(reportsByCourse[String(course.courseId)]?.quizzes?.total_marks || 0),
      0
    )
    const assignmentMarksObtained = student.enrolledCourses.reduce(
      (sum, course) => sum + Number(reportsByCourse[String(course.courseId)]?.assignments?.obtained_marks || 0),
      0
    )
    const assignmentMarksTotal = student.enrolledCourses.reduce(
      (sum, course) => sum + Number(reportsByCourse[String(course.courseId)]?.assignments?.total_marks || 0),
      0
    )

    return {
      ...student,
      quizMarksObtained,
      quizMarksTotal,
      assignmentMarksObtained,
      assignmentMarksTotal,
      avatarUrl: avatarByUserId[student.userId] || null,
      newSubmissions: newSubmissionsByUserId[student.userId] || 0
    }
  })

  const studentList = buildStudentList(enrichedStudentProgress)

  return {
    courses,
    progressRecords,
    studentProgress: enrichedStudentProgress,
    studentList,
    newSubmissionCount
  }
}
