'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { loadApplicationsData } from './applications-page/loadApplicationsData'
import {
  applyCourseDecisionToApplication,
  approveApplicationCourse,
  blockUserByEmail,
  deleteApplicationById,
  markApplicationViewed,
  rejectApplicationCourse
} from './applications-page/applicationActions'
import {
  getApplicationRowBackgroundClass,
  getApplicationStatusBadge,
  getCourseApprovalVisualState
} from './applications-page/applicationRowViewState'
import BlockUserModal from './applications-page/components/BlockUserModal'
import DeleteApplicationModal from './applications-page/components/DeleteApplicationModal'
import RejectApplicationModal from './applications-page/components/RejectApplicationModal'
import type { ApplicationFilter, ApplicationRow, CourseNumber } from './applications-page/types'

const ApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ApplicationFilter>('all')
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectingCourseNumber, setRejectingCourseNumber] = useState<1 | 2 | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockingEmail, setBlockingEmail] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    try {
      setError(null)

      const result = await loadApplicationsData(filter)
      if (result.error) {
        setError(result.error)
        setRows([])
        setLoading(false)
        return
      }
      setRows(result.data)
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading applications:', err)
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Note: Real-time subscriptions removed - using API polling instead
    // You can add polling if needed: setInterval(load, 5000)
  }, [filter])

  const approveApplication = async (id: number, email: string, courseNumber: CourseNumber) => {
    try {
      const result = await approveApplicationCourse({
        applicationId: id,
        email,
        courseNumber
      })
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      setRows((previousRows) =>
        previousRows.map((row) =>
          row.id === id
            ? applyCourseDecisionToApplication({
                row,
                courseNumber,
                approved: true,
                rejectionMessage: null
              })
            : row
        )
      )

      setSelectedApplication((previousSelection) => {
        if (previousSelection?.id !== id) return previousSelection
        return applyCourseDecisionToApplication({
          row: previousSelection,
          courseNumber,
          approved: true,
          rejectionMessage: null
        })
      })
      
      // Show success message
      toast.success(`Course ${courseNumber} approved successfully!`)
      await load() // Reload to get latest data
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error approving application:', err)
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openRejectModal = (id: number, courseNumber: CourseNumber) => {
    setRejectingId(id)
    setRejectingCourseNumber(courseNumber)
    setRejectionMessage('')
    setShowRejectModal(true)
  }

  const rejectApplication = async () => {
    if (!rejectingId || !rejectingCourseNumber) return
    if (!rejectionMessage.trim()) {
      const errorMsg = 'Please provide a rejection message'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    try {
      const trimmedRejectionMessage = rejectionMessage.trim()
      const result = await rejectApplicationCourse({
        applicationId: rejectingId,
        courseNumber: rejectingCourseNumber,
        rejectionMessage: trimmedRejectionMessage
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      setRows((previousRows) =>
        previousRows.map((row) =>
          row.id === rejectingId
            ? applyCourseDecisionToApplication({
                row,
                courseNumber: rejectingCourseNumber,
                approved: false,
                rejectionMessage: trimmedRejectionMessage
              })
            : row
        )
      )

      setSelectedApplication((previousSelection) => {
        if (previousSelection?.id !== rejectingId) return previousSelection
        return applyCourseDecisionToApplication({
          row: previousSelection,
          courseNumber: rejectingCourseNumber,
          approved: false,
          rejectionMessage: trimmedRejectionMessage
        })
      })
      
      setShowRejectModal(false)
      setRejectingId(null)
      setRejectingCourseNumber(null)
      setRejectionMessage('')
      toast.success(`Course ${rejectingCourseNumber} rejected successfully!`)
      await load() // Reload to get latest data
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error rejecting application:', err)
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const markAsViewed = async (id: number) => {
    try {
      const result = await markApplicationViewed(id)
      if (result.error) {
        throw new Error(result.error)
      }
      
      setRows((previousRows) => previousRows.map((row) => (row.id === id ? { ...row, viewed: true } : row)))
      toast.success('Application marked as viewed!')
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating viewed status:', err)
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to update viewed status'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openBlockModal = (email: string) => {
    setBlockingEmail(email)
    setShowBlockModal(true)
  }

  const blockUser = async () => {
    if (!blockingEmail) return
    
    try {
      const result = await blockUserByEmail({ email: blockingEmail, rows })
      if (result.error) {
        throw new Error(result.error)
      }
      
      setError(null)
      setShowBlockModal(false)
      setBlockingEmail(null)
      setSelectedApplication(null)
      
      // Reload data to get fresh blocked status
      await load()
      
      toast.success('User has been blocked successfully!')
    } catch (err: unknown) {
      // Use secure error handler
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'blockUser')
      
      const sanitized = sanitizeError(err)
      setError(sanitized.message)
      toast.error(sanitized.message)
    }
  }

  const openDeleteModal = (id: number) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const deleteApplication = async () => {
    if (!deletingId) return

    try {
      const result = await deleteApplicationById(deletingId)
      if (result.error) {
        throw new Error(result.error)
      }
      
      setRows((previousRows) => previousRows.filter((row) => row.id !== deletingId))
      setShowDeleteModal(false)
      setDeletingId(null)
      setSelectedApplication(null)
      toast.success('Application deleted successfully!')
    } catch (err: unknown) {
      // Use secure error handler to prevent exposing internal information
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'deleteApplication')
      
      const sanitized = sanitizeError(err)
      setError(sanitized.message)
      toast.error(sanitized.message)
    }
  }

  const deletingApplication = deletingId ? rows.find((row) => row.id === deletingId) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const pendingCount = rows.filter(r => r.approved === null || r.approved === false).length
  const approvedCount = rows.filter(r => r.approved === true).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Course Applications</h1>
            <p className="text-white/90 text-xs sm:text-sm">Review and manage student admission applications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-white/30 text-white backdrop-blur-sm border border-white/30 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              All ({rows.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500/80 text-white backdrop-blur-sm border border-yellow-400/50 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'approved'
                  ? 'bg-green-500/80 text-white backdrop-blur-sm border border-green-400/50 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No applications found.</p>
          <p className="text-sm">Applications will appear here when users submit them.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Course</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((application) => {
              const statusBadge = getApplicationStatusBadge(application)
              return (
                <div key={application.id}>
                  {/* Compact Row View */}
                  <div
                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${getApplicationRowBackgroundClass(application)}`}
                  >
                    <div className="col-span-2">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {application.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.father_name}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="truncate">{application.course_name}</div>
                        {application.course_name_2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            + {application.course_name_2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {application.phone}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.email}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                        {application.image_attached && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white">
                            📎
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(application.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        ▶ View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedApplication && (
        (() => {
          const course1Status = getCourseApprovalVisualState(selectedApplication.approved_1)
          const course2Status = getCourseApprovalVisualState(selectedApplication.approved_2)
          return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-1.5 text-2xl font-bold transition-all duration-200"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</span>
                  <p className="text-base text-gray-900 dark:text-white font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Father Name</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.father_name}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.email}</p>
                </div>
                {/* Courses Section - Show all courses with individual approval status */}
                <div className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Courses</span>
                  <div className="space-y-3">
                    {/* Course 1 - Required */}
                    {selectedApplication.course_name && (
                      <div className={`p-3 rounded-lg border-2 ${course1Status.containerClassName}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Course 1 (Required)</span>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedApplication.course_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${course1Status.badgeClassName}`}>
                              {course1Status.badgeLabel}
                            </span>
                          </div>
                        </div>
                        {selectedApplication.rejection_message_1 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {selectedApplication.rejection_message_1}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {selectedApplication.approved_1 !== true && (
                            <button
                              onClick={() => approveApplication(selectedApplication.id, selectedApplication.email, 1)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✓ Approve Course 1
                            </button>
                          )}
                          {selectedApplication.approved_1 !== false && (
                            <button
                              onClick={() => {
                                setSelectedApplication(null)
                                openRejectModal(selectedApplication.id, 1)
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✗ Reject Course 1
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Course 2 - Optional */}
                    {selectedApplication.course_name_2 && (
                      <div className={`p-3 rounded-lg border-2 ${course2Status.containerClassName}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Course 2 (Optional)</span>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedApplication.course_name_2}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${course2Status.badgeClassName}`}>
                              {course2Status.badgeLabel}
                            </span>
                          </div>
                        </div>
                        {selectedApplication.rejection_message_2 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {selectedApplication.rejection_message_2}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {selectedApplication.approved_2 !== true && (
                            <button
                              onClick={() => approveApplication(selectedApplication.id, selectedApplication.email, 2)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✓ Approve Course 2
                            </button>
                          )}
                          {selectedApplication.approved_2 !== false && (
                            <button
                              onClick={() => {
                                setSelectedApplication(null)
                                openRejectModal(selectedApplication.id, 2)
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✗ Reject Course 2
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.gender}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.age}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Submitted</span>
                  <p className="text-base text-gray-900 dark:text-white">
                    {new Date(selectedApplication.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedApplication.address && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</span>
                    <p className="text-base text-gray-900 dark:text-white">{selectedApplication.address}</p>
                  </div>
                )}
                {selectedApplication.message && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Message</span>
                    <p className="text-base text-gray-900 dark:text-white">{selectedApplication.message}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!selectedApplication.viewed && (
                  <button
                    onClick={() => {
                      markAsViewed(selectedApplication.id)
                      setSelectedApplication({ ...selectedApplication, viewed: true })
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Mark Viewed
                  </button>
                )}
                {!selectedApplication.is_blocked && (
                  <button
                    onClick={() => {
                      setSelectedApplication(null)
                      openBlockModal(selectedApplication.email)
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Block User
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedApplication(null)
                    openDeleteModal(selectedApplication.id)
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
          )
        })()
      )}

      <RejectApplicationModal
        isOpen={showRejectModal}
        rejectingCourseNumber={rejectingCourseNumber}
        rejectionMessage={rejectionMessage}
        onMessageChange={setRejectionMessage}
        onConfirm={rejectApplication}
        onClose={() => {
          setShowRejectModal(false)
          setRejectingId(null)
          setRejectingCourseNumber(null)
          setRejectionMessage('')
        }}
      />

      <BlockUserModal
        isOpen={showBlockModal}
        email={blockingEmail}
        onConfirm={blockUser}
        onClose={() => {
          setShowBlockModal(false)
          setBlockingEmail(null)
        }}
      />

      <DeleteApplicationModal
        isOpen={showDeleteModal}
        applicantName={deletingApplication?.name || 'Unknown'}
        applicantEmail={deletingApplication?.email || 'Unknown'}
        onConfirm={deleteApplication}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingId(null)
        }}
      />
    </div>
  )
}

export default ApplicationsPage
