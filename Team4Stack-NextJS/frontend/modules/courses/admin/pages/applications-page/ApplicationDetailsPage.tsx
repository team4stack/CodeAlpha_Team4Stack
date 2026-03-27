'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { loadApplicationsData } from './loadApplicationsData'
import {
  applyCourseDecisionToApplication,
  approveApplicationCourse,
  blockUserByEmail,
  deleteApplicationById,
  markApplicationViewed,
  rejectApplicationCourse
} from './applicationActions'
import {
  getApplicationStatusBadge,
  getCourseApprovalVisualState
} from './applicationRowViewState'
import BlockUserModal from './components/BlockUserModal'
import DeleteApplicationModal from './components/DeleteApplicationModal'
import RejectApplicationModal from './components/RejectApplicationModal'
import type { ApplicationRow, CourseNumber } from './types'

const ApplicationDetailsPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationIdParam = searchParams.get('id') || ''
  const applicationId = Number.parseInt(applicationIdParam, 10)

  const [application, setApplication] = useState<ApplicationRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingCourseNumber, setRejectingCourseNumber] = useState<1 | 2 | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockingEmail, setBlockingEmail] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showPaymentPreview, setShowPaymentPreview] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(applicationId)) {
        setError('Invalid application id')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const result = await loadApplicationsData('all')
        if (result.error) {
          setError(result.error)
          setApplication(null)
          return
        }
        const found = result.data.find((row) => row.id === applicationId) || null
        setApplication(found)
        if (!found) setError('Application not found')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [applicationId])

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

      setApplication((previous) =>
        previous
          ? applyCourseDecisionToApplication({
              row: previous,
              courseNumber,
              approved: true,
              rejectionMessage: null
            })
          : previous
      )

      toast.success(`Course ${courseNumber} approved successfully!`)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openRejectModal = (courseNumber: CourseNumber) => {
    setRejectingCourseNumber(courseNumber)
    setRejectionMessage('')
    setShowRejectModal(true)
  }

  const rejectApplication = async () => {
    if (!application || !rejectingCourseNumber) return
    if (!rejectionMessage.trim()) {
      const errorMsg = 'Please provide a rejection message'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    try {
      const trimmedRejectionMessage = rejectionMessage.trim()
      const result = await rejectApplicationCourse({
        applicationId: application.id,
        courseNumber: rejectingCourseNumber,
        rejectionMessage: trimmedRejectionMessage
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      setApplication((previous) =>
        previous
          ? applyCourseDecisionToApplication({
              row: previous,
              courseNumber: rejectingCourseNumber,
              approved: false,
              rejectionMessage: trimmedRejectionMessage
            })
          : previous
      )

      setShowRejectModal(false)
      setRejectingCourseNumber(null)
      setRejectionMessage('')
      toast.success(`Course ${rejectingCourseNumber} rejected successfully!`)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const markAsViewed = async () => {
    if (!application) return
    try {
      const result = await markApplicationViewed(application.id)
      if (result.error) {
        throw new Error(result.error)
      }
      setApplication({ ...application, viewed: true })
      toast.success('Application marked as viewed!')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update viewed status'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openBlockModal = () => {
    if (!application) return
    setBlockingEmail(application.email)
    setShowBlockModal(true)
  }

  const blockUser = async () => {
    if (!blockingEmail || !application) return

    try {
      const result = await blockUserByEmail({ email: blockingEmail, rows: [application] })
      if (result.error) {
        throw new Error(result.error)
      }

      setShowBlockModal(false)
      setBlockingEmail(null)
      setApplication({ ...application, is_blocked: true })
      toast.success('User has been blocked successfully!')
    } catch (err: unknown) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'blockUser')

      const sanitized = sanitizeError(err)
      setError(sanitized.message)
      toast.error(sanitized.message)
    }
  }

  const openDeleteModal = () => {
    if (!application) return
    setDeletingId(application.id)
    setShowDeleteModal(true)
  }

  const deleteApplication = async () => {
    if (!deletingId) return

    try {
      const result = await deleteApplicationById(deletingId)
      if (result.error) {
        throw new Error(result.error)
      }

      setShowDeleteModal(false)
      setDeletingId(null)
      toast.success('Application deleted successfully!')
      router.push('/admincourset4s/applications')
    } catch (err: unknown) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'deleteApplication')

      const sanitized = sanitizeError(err)
      setError(sanitized.message)
      toast.error(sanitized.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">Loading application...</div>
      </div>
    )
  }

  if (!application || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/20 p-6 text-red-100">
          {error || 'Application not found'}
        </div>
      </div>
    )
  }

  const course1Status = getCourseApprovalVisualState(application.approved_1)
  const course2Status = getCourseApprovalVisualState(application.approved_2)
  const statusBadge = getApplicationStatusBadge(application)
  const screenshotUrl = application.payment_screenshot_url || undefined
  const hasScreenshot = Boolean(screenshotUrl)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push('/admincourset4s/applications')}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Back to Applications
          </button>
          <div className="text-center flex-1">
            <h1 className="text-white font-black text-xl">Application Details</h1>
            <p className="text-xs text-white/60">Review student info and approval status</p>
          </div>
          <div className="hidden sm:block w-[140px]" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{application.name}</h2>
              <p className="text-sm text-white/60">{application.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                {application.image_attached ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                    Screenshot attached
                  </span>
                ) : null}
                {hasScreenshot ? (
                  <button
                    type="button"
                    onClick={() => setShowPaymentPreview(true)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                  >
                    View Payment
                  </button>
                ) : null}
              </div>
            </div>
            <div className="text-right text-xs text-white/60">
              <div>Submitted</div>
              <div className="text-white/80 font-semibold">{new Date(application.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-white/50">Father Name</div>
                  <div className="text-white font-semibold">{application.father_name}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Phone</div>
                  <div className="text-white/80">{application.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Gender</div>
                  <div className="text-white/80">{application.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Age</div>
                  <div className="text-white/80">{application.age}</div>
                </div>
                {application.address ? (
                  <div className="col-span-2">
                    <div className="text-xs text-white/50">Address</div>
                    <div className="text-white/80">{application.address}</div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50 mb-2">Courses</div>
              <div className="space-y-3">
                {application.course_name && (
                  <div className={`rounded-lg border-2 p-3 ${course1Status.containerClassName}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/60">Course 1</div>
                        <div className="text-white font-semibold">{application.course_name}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${course1Status.badgeClassName}`}>
                        {course1Status.badgeLabel}
                      </span>
                    </div>
                    {application.rejection_message_1 ? (
                      <p className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                        {application.rejection_message_1}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.approved_1 !== true && (
                        <button
                          onClick={() => approveApplication(application.id, application.email, 1)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                        >
                          ? Approve Course 1
                        </button>
                      )}
                      {application.approved_1 !== false && (
                        <button
                          onClick={() => openRejectModal(1)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                        >
                          ? Reject Course 1
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {application.course_name_2 && (
                  <div className={`rounded-lg border-2 p-3 ${course2Status.containerClassName}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/60">Course 2</div>
                        <div className="text-white font-semibold">{application.course_name_2}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${course2Status.badgeClassName}`}>
                        {course2Status.badgeLabel}
                      </span>
                    </div>
                    {application.rejection_message_2 ? (
                      <p className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                        {application.rejection_message_2}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.approved_2 !== true && (
                        <button
                          onClick={() => approveApplication(application.id, application.email, 2)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                        >
                          ? Approve Course 2
                        </button>
                      )}
                      {application.approved_2 !== false && (
                        <button
                          onClick={() => openRejectModal(2)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                        >
                          ? Reject Course 2
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Payment Screenshot</div>
              {hasScreenshot ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentPreview(true)}
                    className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20"
                  >
                    View Payment
                  </button>
                  <a
                    href={screenshotUrl}
                    download
                    className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/60">
                  {application.image_attached ? 'Screenshot URL not available yet.' : 'No screenshot attached.'}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Admin Actions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {!application.viewed && (
                  <button
                    onClick={markAsViewed}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Mark Viewed
                  </button>
                )}
                {!application.is_blocked && (
                  <button
                    onClick={openBlockModal}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Block User
                  </button>
                )}
                <button
                  onClick={openDeleteModal}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Delete Application
                </button>
              </div>
              {application.message ? (
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                  <div className="text-white/60 mb-1">Student Message</div>
                  {application.message}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <RejectApplicationModal
        isOpen={showRejectModal}
        rejectingCourseNumber={rejectingCourseNumber}
        rejectionMessage={rejectionMessage}
        onMessageChange={setRejectionMessage}
        onConfirm={rejectApplication}
        onClose={() => {
          setShowRejectModal(false)
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
        applicantName={application.name}
        applicantEmail={application.email}
        onConfirm={deleteApplication}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingId(null)
        }}
      />

      {showPaymentPreview && hasScreenshot ? (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 p-4 pt-24 pb-10 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">Payment Screenshot</div>
              <button
                type="button"
                onClick={() => setShowPaymentPreview(false)}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <img
                src={screenshotUrl as string}
                alt="Payment screenshot full view"
                className="max-h-[70vh] w-full rounded-xl object-contain border border-white/10 bg-black/40"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <a
                href={screenshotUrl as string}
                download
                className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ApplicationDetailsPage
