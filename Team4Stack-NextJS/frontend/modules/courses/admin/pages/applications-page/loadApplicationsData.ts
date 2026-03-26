import { coursesApi, usersApi } from '@/lib/api'
import type { ApplicationFilter, ApplicationRow } from './types'

const hasPerCourseApprovalFields = (application: ApplicationRow) =>
  application.approved_1 !== undefined || application.approved_2 !== undefined

const getOverallApprovalState = (application: ApplicationRow): boolean | null => {
  if (hasPerCourseApprovalFields(application)) {
    const hasApprovedCourse = application.approved_1 === true || application.approved_2 === true
    const allRejected = Boolean(
      (application.course_name && application.approved_1 === false) &&
      (!application.course_name_2 || application.approved_2 === false)
    )
    if (hasApprovedCourse) return true
    if (allRejected) return false
    return null
  }

  if (application.approved === true) return true
  if (application.approved === false) return false
  return null
}

const matchesStatusFilter = (application: ApplicationRow, filter: ApplicationFilter) => {
  const overallApproval = getOverallApprovalState(application)
  if (filter === 'pending') return overallApproval === null
  if (filter === 'approved') return overallApproval === true
  if (filter === 'rejected') return overallApproval === false
  return true
}

const sortByNewest = (applications: ApplicationRow[]) =>
  [...applications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

const withBlockStatus = async (applications: ApplicationRow[]) => {
  return await Promise.all(
    applications.map(async (application) => {
      const userResult = await usersApi.getUserByEmail(application.email.toLowerCase().trim())
      const userData = userResult?.data as { is_blocked?: boolean } | null
      const overallApproval = getOverallApprovalState(application)

      return {
        ...application,
        is_blocked: userData?.is_blocked ?? false,
        approved: overallApproval
      }
    })
  )
}

export const loadApplicationsData = async (
  filter: ApplicationFilter
): Promise<{ data: ApplicationRow[]; error: string | null }> => {
  const result = await coursesApi.getAdmissionForms()
  if (result.error) {
    return { data: [], error: result.error }
  }

  const rows = Array.isArray(result.data) ? (result.data as ApplicationRow[]) : []
  const filteredRows = rows.filter((application) => matchesStatusFilter(application, filter))
  const sortedRows = sortByNewest(filteredRows)
  const enrichedRows = await withBlockStatus(sortedRows)
  return { data: enrichedRows, error: null }
}
