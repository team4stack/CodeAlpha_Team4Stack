'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/lib/auth/components/AuthModal';

const CoursesNavbar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <nav
      className={`navbar-fixed transition-all duration-300 ${
        isDarkMode
          ? 'nav-glass shadow-lg'
          : 'bg-white/90 shadow-lg border-b border-gray-200'
      }`}
    >
      <div className="container-custom px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo / Brand */}
          <button
            type="button"
            className="btn-plain flex items-center space-x-1 sm:space-x-2 group focus:outline-none rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
            aria-label="Back to main website"
            onClick={() => router.push('/')}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-transparent' : 'bg-black'
              } transition-all duration-300`}
              style={{
                minWidth: '32px',
                minHeight: '32px',
                padding: isDarkMode ? '0' : '4px',
              }}
            >
              <img
                src={
                  isDarkMode
                    ? `/Team4Stack_Transparant.svg`
                    : `/Team4StackLogo.svg`
                }
                alt="Team4Stack Logo"
                className="rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-contain"
                style={{ width: '100%', height: '100%', display: 'block' }}
                loading="eager"
              />
            </div>
            <span
              className={`text-base sm:text-xl font-display font-bold ${
                isDarkMode ? 'text-white' : 'text-black'
              } group-hover:text-purple-300 transition-all duration-300 hidden sm:inline`}
            >
              Team4Stack
            </span>
            </button>

          {/* Right-side actions for courses area */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Simple text buttons - hide on very small screens */}
            <button
              type="button"
              className="btn-plain px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              onClick={() => router.push('/courses')}
            >
              Courses
            </button>
            <button
              type="button"
              className="btn-plain px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors hidden md:block"
              onClick={() => router.push('/student/courses')}
            >
              My Courses
            </button>
            <button
              type="button"
              className="btn-plain px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-colors"
              onClick={() => router.push('/courses/apply')}
            >
              <span className="hidden sm:inline">Apply</span>
              <span className="sm:hidden">Apply</span>
            </button>

            {/* Login button – same style as main site */}
            {!loading && (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] transition-all hover:scale-110 flex items-center justify-center focus:outline-none flex-shrink-0"
                aria-label={user ? 'Account' : 'Sign In'}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth modal for courses area */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialError={null}
      />
    </nav>
  );
};

export default CoursesNavbar;
