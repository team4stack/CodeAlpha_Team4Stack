'use client'

import React, { useEffect, useState } from 'react';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

type CertificateApplication = {
  id: number;
  user_id: string;
  course_id: number;
  full_name: string;
  cnic: string;
  email: string;
  phone_number: string;
  roll_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  admin_notes?: string | null;
  certificate_url?: string | null;
  created_at?: string;
};

type CourseReport = {
  lectures: {
    total: number;
    completed: number;
    progress_percentage: number;
  };
  quizzes: {
    total: number;
    passed: number;
    total_marks: number;
    obtained_marks: number;
  };
};

const CertificateApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<CertificateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportByApp, setReportByApp] = useState<Record<number, CourseReport | null>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const result = await coursesApi.getCertificateApplications();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load certificate requests');
      }
      setRows(Array.isArray(result.data) ? (result.data as CertificateApplication[]) : []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load certificate requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const fetchReport = async (app: CertificateApplication) => {
    try {
      const result = await coursesApi.getStudentCourseReport(app.course_id, app.user_id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load report');
      }
      setReportByApp((prev) => ({ ...prev, [app.id]: (result.data as CourseReport) || null }));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load report');
    }
  };

  const updateApplication = async (app: CertificateApplication, patch: Partial<CertificateApplication>) => {
    try {
      setSavingId(app.id);
      const result = await coursesApi.updateCertificateApplication(app.id, {
        status: patch.status,
        admin_notes: patch.admin_notes ?? app.admin_notes ?? null,
        certificate_url: patch.certificate_url ?? app.certificate_url ?? null
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to update application');
      }
      setRows((prev) =>
        prev.map((row) => (row.id === app.id ? { ...row, ...(result.data as CertificateApplication) } : row))
      );
      toast.success('Certificate request updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update request');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/30 bg-linear-to-r from-cyan-500/85 to-blue-600/85 p-5 text-white shadow-xl">
        <h1 className="text-2xl font-bold">Certificate Applications</h1>
        <p className="mt-1 text-sm text-white/90">
          Review student requests, check report details, then approve and send certificate URL.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-t-2 border-cyan-400" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          No certificate applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((app) => (
            <article key={app.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{app.full_name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Course ID: {app.course_id} | Roll No: {app.roll_number}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {app.email} | {app.phone_number}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {app.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => void fetchReport(app)}
                    className="rounded-md border border-cyan-400 px-3 py-1 text-xs font-semibold text-cyan-600 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
                  >
                    View Report
                  </button>
                </div>
              </div>

              {reportByApp[app.id] ? (
                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Progress: {reportByApp[app.id]?.lectures.completed}/{reportByApp[app.id]?.lectures.total} (
                    {reportByApp[app.id]?.lectures.progress_percentage}%)
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Quizzes Passed: {reportByApp[app.id]?.quizzes.passed}/{reportByApp[app.id]?.quizzes.total}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Quiz Marks: {reportByApp[app.id]?.quizzes.obtained_marks}/{reportByApp[app.id]?.quizzes.total_marks}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <select
                  value={app.status}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((row) =>
                        row.id === app.id
                          ? { ...row, status: event.target.value as CertificateApplication['status'] }
                          : row
                      )
                    )
                  }
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="sent">sent</option>
                </select>
                <input
                  type="text"
                  value={app.certificate_url || ''}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((row) =>
                        row.id === app.id ? { ...row, certificate_url: event.target.value } : row
                      )
                    )
                  }
                  placeholder="Certificate URL (when sent)"
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  disabled={savingId === app.id}
                  onClick={() => void updateApplication(app, app)}
                  className="rounded-md bg-linear-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingId === app.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateApplicationsPage;
