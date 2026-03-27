'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { coursesApi } from '@/lib/api'
import type { StudentProgress } from '../types'

interface StudentDetailsModalProps {
  selectedStudent: StudentProgress | null
  isOpen: boolean
  onClose: () => void
  variant?: 'modal' | 'page'
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  selectedStudent,
  isOpen,
  onClose,
  variant = 'modal'
}) => {
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [savingSubmissionId, setSavingSubmissionId] = useState<number | null>(null)
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<
    Array<{
      id: number
      assignment_title: string
      course_id: number
      file_url: string
      file_name: string
      status: string
      awarded_marks?: number | null
      admin_feedback?: string | null
      submitted_at?: string
    }>
  >([])
  const [submissionEdits, setSubmissionEdits] = useState<Record<number, {
    status: string
    awarded_marks: string
    admin_feedback: string
    allow_resubmit: boolean
  }>>({})
  const [courseReportById, setCourseReportById] = useState<Record<string, {
    quizzes: { obtained_marks: number; total_marks: number }
    assignments: { obtained_marks: number; total_marks: number }
  }>>({})

  const courseNameById = useMemo(() => {
    const map = new Map<string, string>()
    selectedStudent?.enrolledCourses.forEach((course) => {
      map.set(String(course.courseId), course.courseName)
    })
    return map
  }, [selectedStudent])

  useEffect(() => {
    if (!isOpen || !selectedStudent) return
    const loadSubmissions = async () => {
      try {
        setSubmissionsLoading(true)
        const result = await coursesApi.getAssignmentSubmissions({ userId: selectedStudent.userId })
        if (result.error) {
          throw new Error(result.error)
        }
        const submissions = (
          Array.isArray(result.data)
            ? (result.data as Array<{
                id: number
                assignment_title: string
                course_id: number
                file_url: string
                file_name: string
                status: string
                awarded_marks?: number | null
                admin_feedback?: string | null
                submitted_at?: string
              }>)
            : []
        )
        setAssignmentSubmissions(submissions)
        const edits: Record<number, { status: string; awarded_marks: string; admin_feedback: string; allow_resubmit: boolean }> = {}
        submissions.forEach((submission) => {
          edits[submission.id] = {
            status: submission.status || 'submitted',
            awarded_marks: submission.awarded_marks != null ? String(submission.awarded_marks) : '',
            admin_feedback: submission.admin_feedback || '',
            allow_resubmit: false
          }
        })
        setSubmissionEdits(edits)
      } catch {
        setAssignmentSubmissions([])
      } finally {
        setSubmissionsLoading(false)
      }
    }
    void loadSubmissions()
  }, [isOpen, selectedStudent])

  useEffect(() => {
    if (!isOpen || !selectedStudent) return
    const loadReports = async () => {
      try {
        const entries = await Promise.all(
          selectedStudent.enrolledCourses.map(async (course) => {
            const result = await coursesApi.getStudentCourseReport(course.courseId, selectedStudent.userId)
            const report = result?.data as {
              quizzes?: { obtained_marks?: number; total_marks?: number }
              assignments?: { obtained_marks?: number; total_marks?: number }
            }
            return [
              String(course.courseId),
              {
                quizzes: {
                  obtained_marks: Number(report?.quizzes?.obtained_marks || 0),
                  total_marks: Number(report?.quizzes?.total_marks || 0)
                },
                assignments: {
                  obtained_marks: Number(report?.assignments?.obtained_marks || 0),
                  total_marks: Number(report?.assignments?.total_marks || 0)
                }
              }
            ] as const
          })
        )
        setCourseReportById(Object.fromEntries(entries))
      } catch {
        setCourseReportById({})
      }
    }
    void loadReports()
  }, [isOpen, selectedStudent])

  const saveSubmissionReview = async (submissionId: number) => {
    const payload = submissionEdits[submissionId]
    if (!payload) return
    setSavingSubmissionId(submissionId)
    try {
      const awarded = payload.awarded_marks.trim()
      const awarded_marks = awarded === '' ? null : Number(awarded)
      const result = await coursesApi.updateAssignmentSubmissionAdmin(submissionId, {
        status: payload.status,
        awarded_marks: Number.isFinite(awarded_marks as number) ? awarded_marks : null,
        admin_feedback: payload.admin_feedback.trim() || null,
        allow_resubmit: payload.allow_resubmit
      })
      const deleted = Boolean((result as { deleted?: boolean } | null)?.deleted || (result as { data?: { deleted?: boolean } } | null)?.data?.deleted)
      if (deleted) {
        setAssignmentSubmissions((prev) => prev.filter((item) => item.id !== submissionId))
        setSubmissionEdits((prev) => {
          const next = { ...prev }
          delete next[submissionId]
          return next
        })
      } else {
        setAssignmentSubmissions((prev) =>
          prev.map((item) =>
            item.id === submissionId
              ? {
                  ...item,
                  status: payload.status,
                  awarded_marks: awarded_marks as number | null,
                  admin_feedback: payload.admin_feedback.trim() || null
                }
              : item
          )
        )
      }
    } finally {
      setSavingSubmissionId(null)
    }
  }

  const isPage = variant === 'page'
  if ((!isOpen && !isPage) || !selectedStudent) return null

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
      case 'reviewed':
        return 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
      case 'rejected':
        return 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
      case 'submitted':
      default:
        return 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
    }
  }

  const content = (
    <div
      className={`relative w-full ${
        isPage ? 'max-w-6xl' : 'max-w-2xl'
      } rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 shadow-2xl`}
    >
      <div className="sticky top-0 z-10 rounded-t-3xl border-b border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 px-6 py-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {selectedStudent.avatarUrl ? (
              <img
                src={selectedStudent.avatarUrl}
                alt={selectedStudent.userName}
                className="h-16 w-16 rounded-2xl object-cover border border-white/15 shadow-lg"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {selectedStudent.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black text-white">{selectedStudent.userName}</h2>
              <p className="text-sm text-white/60">{selectedStudent.userEmail}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="rounded-full bg-white/10 px-3 py-1">Roll: {selectedStudent.rollNumber || 'N/A'}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">CNIC: {selectedStudent.cnic || '-'}</span>
              </div>
            </div>
          </div>
          {isPage ? null : (
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/40"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Total Courses</div>
            <div className="mt-1 text-xl font-bold text-white">{selectedStudent.totalCourses}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Videos Completed</div>
            <div className="mt-1 text-xl font-bold text-emerald-300">{selectedStudent.totalVideosCompleted}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Quiz Marks</div>
            <div className="mt-1 text-xl font-bold text-cyan-200">
              {selectedStudent.enrolledCourses.reduce((sum, course) => sum + (courseReportById[String(course.courseId)]?.quizzes.obtained_marks ?? 0), 0)}/
              {selectedStudent.enrolledCourses.reduce((sum, course) => sum + (courseReportById[String(course.courseId)]?.quizzes.total_marks ?? 0), 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Assignment Marks</div>
            <div className="mt-1 text-xl font-bold text-emerald-200">
              {selectedStudent.enrolledCourses.reduce((sum, course) => sum + (courseReportById[String(course.courseId)]?.assignments.obtained_marks ?? 0), 0)}/
              {selectedStudent.enrolledCourses.reduce((sum, course) => sum + (courseReportById[String(course.courseId)]?.assignments.total_marks ?? 0), 0)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black text-white">Course Progress</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedStudent.enrolledCourses.map((course) => (
              <div key={course.courseId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{course.courseName}</h4>
                  <span className="text-xs text-white/60">
                    {course.completedVideos}/{course.totalVideos} Videos
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white">{course.progressPercentage}%</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-white/50">Quiz Marks</div>
                    <div className="text-white font-semibold">
                      {courseReportById[String(course.courseId)]?.quizzes.obtained_marks ?? 0}/
                      {courseReportById[String(course.courseId)]?.quizzes.total_marks ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="text-white/50">Assignment Marks</div>
                    <div className="text-white font-semibold">
                      {courseReportById[String(course.courseId)]?.assignments.obtained_marks ?? 0}/
                      {courseReportById[String(course.courseId)]?.assignments.total_marks ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black text-white">Assignment Submissions</h3>
          {submissionsLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Loading uploaded assignments...
            </div>
          ) : assignmentSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              This student has not uploaded any assignment files yet.
            </div>
          ) : (
            <div className="space-y-3">
              {assignmentSubmissions.map((submission) => (
                <div key={submission.id} className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 via-white/3 to-white/5 p-3">
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">{submission.assignment_title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        Course: {courseNameById.get(String(submission.course_id)) || `Course ${submission.course_id}`}
                      </p>
                      {submission.status !== 'rejected' ? (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
                          >
                            View {submission.file_name}
                          </a>
                          <a
                            href={submission.file_url}
                            download
                            className="inline-flex text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-white/50">File removed after rejection.</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={submissionEdits[submission.id]?.status || submission.status}
                          onChange={(event) =>
                            setSubmissionEdits((prev) => ({
                              ...prev,
                              [submission.id]: {
                                status: event.target.value,
                                awarded_marks: prev[submission.id]?.awarded_marks || '',
                                admin_feedback: prev[submission.id]?.admin_feedback || '',
                                allow_resubmit: prev[submission.id]?.allow_resubmit || false
                              }
                            }))
                          }
                          className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-xs text-white min-w-[140px]"
                        >
                          <option className="bg-slate-900" value="submitted">Submitted</option>
                          <option className="bg-slate-900" value="reviewed">Reviewed</option>
                          <option className="bg-slate-900" value="accepted">Accepted</option>
                          <option className="bg-slate-900" value="rejected">Rejected</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          placeholder="Marks"
                          value={submissionEdits[submission.id]?.awarded_marks || ''}
                          onChange={(event) =>
                            setSubmissionEdits((prev) => ({
                              ...prev,
                              [submission.id]: {
                                status: prev[submission.id]?.status || submission.status,
                                awarded_marks: event.target.value,
                                admin_feedback: prev[submission.id]?.admin_feedback || '',
                                allow_resubmit: prev[submission.id]?.allow_resubmit || false
                              }
                            }))
                          }
                          className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-xs text-white w-[90px]"
                        />
                        <input
                          type="text"
                          placeholder="Review message"
                          value={submissionEdits[submission.id]?.admin_feedback || ''}
                          onChange={(event) =>
                            setSubmissionEdits((prev) => ({
                              ...prev,
                              [submission.id]: {
                                status: prev[submission.id]?.status || submission.status,
                                awarded_marks: prev[submission.id]?.awarded_marks || '',
                                admin_feedback: event.target.value,
                                allow_resubmit: prev[submission.id]?.allow_resubmit || false
                              }
                            }))
                          }
                          className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-xs text-white min-w-[200px] flex-1"
                        />
                        <label className="flex items-center gap-2 text-xs text-white/60">
                          <input
                            type="checkbox"
                            checked={submissionEdits[submission.id]?.allow_resubmit || false}
                            disabled={(submissionEdits[submission.id]?.status || submission.status) !== 'rejected'}
                            onChange={(event) =>
                              setSubmissionEdits((prev) => ({
                                ...prev,
                                [submission.id]: {
                                  status: prev[submission.id]?.status || submission.status,
                                  awarded_marks: prev[submission.id]?.awarded_marks || '',
                                  admin_feedback: prev[submission.id]?.admin_feedback || '',
                                  allow_resubmit: event.target.checked
                                }
                              }))
                            }
                          />
                          Allow resubmit
                        </label>
                        <div className="ml-auto">
                          <button
                            type="button"
                            onClick={() => void saveSubmissionReview(submission.id)}
                            className="rounded-md bg-emerald-500/90 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                            disabled={savingSubmissionId === submission.id}
                          >
                            {savingSubmissionId === submission.id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
  return isPage ? (
    <div className="w-full flex justify-center">{content}</div>
  ) : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      style={{ paddingTop: '100px', paddingBottom: '100px' }}
    >
      <div style={{ maxHeight: 'calc(100vh - 200px)' }} className="w-full max-w-2xl overflow-y-auto">
        {content}
      </div>
    </div>
  )
}

export default StudentDetailsModal
