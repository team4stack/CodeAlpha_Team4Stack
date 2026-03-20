'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
        className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
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
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-1 text-[10px] font-bold text-white shadow">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 z-[10002] mt-2 w-[min(100vw-2rem,22rem)] max-h-[min(70vh,24rem)] overflow-hidden rounded-xl border shadow-2xl ${
            isDarkMode ? 'border-white/10 bg-gray-900/95 backdrop-blur-xl' : 'border-gray-200 bg-white'
          }`}
        >
          <div
            className={`flex items-center justify-between border-b px-3 py-2 ${
              isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Course updates
            </span>
            <button
              type="button"
              onClick={() => void load()}
              className={`text-xs font-medium ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              Refresh
            </button>
          </div>
          <div className="max-h-[min(60vh,20rem)] overflow-y-auto custom-scrollbar">
            {loading && items.length === 0 ? (
              <p className={`px-3 py-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className={`px-3 py-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No notifications yet. Your instructor will post updates here.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void markRead(n)}
                      className={`w-full px-3 py-3 text-left transition-colors ${
                        !n.read_at
                          ? isDarkMode
                            ? 'bg-cyan-500/10'
                            : 'bg-purple-50'
                          : isDarkMode
                            ? 'hover:bg-white/5'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read_at && (
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
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
        </div>
      )}
    </div>
  );
}
