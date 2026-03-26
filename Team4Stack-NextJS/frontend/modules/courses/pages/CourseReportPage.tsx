'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentNavbar from '@/navigation/StudentNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

type CourseReport = {
  course: {
    id: number;
    title: string;
    description?: string;
    thumbnail_url?: string;
  };
  lectures: {
    total: number;
    completed: number;
    progress_percentage: number;
    total_time_seconds: number;
    watched_time_seconds: number;
  };
  quizzes: {
    total: number;
    passed: number;
    total_marks: number;
    obtained_marks: number;
  };
  assignments: {
    total: number;
    uploaded: number;
    unuploaded: number;
    total_marks: number;
    obtained_marks: number;
  };
  certificate: {
    eligible: boolean;
    application_status: 'not_applied' | 'pending' | 'approved' | 'rejected' | 'sent';
    application_id?: number;
    certificate_url?: string | null;
  };
};

interface CourseReportPageProps {
  courseId?: string;
}

const CourseReportPage: React.FC<CourseReportPageProps> = ({ courseId: courseIdProp }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const courseId = courseIdProp || null;
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<CourseReport | null>(null);
  const [certificateForm, setCertificateForm] = useState({
    full_name: '',
    cnic: '',
    email: '',
    phone_number: '',
    roll_number: ''
  });
  const [submittingCertificate, setSubmittingCertificate] = useState(false);

  const loadReport = async () => {
    if (!courseId || !user?.id) return;
    try {
      setLoading(true);
      const result = await coursesApi.getStudentCourseReport(courseId, user.id);
      if (result.error) {
        throw new Error(result.error);
      }
      const reportData = (result.data as CourseReport) || null;
      setReport(reportData);
      if (reportData && user) {
        setCertificateForm((prev) => ({
          ...prev,
          email: prev.email || user.email || ''
        }));
      }
    } catch (error: any) {
      toast.error(error?.message || 'Could not load course report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, [courseId, user?.id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <StudentNavbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <StudentNavbar />
        <div className="pt-24 px-4">
          <div
            className={`mx-auto max-w-3xl rounded-xl border p-6 text-center ${
              isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <p className="mb-4 font-semibold">Report not found.</p>
            <button
              type="button"
              onClick={() => router.push('/student/courses')}
              className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold text-white"
            >
              Back to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lectureProgress = `${report.lectures.completed} / ${report.lectures.total}`;
  const quizMarks = `${report.quizzes.obtained_marks} / ${report.quizzes.total_marks}`;
  const assignmentMarks = `${report.assignments.obtained_marks} / ${report.assignments.total_marks}`;
  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const certificateStatusLabel = {
    not_applied: 'Not Applied',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    sent: 'Sent'
  }[report.certificate.application_status];

  const handleApplyCertificate = async () => {
    if (!courseId) return;
    if (!report.certificate.eligible) {
      toast.error('Complete this course first to apply for certificate.');
      return;
    }
    const requiredValues = [
      certificateForm.full_name,
      certificateForm.cnic,
      certificateForm.email,
      certificateForm.phone_number,
      certificateForm.roll_number
    ];
    if (requiredValues.some((value) => !value.trim())) {
      toast.error('Please fill all certificate fields.');
      return;
    }

    try {
      setSubmittingCertificate(true);
      const result = await coursesApi.applyForCertificate({
        course_id: courseId,
        ...certificateForm
      });
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Certificate request submitted.');
      await loadReport();
    } catch (error: any) {
      toast.error(error?.message || 'Could not submit certificate request');
    } finally {
      setSubmittingCertificate(false);
    }
  };

  const handleDownloadReportPdf = () => {
    if (!report || !user) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Watermark background
    doc.setTextColor(236, 240, 248);
    doc.setFontSize(40);
    doc.text('TEAM4STACK', 105, 90, { align: 'center', angle: 35 });
    doc.text('TEAM4STACK', 105, 170, { align: 'center', angle: 35 });

    doc.setTextColor(22, 28, 45);
    doc.setFontSize(18);
    doc.text('Team4Stack Course Progress Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 86, 105);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Student: ${user.email || 'N/A'}`, 14, 34);

    doc.setTextColor(22, 28, 45);
    doc.setFontSize(13);
    doc.text(`Course: ${report.course.title}`, 14, 44);

    doc.setFontSize(11);
    let y = 54;
    const row = (label: string, value: string) => {
      doc.setTextColor(70, 75, 92);
      doc.text(label, 16, y);
      doc.setTextColor(20, 26, 44);
      doc.text(value, 82, y);
      y += 8;
    };

    row('Lecture Progress', `${report.lectures.completed} / ${report.lectures.total} (${report.lectures.progress_percentage}%)`);
    row('Total Course Time', formatDuration(report.lectures.total_time_seconds));
    row('Watched Time', formatDuration(report.lectures.watched_time_seconds));
    row('Total Quizzes', String(report.quizzes.total));
    row('Quizzes Passed', String(report.quizzes.passed));
    row('Quiz Marks', `${report.quizzes.obtained_marks} / ${report.quizzes.total_marks}`);
    row('Assignments Total', String(report.assignments.total));
    row('Assignments Uploaded', String(report.assignments.uploaded));
    row('Assignments Unuploaded', String(report.assignments.unuploaded));
    row('Assignment Marks', `${report.assignments.obtained_marks} / ${report.assignments.total_marks}`);
    row('Certificate Status', certificateStatusLabel);

    y += 8;
    doc.setTextColor(90, 96, 115);
    doc.setFontSize(10);
    doc.text(
      'This report is system-generated by Team4Stack and reflects current progress records.',
      14,
      y
    );

    doc.save(`team4stack-report-course-${report.course.id}.pdf`);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentNavbar />
      <div className="pt-20 pb-10">
        <div className="container-custom">
          <div
            className={`rounded-2xl border p-5 sm:p-6 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Course Report
                </h1>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {report.course.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/student/courses/view/${report.course.id}`)}
                className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Open Course
              </button>
              <button
                type="button"
                onClick={handleDownloadReportPdf}
                className="rounded-lg border border-cyan-500/70 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lectures</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lectureProgress}</p>
              <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>{report.lectures.progress_percentage}% complete</p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Time</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(report.lectures.total_time_seconds)}
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Watched Time</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(report.lectures.watched_time_seconds)}
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Quizzes</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.quizzes.total}</p>
              <p className={`text-sm ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{report.quizzes.passed} passed</p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quiz Marks</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{quizMarks}</p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Assignments</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.assignments.total}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Marks: {assignmentMarks}</p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uploaded Assignments</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.assignments.uploaded}</p>
            </div>
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unuploaded Assignments</p>
              <p className={`mt-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.assignments.unuploaded}</p>
            </div>
          </div>

          <div className={`mt-6 rounded-2xl border p-5 sm:p-6 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Certificate Section</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  report.certificate.application_status === 'sent'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : report.certificate.application_status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300'
                      : report.certificate.application_status === 'approved'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : report.certificate.application_status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                }`}
              >
                {certificateStatusLabel}
              </span>
            </div>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Only students with completed course status can apply. Complete status requires all lectures + required quizzes.
            </p>

            {report.certificate.certificate_url ? (
              <a
                href={report.certificate.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-cyan-400 hover:underline"
              >
                Open issued certificate
              </a>
            ) : null}

            {report.certificate.eligible &&
            (report.certificate.application_status === 'not_applied' ||
              report.certificate.application_status === 'rejected') ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={certificateForm.full_name}
                  onChange={(event) =>
                    setCertificateForm((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                  placeholder="Full Name"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <input
                  type="text"
                  value={certificateForm.cnic}
                  onChange={(event) =>
                    setCertificateForm((prev) => ({ ...prev, cnic: event.target.value }))
                  }
                  placeholder="CNIC / B-Form"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <input
                  type="email"
                  value={certificateForm.email}
                  onChange={(event) =>
                    setCertificateForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Email"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <input
                  type="text"
                  value={certificateForm.phone_number}
                  onChange={(event) =>
                    setCertificateForm((prev) => ({ ...prev, phone_number: event.target.value }))
                  }
                  placeholder="Phone Number"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <input
                  type="text"
                  value={certificateForm.roll_number}
                  onChange={(event) =>
                    setCertificateForm((prev) => ({ ...prev, roll_number: event.target.value }))
                  }
                  placeholder="Roll Number"
                  className={`rounded-lg border px-3 py-2 text-sm sm:col-span-2 ${
                    isDarkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => void handleApplyCertificate()}
                  disabled={submittingCertificate}
                  className="sm:col-span-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submittingCertificate
                    ? 'Submitting...'
                    : report.certificate.application_status === 'rejected'
                      ? 'Re-Apply for Certificate'
                      : 'Apply for Certificate'}
                </button>
              </div>
            ) : (
              <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {!report.certificate.eligible
                  ? 'Certificate application is locked until this course is complete.'
                  : 'Your certificate request is already submitted. Admin will review and send it.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReportPage;
