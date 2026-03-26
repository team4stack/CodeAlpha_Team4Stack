import React, { useEffect, useMemo, useState } from 'react'
import { coursesApi } from '@/lib/api'
import type { StudentProgress } from '../types'

interface StudentDetailsModalProps {
  selectedStudent: StudentProgress | null
  isOpen: boolean
  onClose: () => void
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  selectedStudent,
  isOpen,
  onClose
}) => {
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<
    Array<{
      id: number
      assignment_title: string
      course_id: number
      file_url: string
      file_name: string
      status: string
      submitted_at?: string
    }>
  >([])

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
        setAssignmentSubmissions(
          Array.isArray(result.data)
            ? (result.data as Array<{
                id: number
                assignment_title: string
                course_id: number
                file_url: string
                file_name: string
                status: string
                submitted_at?: string
              }>)
            : []
        )
      } catch {
        setAssignmentSubmissions([])
      } finally {
        setSubmissionsLoading(false)
      }
    }
    void loadSubmissions()
  }, [isOpen, selectedStudent])

  if (!isOpen || !selectedStudent) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      style={{ paddingTop: '100px', paddingBottom: '100px' }}
    >
      <div
        className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl font-black text-white">
              {selectedStudent.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{selectedStudent.userName}</h2>
              <p className="text-sm text-white/60">{selectedStudent.userEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-300 hover:text-red-200 font-bold transition-all duration-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Roll Number</div>
              <div className="text-lg font-black text-purple-300">{selectedStudent.rollNumber || 'N/A'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">CNIC Number</div>
              <div className="text-lg font-black text-purple-300 break-all font-mono">{selectedStudent.cnic || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Total Courses</div>
              <div className="text-lg font-black text-white">{selectedStudent.totalCourses}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Videos Completed</div>
              <div className="text-lg font-black text-green-400">{selectedStudent.totalVideosCompleted}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2">
              <div className="text-xs text-white/60 mb-1">Email</div>
              <div className="text-sm font-bold text-white/80 truncate">{selectedStudent.userEmail}</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-3">Course Progress</h3>
            <div className="space-y-3">
              {selectedStudent.enrolledCourses.map((course) => (
                <div key={course.courseId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white">{course.courseName}</h4>
                    <span className="text-sm font-black text-white/80">
                      {course.completedVideos} / {course.totalVideos} Videos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.progressPercentage === 100
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                            : course.progressPercentage >= 50
                              ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                              : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        }`}
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-white min-w-[50px] text-right">
                      {course.progressPercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-3">Uploaded Assignments</h3>
            {submissionsLoading ? (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm text-white/70">
                Loading uploaded assignments...
              </div>
            ) : assignmentSubmissions.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm text-white/70">
                This student has not uploaded any assignment files yet.
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-sm font-bold text-white">{submission.assignment_title}</p>
                    <p className="text-xs text-white/60 mt-1">
                      Course: {courseNameById.get(String(submission.course_id)) || `Course ${submission.course_id}`}
                    </p>
                    <p className="text-xs text-white/60">Status: {submission.status}</p>
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
                    >
                      Download {submission.file_name}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailsModal
