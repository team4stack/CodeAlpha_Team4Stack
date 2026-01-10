'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/lib/auth/components/AuthModal';

const StudentNavbar: React.FC = () => {
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
        aria-label="Student portal navigation"
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
                    : 'text-white group-hover:text-cyan-300'
                }`}
              >
                Team4Stack
              </span>
            </button>

            {/* Right-side actions for student area */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Dashboard button */}
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none hidden md:block ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-blue-600')
                    : 'text-white hover:text-cyan-300 font-medium'
                }`}
                onClick={() => router.push('/student')}
              >
                Dashboard
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>

              {/* Login button – same style as main site */}
              {!loading && (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] transition-all hover:scale-110 flex items-center justify-center focus:outline-none flex-shrink-0"
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

      {/* Auth modal for student area */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialError={null}
      />
    </>
  );
};

export default StudentNavbar;
