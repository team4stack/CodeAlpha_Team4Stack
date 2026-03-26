import { coursesApi, usersApi } from '@/lib/api'
import type { ApplicationRow, CourseNumber } from './types'

type ApprovalField = 'approved_1' | 'approved_2'
type RejectionField = 'rejection_message_1' | 'rejection_message_2'

const getCourseFieldNames = (
  courseNumber: CourseNumber
): { approvalField: ApprovalField; rejectionField: RejectionField } => {
  return courseNumber === 1
    ? { approvalField: 'approved_1', rejectionField: 'rejection_message_1' }
    : { approvalField: 'approved_2', rejectionField: 'rejection_message_2' }
}

const withLocalOverallApproval = (row: ApplicationRow): ApplicationRow => ({
  ...row,
  approved: row.approved_1 === true || row.approved_2 === true
})

export const applyCourseDecisionToApplication = ({
  row,
  courseNumber,
  approved,
  rejectionMessage
}: {
  row: ApplicationRow
  courseNumber: CourseNumber
  approved: boolean
  rejectionMessage: string | null
}): ApplicationRow => {
  const { approvalField, rejectionField } = getCourseFieldNames(courseNumber)
  const updatedRow: ApplicationRow = {
    ...row,
    [approvalField]: approved,
    [rejectionField]: rejectionMessage,
    viewed: true
  }
  return withLocalOverallApproval(updatedRow)
}

const normalizeEmail = (email: string) => email.toLowerCase().trim()

const ensureUserReadyForApprovedCourse = async (email: string) => {
  const normalizedEmail = normalizeEmail(email)
  const userResult = await usersApi.getUserByEmail(normalizedEmail)
  const existingUser = userResult?.data as { id?: string | number } | null

  if (!existingUser?.id) {
    try {
      await usersApi.upsertUser({
        email: normalizedEmail,
        username: normalizedEmail.split('@')[0],
        name: normalizedEmail.split('@')[0],
        is_blocked: false
      })
    } catch (error) {
      console.warn('User creation failed (non-critical):', error)
    }
    return
  }

  try {
    await usersApi.updateUser(String(existingUser.id), { is_blocked: false })
  } catch (error) {
    console.warn('User unblock failed (non-critical):', error)
  }
}

export const approveApplicationCourse = async ({
  applicationId,
  email,
  courseNumber
}: {
  applicationId: number
  email: string
  courseNumber: CourseNumber
}): Promise<{ error: string | null }> => {
  const { approvalField, rejectionField } = getCourseFieldNames(courseNumber)
  const updateResult = await coursesApi.updateAdmissionForm(applicationId, {
    [approvalField]: true,
    [rejectionField]: null,
    viewed: true
  })

  if (updateResult.error) {
    return { error: updateResult.error }
  }

  try {
    await ensureUserReadyForApprovedCourse(email)
  } catch (error) {
    console.warn('User sync failed (non-critical):', error)
  }

  return { error: null }
}

export const rejectApplicationCourse = async ({
  applicationId,
  courseNumber,
  rejectionMessage
}: {
  applicationId: number
  courseNumber: CourseNumber
  rejectionMessage: string
}): Promise<{ error: string | null }> => {
  const { approvalField, rejectionField } = getCourseFieldNames(courseNumber)
  const updateResult = await coursesApi.updateAdmissionForm(applicationId, {
    [approvalField]: false,
    [rejectionField]: rejectionMessage,
    viewed: true
  })

  return { error: updateResult.error ?? null }
}

export const markApplicationViewed = async (applicationId: number): Promise<{ error: string | null }> => {
  const updateResult = await coursesApi.updateAdmissionForm(applicationId, { viewed: true })
  return { error: updateResult.error ?? null }
}

export const blockUserByEmail = async ({
  email,
  rows
}: {
  email: string
  rows: ApplicationRow[]
}): Promise<{ error: string | null }> => {
  const normalizedEmail = normalizeEmail(email)
  const existingUserResult = await usersApi.getUserByEmail(normalizedEmail)
  const existingUser = existingUserResult.data as { id?: string | number } | null

  if (existingUser?.id) {
    const updateUserResult = await usersApi.updateUser(String(existingUser.id), { is_blocked: true })
    if (updateUserResult.error) {
      return { error: updateUserResult.error }
    }
  } else {
    const createResult = await usersApi.upsertUser({
      email: normalizedEmail,
      username: normalizedEmail.split('@')[0],
      is_blocked: true,
      created_at: new Date().toISOString()
    })

    if (createResult.error && !createResult.error.includes('duplicate') && !createResult.error.includes('23505')) {
      return { error: createResult.error }
    }
  }

  const application = rows.find((row) => normalizeEmail(row.email) === normalizedEmail)
  if (application) {
    const updateFormResult = await coursesApi.updateAdmissionForm(application.id, {
      approved: false,
      viewed: true,
      rejection_message:
        'Your account has been blocked by the administrator. Please contact support for more information.'
    })

    if (updateFormResult.error) {
      return { error: updateFormResult.error }
    }
  }

  return { error: null }
}

export const deleteApplicationById = async (applicationId: number): Promise<{ error: string | null }> => {
  const result = await coursesApi.deleteAdmissionForm(applicationId)
  return { error: result.error ?? null }
}
