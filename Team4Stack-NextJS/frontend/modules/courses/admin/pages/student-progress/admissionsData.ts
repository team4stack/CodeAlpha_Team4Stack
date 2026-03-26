import type { ApprovedApplicationRow } from './shared'
import { normalizeEmail } from './shared'

const isApprovedApplication = (application: ApprovedApplicationRow) =>
  application.approved === true || application.approved_1 === true || application.approved_2 === true

export const collectApprovedApplications = (rows: unknown[]): ApprovedApplicationRow[] => {
  const approvedRows = (rows as ApprovedApplicationRow[]).filter(isApprovedApplication).map((application) => ({
    id: application.id,
    email: application.email,
    course_name: application.course_name,
    course_name_2: application.course_name_2,
    approved: application.approved,
    approved_1: application.approved_1,
    approved_2: application.approved_2,
    roll_number: application.roll_number,
    cnic: application.cnic
  }))

  const dedupedByApplicationId = new Map<string, ApprovedApplicationRow>()
  approvedRows.forEach((application) => {
    const key = String(application.id)
    const existing = dedupedByApplicationId.get(key)
    if (!existing) {
      dedupedByApplicationId.set(key, application)
      return
    }

    dedupedByApplicationId.set(key, {
      ...existing,
      approved_1: Boolean(existing.approved_1 || application.approved_1),
      approved_2: Boolean(existing.approved_2 || application.approved_2),
      course_name_2: existing.course_name_2 || application.course_name_2
    })
  })

  return Array.from(dedupedByApplicationId.values())
}

export const getStudentEnrollments = (applications: ApprovedApplicationRow[]) => {
  const studentEmails = new Set<string>()
  const studentEnrollments: Record<string, Set<string>> = {}

  applications.forEach((application) => {
    const normalizedEmail = normalizeEmail(application.email)
    if (!normalizedEmail) return

    const hasPerCourseApprovals = application.approved_1 !== undefined || application.approved_2 !== undefined

    if (hasPerCourseApprovals) {
      if (application.course_name?.trim() && application.approved_1 === true) {
        studentEmails.add(normalizedEmail)
        if (!studentEnrollments[normalizedEmail]) studentEnrollments[normalizedEmail] = new Set()
        studentEnrollments[normalizedEmail].add(application.course_name.trim())
      }
      if (application.course_name_2?.trim() && application.approved_2 === true) {
        studentEmails.add(normalizedEmail)
        if (!studentEnrollments[normalizedEmail]) studentEnrollments[normalizedEmail] = new Set()
        studentEnrollments[normalizedEmail].add(application.course_name_2.trim())
      }
      return
    }

    if (application.approved === true && application.course_name?.trim()) {
      studentEmails.add(normalizedEmail)
      if (!studentEnrollments[normalizedEmail]) studentEnrollments[normalizedEmail] = new Set()
      studentEnrollments[normalizedEmail].add(application.course_name.trim())
    }
  })

  return { studentEmails, studentEnrollments }
}

export const getCnicMap = (applications: ApprovedApplicationRow[]) => {
  const cnicMap: Record<string, string> = {}
  applications.forEach((application) => {
    const normalizedEmail = normalizeEmail(application.email)
    if (!normalizedEmail) return
    if (application.cnic && !cnicMap[normalizedEmail]) {
      cnicMap[normalizedEmail] = application.cnic
    }
  })
  return cnicMap
}
