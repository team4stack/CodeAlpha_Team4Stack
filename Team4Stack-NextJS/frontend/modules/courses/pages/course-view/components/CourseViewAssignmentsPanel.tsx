'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

type AssignmentWithSubmission = {
  id: number;
  course_id: number;
  video_id: number;
  title: string;
  instructions?: string | null;
  required_format?: string | null;
  max_file_size_mb: number;
  total_marks: number;
  template_file_url?: string | null;
  template_file_name?: string | null;
  submission?: {
    id: number;
    file_url: string;
    file_name: string;
    status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
    awarded_marks?: number | null;
    admin_feedback?: string | null;
  } | null;
};

interface CourseViewAssignmentsPanelProps {
  courseId: number;
  selectedVideoId: number;
  isDarkMode: boolean;
}

const CourseViewAssignmentsPanel: React.FC<CourseViewAssignmentsPanelProps> = ({
  courseId,
  selectedVideoId,
  isDarkMode
}) => {
  const [allAssignments, setAllAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [filesByAssignment, setFilesByAssignment] = useState<Record<number, File | null>>({});
  const [notesByAssignment, setNotesByAssignment] = useState<Record<number, string>>({});

  const assignments = useMemo(
    () => allAssignments.filter((assignment) => assignment.video_id === selectedVideoId),
    [allAssignments, selectedVideoId]
  );

  const toDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const result = await coursesApi.getAssignmentsByCourse(courseId);
      if (result.error) throw new Error(result.error);
      setAllAssignments(Array.isArray(result.data) ? (result.data as AssignmentWithSubmission[]) : []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load assignments');
      setAllAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    void loadAssignments();
  }, [courseId]);

  const submitAssignment = async (assignment: AssignmentWithSubmission) => {
    const file = filesByAssignment[assignment.id];
    if (!file) {
      toast.error('Please choose a file first');
      return;
    }
    const maxBytes = Math.max(1, Number(assignment.max_file_size_mb || 10)) * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File exceeds ${assignment.max_file_size_mb}MB limit`);
      return;
    }
    const allowedMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedMime.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    try {
      setSubmittingId(assignment.id);
      const dataUrl = await toDataUrl(file);
      const uploadResult = await coursesApi.uploadAssignmentFileToCloudinary(
        dataUrl,
        file.name,
        'team4stack/course-assignment-submissions'
      );
      if (uploadResult.error || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Failed to upload assignment file');
      }
      const uploadData = uploadResult.data as { secure_url?: string };
      const submitResult = await coursesApi.submitAssignment(assignment.id, {
        file_url: String(uploadData.secure_url || ''),
        file_name: file.name,
        file_type: file.type,
        student_notes: (notesByAssignment[assignment.id] || '').trim() || null
      });
      if (submitResult.error) throw new Error(submitResult.error);
      toast.success('Assignment submitted successfully');
      setFilesByAssignment((prev) => ({ ...prev, [assignment.id]: null }));
      await loadAssignments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-6 ${
        isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignments</h3>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Upload your work for this lecture
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <article
            key={assignment.id}
            className={`rounded-xl border p-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{assignment.title}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Max {assignment.max_file_size_mb}MB · Marks {assignment.total_marks}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {assignment.required_format ? (
                    <span className={`rounded-full px-2.5 py-1 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'}`}>
                      Format {assignment.required_format}
                    </span>
                  ) : null}
                </div>
              </div>
              {assignment.template_file_url ? (
                <a
                  href={assignment.template_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-cyan-600 bg-cyan-500/10 border border-cyan-500/20 hover:underline dark:text-cyan-300"
                >
                  Download Template
                  <span className="opacity-70">({assignment.template_file_name || 'file'})</span>
                </a>
              ) : null}
            </div>

            {assignment.instructions ? (
              <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{assignment.instructions}</p>
            ) : null}

            {assignment.submission ? null : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div
                  className={`rounded-lg border px-3 py-3 ${
                    isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Choose file
                      </p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {filesByAssignment[assignment.id]?.name || 'No file selected'}
                      </p>
                    </div>
                    <label
                      htmlFor={`assignment-file-${assignment.id}`}
                      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold cursor-pointer border ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700'
                          : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Browse
                    </label>
                    <input
                      id={`assignment-file-${assignment.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,application/zip"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setFilesByAssignment((prev) => ({ ...prev, [assignment.id]: file }));
                      }}
                      className="hidden"
                    />
                  </div>
                  <p className={`mt-2 text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Allowed: PDF, DOC, DOCX, PNG, ZIP
                  </p>
                </div>

                <textarea
                  value={notesByAssignment[assignment.id] || ''}
                  onChange={(event) =>
                    setNotesByAssignment((prev) => ({ ...prev, [assignment.id]: event.target.value }))
                  }
                  placeholder="Optional note for admin"
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                />
                <button
                  type="button"
                  disabled={submittingId === assignment.id}
                  onClick={() => void submitAssignment(assignment)}
                  className="w-fit px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-cyan-600 disabled:opacity-60"
                >
                  {submittingId === assignment.id ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            )}

            {assignment.submission ? (
              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                  isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {typeof assignment.submission.awarded_marks === 'number' ? (
                  <>
                    <p>Status: {assignment.submission.status}</p>
                    <p>Awarded marks: {assignment.submission.awarded_marks}</p>
                    {assignment.submission.admin_feedback ? <p>Feedback: {assignment.submission.admin_feedback}</p> : null}
                  </>
                ) : (
                  // While under review, show only status (no file link, no resubmission UI).
                  <p>Status: Under review</p>
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
};

export default CourseViewAssignmentsPanel;
