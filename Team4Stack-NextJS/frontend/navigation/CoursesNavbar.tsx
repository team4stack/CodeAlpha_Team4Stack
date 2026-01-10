'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/lib/auth/components/AuthModal';

const CoursesNavbar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Fixed navbar with transparent when at top, solid when scrolled */}
      <nav
        className={`navbar-fixed transition-all duration-300 overflow-hidden ${
          isScrolled
            ? (isDarkMode
                ? 'nav-glass shadow-lg scrolled'
                : 'bg-white/90 shadow-lg border-b border-gray-200 scrolled')
            : 'bg-transparent'
        }`}
        style={{
          willChange: 'auto'
        }}
        role="navigation"
        aria-label="Courses navigation"
      >
        {isScrolled && (
          <div className="pointer-events-none absolute inset-0 opacity-20 overflow-hidden">
            <div 
              className="navbar-grid-animate absolute left-1/2 top-1/2 w-[140%] h-[140%]" 
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, rgba(148,163,184,0.25) 0, rgba(148,163,184,0.25) 1px, transparent 1px, transparent 30px),
                                  repeating-linear-gradient(90deg, rgba(148,163,184,0.22) 0, rgba(148,163,184,0.22) 1px, transparent 1px, transparent 30px)`,
                maskImage: 'radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                transition: 'none',
                willChange: 'transform',
                animation: 'gridSlide 3s ease-in-out infinite'
              }} 
            />
          </div>
        )}
        <div className="container-custom px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo / Brand - Left Side */}
            <button
              type="button"
              className="btn-plain flex items-center space-x-1 sm:space-x-2 group focus:outline-none rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex-shrink-0"
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
                className={`text-base sm:text-xl font-display font-bold transition-all duration-300 hidden sm:inline ${
                  isScrolled
                    ? (isDarkMode ? 'text-white' : 'text-black')
                    : 'text-white group-hover:text-orange-300'
                }`}
              >
                Team4Stack
              </span>
            </button>

            {/* Center Navigation Tabs */}
            <div className="hidden md:flex items-center justify-center gap-1 sm:gap-2 lg:gap-4 flex-1">
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-orange-600')
                    : 'text-white hover:text-orange-300 font-medium'
                }`}
                onClick={() => router.push('/courses')}
              >
                Courses
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-orange-600')
                    : 'text-white hover:text-orange-300 font-medium'
                }`}
                onClick={() => router.push('/student/courses')}
              >
                My Courses
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-orange-600')
                    : 'text-white hover:text-orange-300 font-medium'
                }`}
                onClick={() => router.push('/courses/apply')}
              >
                Apply
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>
            </div>

            {/* Right-side actions for courses area */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Mobile menu button - shows tabs on mobile */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  type="button"
                  className={`btn-plain px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isScrolled
                      ? (isDarkMode
                          ? 'text-white/90 hover:text-white'
                          : 'text-gray-800 hover:text-orange-600')
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => router.push('/courses/apply')}
                >
                  Apply
                </button>
              </div>

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
      </nav>

      {/* Auth modal for courses area */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialError={null}
      />
    </>
  );
};

export default CoursesNavbar;
