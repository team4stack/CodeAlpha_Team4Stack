import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface StackStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StackStoreModal: React.FC<StackStoreModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}
      />

      {/* Panel */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        <div
          ref={panelRef}
          className={`w-full max-w-xl mx-4 rounded-2xl border p-6 md:p-8 shadow-2xl transform transition-all duration-300 ${
            isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
          } ${
            isDarkMode
              ? 'bg-gray-900/95 border-gray-700 text-white'
              : 'bg-white/95 border-gray-200 text-gray-800'
          } backdrop-blur-xl`}
          role="dialog"
          aria-modal="true"
          aria-label="StackStore Coming Soon"
        >
          {/* Fun neon background accents */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-gradient-to-tr from-purple-600/30 to-emerald-400/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-pink-500/30 blur-3xl" />
          </div>

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex flex-col gap-2">
              <span className={`self-start text-[10px] px-2 py-1 rounded-md uppercase tracking-widest ${
                isDarkMode ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'
              }`}>Coming soon</span>
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">StackStore</h2>
              <p className="mt-1 text-sm opacity-80">A new hub for student‑built projects.</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label="Close StackStore"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5 leading-relaxed relative z-10">
            <p>
              Team4Stack StackStore is a playful marketplace where students can <strong>showcase</strong>,
              <strong>share</strong>, and <strong>sell</strong> their projects — all in one place.
            </p>
            <p>
              List your web apps, tools, and creative builds. Let buyers explore, test, and purchase — powered by a
              fast and safe flow. 💸
            </p>
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <li className="rounded-lg px-3 py-2 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-white/10">Upload your project 🚀</li>
                <li className="rounded-lg px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-white/10">Set your price 💰</li>
                <li className="rounded-lg px-3 py-2 bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 border border-white/10">Earn and get feedback ⭐</li>
              </ul>
            </div>
            <div className="relative h-2 mt-2 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400 opacity-30" />
              <div className="absolute -top-1 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-x" />
            </div>
            <p>Beta is brewing — get ready to launch! 👩‍💻👨‍💻</p>
          </div>

          <div className="mt-6 text-xs opacity-80 text-center relative z-10">
            Launching soon on Team4Stack — “By Students, For Students.” 🌟
          </div>
        </div>
      </div>
    </>
  );
};

export default StackStoreModal;


