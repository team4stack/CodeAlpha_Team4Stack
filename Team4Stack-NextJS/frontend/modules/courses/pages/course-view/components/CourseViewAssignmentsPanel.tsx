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
    <section className={`rounded-xl border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignments</h3>
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <article key={assignment.id} className={`rounded-lg border p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{assignment.title}</p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Max file: {assignment.max_file_size_mb}MB | Marks: {assignment.total_marks}
            </p>
            {assignment.required_format ? (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{assignment.required_format}</p>
            ) : null}
            {assignment.instructions ? (
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{assignment.instructions}</p>
            ) : null}
            {assignment.template_file_url ? (
              <a
                href={assignment.template_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Download Template ({assignment.template_file_name || 'file'})
              </a>
            ) : null}

            <div className="mt-3 grid grid-cols-1 gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setFilesByAssignment((prev) => ({ ...prev, [assignment.id]: file }));
                }}
                className="text-sm"
              />
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

            {assignment.submission ? (
              <div className={`mt-3 rounded-lg p-2 text-xs ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                <p>
                  Last submission: <a href={assignment.submission.file_url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">{assignment.submission.file_name}</a>
                </p>
                <p>Status: {assignment.submission.status}</p>
                {typeof assignment.submission.awarded_marks === 'number' ? (
                  <p>Awarded marks: {assignment.submission.awarded_marks}</p>
                ) : null}
                {assignment.submission.admin_feedback ? <p>Feedback: {assignment.submission.admin_feedback}</p> : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
};

export default CourseViewAssignmentsPanel;
