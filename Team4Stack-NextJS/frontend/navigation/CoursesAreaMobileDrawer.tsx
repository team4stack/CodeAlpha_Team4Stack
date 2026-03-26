'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

export type CoursesAreaMobileItem = {
  label: string;
  onNavigate: () => void;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  items: CoursesAreaMobileItem[];
  /** Match navbar height: courses/student use h-14 sm:h-16 */
  topOffsetClass?: string;
};

/**
 * Slide-in panel + overlay — same visual language as landing `MobileNavigation`
 * (blur, rounded-r-3xl, slate panel).
 */
const CoursesAreaMobileDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  topOffsetClass = 'top-14 sm:top-16',
}) => {
  const { isDarkMode } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset';
      return;
    }
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  const itemClass = `w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 ${
    isDarkMode
      ? 'text-white hover:bg-white/10 hover:border-white/15'
      : 'text-gray-800 hover:bg-gray-100 hover:border-gray-200'
  }`;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="courses-area-overlay"
            className={`fixed inset-x-0 bottom-0 z-[10040] bg-black/60 backdrop-blur-[2px] ${topOffsetClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={onClose}
            role="presentation"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="courses-area-panel"
            className={`mobile-nav-panel fixed left-0 w-[16.5rem] max-w-[85vw] z-[10050] shadow-2xl overflow-hidden rounded-r-3xl rounded-l-none ${topOffsetClass} ${
              isDarkMode
                ? 'bg-slate-950/85 text-white border-r border-white/10'
                : 'bg-white/85 text-slate-900 border-r border-slate-900/10'
            } backdrop-blur-xl max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)]`}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Course menu"
          >
            <div className={`h-12 border-b shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
            <div className="overflow-y-auto py-4 px-4 space-y-2 max-h-[calc(100vh-7rem)]">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    item.onNavigate();
                    onClose();
                  }}
                  role="menuitem"
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoursesAreaMobileDrawer;
