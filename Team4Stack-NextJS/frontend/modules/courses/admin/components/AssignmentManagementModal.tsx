'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'

type Assignment = {
  id: number
  course_id: number
  video_id: number
  title: string
  instructions?: string | null
  required_format?: string | null
  max_file_size_mb: number
  total_marks: number
  template_file_url?: string | null
  template_file_name?: string | null
  template_file_type?: string | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  videoId: number
  videoTitle: string
  courseId: number
}

const AssignmentManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  courseId
}) => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null)
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null)
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    instructions: '',
    required_format: '',
    max_file_size_mb: 10,
    total_marks: 10,
    template_file_url: '',
    template_file_name: '',
    template_file_type: ''
  })

  const toDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Failed to read file data'))
          return
        }
        resolve(reader.result)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

  const resetForm = () => {
    setEditingAssignmentId(null)
    setAssignmentFile(null)
    setAssignmentForm({
      title: '',
      instructions: '',
      required_format: '',
      max_file_size_mb: 10,
      total_marks: 10,
      template_file_url: '',
      template_file_name: '',
      template_file_type: ''
    })
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const assignmentRes = await coursesApi.getAssignmentsByVideo(videoId)
      if (assignmentRes.error) throw new Error(assignmentRes.error)

      const assignmentRows = Array.isArray(assignmentRes.data) ? (assignmentRes.data as Assignment[]) : []

      setAssignments(assignmentRows)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load assignments')
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    resetForm()
    void loadData()
  }, [isOpen, videoId])

  const saveAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingAssignment(true)
      let templateFileUrl = assignmentForm.template_file_url.trim()
      let templateFileName = assignmentForm.template_file_name.trim()
      let templateFileType = assignmentForm.template_file_type.trim()

      if (assignmentFile) {
        const dataUrl = await toDataUrl(assignmentFile)
        const uploadRes = await coursesApi.uploadAssignmentFileToCloudinary(
          dataUrl,
          assignmentFile.name,
          'team4stack/course-assignment-templates'
        )
        if (uploadRes.error || !uploadRes.data) {
          throw new Error(uploadRes.error || 'Failed to upload assignment template')
        }
        const uploaded = uploadRes.data as { secure_url?: string }
        templateFileUrl = String(uploaded.secure_url || '')
        templateFileName = assignmentFile.name
        templateFileType = assignmentFile.type
      }

      const payload = {
        course_id: courseId,
        video_id: videoId,
        title: assignmentForm.title.trim(),
        instructions: assignmentForm.instructions.trim() || null,
        required_format: assignmentForm.required_format.trim() || null,
        max_file_size_mb: assignmentForm.max_file_size_mb,
        total_marks: assignmentForm.total_marks,
        template_file_url: templateFileUrl || null,
        template_file_name: templateFileName || null,
        template_file_type: templateFileType || null
      }

      if (!payload.title) {
        throw new Error('Assignment title is required')
      }

      const result = editingAssignmentId
        ? await coursesApi.updateAssignment(editingAssignmentId, payload)
        : await coursesApi.createAssignment(payload)
      if (result.error) throw new Error(result.error)

      toast.success(editingAssignmentId ? 'Assignment updated successfully' : 'Assignment created successfully')
      resetForm()
      await loadData()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save assignment')
    } finally {
      setSavingAssignment(false)
    }
  }

  const startEdit = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id)
    setAssignmentFile(null)
    setAssignmentForm({
      title: assignment.title || '',
      instructions: assignment.instructions || '',
      required_format: assignment.required_format || '',
      max_file_size_mb: assignment.max_file_size_mb || 10,
      total_marks: assignment.total_marks || 10,
      template_file_url: assignment.template_file_url || '',
      template_file_name: assignment.template_file_name || '',
      template_file_type: assignment.template_file_type || ''
    })
  }

  const removeAssignment = async (assignmentId: number) => {
    if (!globalThis.confirm('Are you sure you want to delete this assignment?')) return
    try {
      const result = await coursesApi.deleteAssignment(assignmentId)
      if (result.error) throw new Error(result.error)
      toast.success('Assignment deleted')
      await loadData()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete assignment')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col ${
          isDarkMode ? 'border border-gray-700' : 'border border-gray-200'
        }`}
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        <div className="bg-linear-to-r from-emerald-600 to-cyan-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Assignment Management</h2>
            <p className="text-emerald-100 text-sm">Video: {videoTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white hover:bg-red-500/30 rounded-full p-1.5 transition-all"
            aria-label="Close assignment modal"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
            </div>
          ) : (
            <>
              <section className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingAssignmentId ? 'Edit Assignment' : 'Create Assignment'}
                </h3>
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fill required fields clearly. Students will see these instructions and download the attached template file.
                </p>
                <form onSubmit={saveAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assignment-title" className="block text-sm font-medium mb-1">
                      Assignment title *
                    </label>
                    <input
                      id="assignment-title"
                      type="text"
                      placeholder="e.g. Module 1 Mini Project"
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="assignment-format" className="block text-sm font-medium mb-1">
                      Required format
                    </label>
                    <input
                      id="assignment-format"
                      type="text"
                      placeholder="e.g. PDF report + screenshots"
                      value={assignmentForm.required_format}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, required_format: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="assignment-instructions" className="block text-sm font-medium mb-1">
                      Instructions for students
                    </label>
                    <textarea
                      id="assignment-instructions"
                      placeholder="Explain exact requirements, expected output, and submission checklist."
                      value={assignmentForm.instructions}
                      onChange={(e) => setAssignmentForm((prev) => ({ ...prev, instructions: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="assignment-size" className="block text-sm font-medium mb-1">
                      Max file size (MB)
                    </label>
                    <input
                      id="assignment-size"
                      type="number"
                      min={1}
                      max={100}
                      value={assignmentForm.max_file_size_mb}
                      onChange={(e) =>
                        setAssignmentForm((prev) => ({
                          ...prev,
                          max_file_size_mb: Number.parseInt(e.target.value, 10) || 10
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="assignment-marks" className="block text-sm font-medium mb-1">
                      Total marks
                    </label>
                    <input
                      id="assignment-marks"
                      type="number"
                      min={0}
                      value={assignmentForm.total_marks}
                      onChange={(e) =>
                        setAssignmentForm((prev) => ({
                          ...prev,
                          total_marks: Number.parseInt(e.target.value, 10) || 0
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="assignment-template-file" className="block text-sm font-medium mb-1">
                      Attach template (PDF / DOC / DOCX)
                    </label>
                    <input
                      id="assignment-template-file"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                    {assignmentForm.template_file_url ? (
                      <a
                        href={assignmentForm.template_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-2 text-sm text-cyan-600 hover:underline dark:text-cyan-400"
                      >
                        Current template: {assignmentForm.template_file_name || 'Open file'}
                      </a>
                    ) : null}
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={savingAssignment}
                      className="px-4 py-2 rounded-lg text-white bg-linear-to-r from-emerald-600 to-cyan-600 disabled:opacity-60"
                    >
                      {savingAssignment ? 'Saving...' : editingAssignmentId ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                    {editingAssignmentId ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="space-y-3">
                <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Existing Assignments</h3>
                {assignments.length === 0 ? (
                  <div className={`rounded-lg border p-3 text-sm ${isDarkMode ? 'border-gray-700 text-gray-300 bg-gray-900/20' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                    No assignments have been created for this lecture yet.
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <article key={assignment.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{assignment.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Max {assignment.max_file_size_mb}MB | Total marks: {assignment.total_marks}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(assignment)}
                            className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeAssignment(assignment.id)}
                            className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </section>

              <section className="space-y-3">
                <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Review Uploaded Work
                </h3>
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    isDarkMode ? 'border-gray-700 text-gray-300 bg-gray-900/20' : 'border-gray-200 text-gray-600 bg-gray-50'
                  }`}
                >
                  Student uploads are shown in the Student Progress page for centralized review and download.
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentManagementModal
