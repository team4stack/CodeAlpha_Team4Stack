import type { ApplicationRow } from './types'

interface ApplicationStatusBadge {
  label: string
  className: string
}

interface CourseApprovalVisualState {
  badgeLabel: string
  badgeClassName: string
  containerClassName: string
}

export const getApplicationRowBackgroundClass = (application: ApplicationRow) => {
  if (application.is_blocked) return 'bg-orange-50/30 dark:bg-orange-900/10'
  if (application.approved === true) return 'bg-green-50/30 dark:bg-green-900/10'
  if (application.approved === false) return 'bg-red-50/30 dark:bg-red-900/10'
  if (!application.viewed) return 'bg-blue-50/30 dark:bg-blue-900/10'
  return ''
}

export const getApplicationStatusBadge = (application: ApplicationRow): ApplicationStatusBadge => {
  if (application.is_blocked) {
    return {
      label: '🚫 Blocked',
      className: 'bg-orange-600 text-white'
    }
  }

  const hasApproved = application.approved_1 === true || application.approved_2 === true
  const hasRejected = application.approved_1 === false || application.approved_2 === false
  const hasPending =
    Boolean(application.course_name && application.approved_1 === null) ||
    Boolean(application.course_name_2 && application.approved_2 === null)

  if (hasApproved && hasPending) {
    return { label: 'Partially Approved', className: 'bg-green-500 text-white' }
  }

  if (hasApproved) {
    return { label: 'Approved', className: 'bg-green-500 text-white' }
  }

  if (hasRejected && hasPending) {
    return { label: 'Pending', className: 'bg-yellow-500 text-white animate-pulse' }
  }

  if (hasRejected) {
    return { label: 'Rejected', className: 'bg-red-500 text-white' }
  }

  if (!application.viewed) {
    return { label: 'Pending', className: 'bg-yellow-500 text-white animate-pulse' }
  }

  return { label: 'Pending', className: 'bg-gray-500 text-white' }
}

export const getCourseApprovalVisualState = (
  approvalStatus: boolean | null | undefined
): CourseApprovalVisualState => {
  if (approvalStatus === true) {
    return {
      badgeLabel: '✓ Approved',
      badgeClassName: 'bg-green-500 text-white',
      containerClassName: 'bg-green-50 dark:bg-green-900/20 border-green-500'
    }
  }

  if (approvalStatus === false) {
    return {
      badgeLabel: '✗ Rejected',
      badgeClassName: 'bg-red-500 text-white',
      containerClassName: 'bg-red-50 dark:bg-red-900/20 border-red-500'
    }
  }

  return {
    badgeLabel: '⏳ Pending',
    badgeClassName: 'bg-yellow-500 text-white',
    containerClassName: 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
  }
}
