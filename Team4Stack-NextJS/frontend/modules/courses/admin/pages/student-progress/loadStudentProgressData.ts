import { coursesApi, usersApi } from '@/lib/api'
import type { ProgressRecord, User } from './types'
import { collectApprovedApplications, getCnicMap, getStudentEnrollments } from './admissionsData'
import { getVideosByCourse } from './courseData'
import { buildStudentList, buildStudentProgress } from './progressBuilders'
import { generateAndPersistRollNumbers } from './rollNumberAssignment'
import { mapCourseOption } from './shared'

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
  const studentList = buildStudentList(studentProgress)

  return {
    courses,
    progressRecords,
    studentProgress,
    studentList
  }
}
