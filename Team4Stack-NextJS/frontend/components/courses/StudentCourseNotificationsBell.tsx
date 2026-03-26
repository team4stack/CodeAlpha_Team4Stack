'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export type CourseNotificationItem = {
  id: number;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
  created_by_email?: string | null;
};

type Props = {
  email: string;
  isScrolled: boolean;
  isDarkMode: boolean;
};

export default function StudentCourseNotificationsBell({ email, isScrolled, isDarkMode }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CourseNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const pageSize = 6;

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await coursesApi.getStudentNotifications(email);
      if (res.success && res.data) {
        setItems(res.data as CourseNotificationItem[]);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 120_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const unread = items.filter((n) => !n.read_at).length;
  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [items]
  );
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedItems = sortedItems.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const markRead = async (n: CourseNotificationItem) => {
    if (n.read_at) return;
    try {
      const res = await coursesApi.markStudentNotificationRead(n.id, email);
      if (res.success) {
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
        );
      } else {
        toast.error(res.error || 'Could not update notification');
      }
    } catch {
      toast.error('Could not update notification');
    }
  };

  const iconMuted =
    isScrolled && !isDarkMode ? 'text-gray-700 hover:text-orange-600' : 'text-white/90 hover:text-orange-300';

  const panelContent = (
    <>
      <div
        className={`flex items-center justify-between border-b px-3 py-2 ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}
      >
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Course updates
        </span>
        <button
          type="button"
          onClick={() => void load()}
          className={`btn-plain text-xs font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
        >
          Refresh
        </button>
      </div>
      <div className="max-h-[min(60vh,20rem)] overflow-y-auto custom-scrollbar">
        {loading && sortedItems.length === 0 ? (
          <p className={`px-3 py-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading…
          </p>
        ) : sortedItems.length === 0 ? (
          <p className={`px-3 py-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No notifications yet. Your instructor will post updates here.
          </p>
        ) : (
          <ul className="space-y-2 p-2">
            {pagedItems.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void markRead(n)}
                  className={`btn-plain student-notification-item w-full px-3 py-3 text-left transition-colors ${
                    isDarkMode
                      ? 'rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800'
                      : 'rounded-lg border border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      {n.body ? (
                        <p className={`mt-1 whitespace-pre-wrap text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {n.body}
                        </p>
                      ) : null}
                      <p className={`mt-1 text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {sortedItems.length > 0 && totalPages > 1 && (
        <div className={`flex items-center justify-between border-t px-3 py-2 ${isDarkMode ? 'border-white/15' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className={`btn-plain rounded-md px-2.5 py-1 text-xs font-medium ${
              safePage <= 1
                ? 'cursor-not-allowed opacity-50'
                : isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Prev
          </button>
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className={`btn-plain rounded-md px-2.5 py-1 text-xs font-medium ${
              safePage >= totalPages
                ? 'cursor-not-allowed opacity-50'
                : isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="relative inline-flex shrink-0 overflow-visible pr-1 pt-1 -mr-1 -mt-1" ref={panelRef} style={{ zIndex: 1000 }}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
        className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-visible rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isScrolled
            ? isDarkMode
              ? 'bg-white/10 border border-white/20 hover:bg-white/15'
              : 'bg-gray-100/90 border border-gray-200 hover:bg-gray-200'
            : 'bg-white/10 border border-white/20 hover:bg-white/15'
        }`}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <svg className={`h-5 w-5 ${iconMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
      {unread > 0 && (
        <span className="pointer-events-none absolute right-0 top-0 z-30 flex h-5 min-w-[20px] translate-x-[20%] -translate-y-[20%] items-center justify-center rounded-full border-2 border-white bg-linear-to-r from-rose-500 to-orange-500 px-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/40 dark:border-gray-900">
          {unread > 99 ? '99+' : unread}
        </span>
      )}

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications panel"
            className="btn-plain student-notifications-overlay fixed inset-0 z-10000 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className={`student-notifications-panel student-notifications-panel-mobile fixed inset-x-2 top-16 z-10002 max-h-[75vh] overflow-hidden rounded-xl border md:hidden ${
              isDarkMode
                ? 'border-gray-700 bg-gray-950 shadow-none backdrop-blur-none'
                : 'border-gray-200 bg-white shadow-none backdrop-blur-none'
            }`}
          >
            {panelContent}
          </div>
          <div
            className={`student-notifications-panel student-notifications-panel-desktop fixed right-2 top-16 z-10002 hidden w-[min(100vw-2rem,22rem)] max-h-[min(70vh,24rem)] overflow-hidden rounded-xl border md:block ${
              isDarkMode
                ? 'border-gray-700 bg-gray-950 shadow-none backdrop-blur-none'
                : 'border-gray-200 bg-white shadow-none backdrop-blur-none'
            }`}
          >
            {panelContent}
          </div>
        </>
      )}
    </div>
  );
}
