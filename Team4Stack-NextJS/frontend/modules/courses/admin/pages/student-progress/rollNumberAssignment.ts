import { coursesApi } from '@/lib/api'
import type { Course } from './types'
import type { ApprovedApplicationRow } from './shared'
import { getCourseNameKey, normalizeEmail } from './shared'

export const generateAndPersistRollNumbers = ({
  applications,
  courses
}: {
  applications: ApprovedApplicationRow[]
  courses: Course[]
}) => {
  const rollNumberMap: Record<string, Record<string, string>> = {}
  const courseSequenceCount: Record<string, number> = {}
  const processedPairs = new Set<string>()
  const approvedCourseList: Array<{ email: string; courseId: string; appId: string }> = []

  applications.forEach((application) => {
    const normalizedEmail = normalizeEmail(application.email)
    if (!normalizedEmail) return
    const hasPerCourseApprovals = application.approved_1 !== undefined || application.approved_2 !== undefined

    if (hasPerCourseApprovals) {
      if (application.course_name?.trim() && application.approved_1 === true) {
        const matchedCourse = courses.find(
          (course) => getCourseNameKey(course) === application.course_name?.toLowerCase().trim()
        )
        if (matchedCourse) {
          approvedCourseList.push({
            email: normalizedEmail,
            courseId: String(matchedCourse.id),
            appId: String(application.id)
          })
        }
      }
      if (application.course_name_2?.trim() && application.approved_2 === true) {
        const matchedCourse = courses.find(
          (course) => getCourseNameKey(course) === application.course_name_2?.toLowerCase().trim()
        )
        if (matchedCourse) {
          approvedCourseList.push({
            email: normalizedEmail,
            courseId: String(matchedCourse.id),
            appId: String(application.id)
          })
        }
      }
      return
    }

    if (application.approved === true && application.course_name?.trim()) {
      const matchedCourse = courses.find(
        (course) => getCourseNameKey(course) === application.course_name?.toLowerCase().trim()
      )
      if (matchedCourse) {
        approvedCourseList.push({
          email: normalizedEmail,
          courseId: String(matchedCourse.id),
          appId: String(application.id)
        })
      }
    }
  })

  approvedCourseList.forEach(({ email, courseId, appId }) => {
    const key = `${email}-${courseId}`
    if (processedPairs.has(key)) return
    processedPairs.add(key)

    if (!rollNumberMap[email]) rollNumberMap[email] = {}
    if (!courseSequenceCount[courseId]) courseSequenceCount[courseId] = 0
    if (rollNumberMap[email][courseId]) return

    courseSequenceCount[courseId] += 1
    const sequence = String(courseSequenceCount[courseId]).padStart(3, '0')
    rollNumberMap[email][courseId] = `T4S-${courseId}-${sequence}`

    coursesApi
      .updateAdmissionForm(Number(appId), { roll_number: rollNumberMap[email][courseId] })
      .then(() => {})
      .catch(() => {})
  })

  return rollNumberMap
}
