'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/lib/auth/components/AuthModal';
import UserSettingsModal from '@/modals/UserSettingsModal';

const StudentNavbar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        className={`navbar-fixed transition-all duration-300 ${
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

            {/* Center Navigation Tabs */}
            <div className="hidden md:flex items-center justify-center gap-1 sm:gap-2 lg:gap-4 flex-1">
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-cyan-600')
                    : 'text-white hover:text-cyan-300 font-medium'
                }`}
                onClick={() => router.push('/student')}
              >
                Dashboard
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>
              <button
                type="button"
                className={`btn-plain px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 relative group focus:outline-none ${
                  isScrolled
                    ? (isDarkMode
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-800 hover:text-cyan-600')
                    : 'text-white hover:text-cyan-300 font-medium'
                }`}
                onClick={() => router.push('/student/courses')}
              >
                My Courses
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </button>
            </div>

            {/* Right-side actions for student area */}
            <div className="flex items-center gap-1.5 sm:gap-3">

              {!loading && (
                user ? (
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsUserMenuOpen(prev => !prev)
                      }}
                      className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        isScrolled
                          ? (isDarkMode
                              ? 'bg-white/10 border border-white/20 hover:bg-white/15'
                              : 'bg-gray-100/90 border border-gray-200 hover:bg-gray-200')
                          : 'bg-white/10 border border-white/20 hover:bg-white/15'
                      }`}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[120px]">
                        <span className={`text-xs sm:text-sm font-medium leading-tight truncate w-full ${
                          isScrolled
                            ? (isDarkMode ? 'text-white' : 'text-gray-800')
                            : 'text-white'
                        }`}>
                          {user.name || 'User'}
                        </span>
                        {user.username && (
                          <span className={`text-xs leading-tight truncate w-full ${
                            isScrolled
                              ? (isDarkMode ? 'text-white/70' : 'text-gray-600')
                              : 'text-white/70'
                          }`}>
                            @{user.username}
                          </span>
                        )}
                      </div>
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[10000]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsUserMenuOpen(false)
                          }}
                        />
                        <div 
                          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-[10001] ${
                            isDarkMode 
                              ? 'bg-gray-800 border border-gray-700' 
                              : 'bg-white border border-gray-200'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2">
                            <div className={`px-3 py-2 rounded-md ${
                              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                              <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {user.name || 'User'}
                              </p>
                              {user.email && (
                                <p className={`text-xs mt-0.5 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {user.email}
                                </p>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                              <button
                                onClick={() => {
                                  setIsUserMenuOpen(false)
                                  setIsSettingsOpen(true)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                  isDarkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                              </button>
                              <button
                                onClick={async () => {
                                  setIsUserMenuOpen(false)
                                  await signOut()
                                  router.push('/courses')
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                  isDarkMode
                                    ? 'text-red-400 hover:bg-gray-700'
                                    : 'text-red-600 hover:bg-gray-100'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center focus:outline-none flex-shrink-0 ${
                      isScrolled
                        ? (isDarkMode
                            ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)]'
                            : 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)]')
                        : 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)]'
                    }`}
                    aria-label="Sign In"
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
                )
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

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default StudentNavbar;
