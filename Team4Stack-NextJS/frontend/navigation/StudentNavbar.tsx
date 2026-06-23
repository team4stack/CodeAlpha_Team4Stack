'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/lib/auth/components/AuthModal'
import { useApprovedCourseStudent } from '@/lib/courses/useApprovedCourseStudent'
import StudentCourseNotificationsBell from '@/components/courses/StudentCourseNotificationsBell'
import CoursesAreaMobileDrawer from '@/navigation/CoursesAreaMobileDrawer'
import './HomeNavbar.css'

const StudentNavbar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { isApprovedStudent, checking: checkingStudent } = useApprovedCourseStudent(user, loading)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isDashboardActive = pathname === '/student'
  const isMyCoursesActive = pathname?.startsWith('/student/courses')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const mobileDrawerItems = [
    { label: 'Dashboard', onNavigate: () => router.push('/student') },
    { label: 'My Courses', onNavigate: () => router.push('/student/courses') },
    { label: 'Browse programs', onNavigate: () => router.push('/courses') },
    { label: 'Home', onNavigate: () => router.push('/') },
    ...(user
      ? [
          { label: 'Profile Settings', onNavigate: () => router.push('/settings') },
          {
            label: 'Logout',
            onNavigate: async () => {
              await signOut()
              router.push('/courses')
            },
          },
        ]
      : [{ label: 'Sign In', onNavigate: () => setIsAuthOpen(true) }]),
  ]

  return (
    <>
      <nav
        className={`navbar-fixed home-nav student-nav transition-all duration-300 ${
          isScrolled ? 'home-nav--scrolled' : 'home-nav--top'
        }`}
        role="navigation"
        aria-label="Student portal navigation"
      >
        <div
          className={`home-nav__blur-layer${isScrolled ? ' home-nav__blur-layer--full' : ''}`}
          aria-hidden
        />
        <div className="container-custom px-4 sm:px-6 relative">
          <div className="home-nav__bar">
            <button
              type="button"
              className="home-nav__logo btn-plain flex items-center gap-2 sm:gap-3 group focus:outline-none rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shrink-0"
              aria-label="Back to main website"
              onClick={() => router.push('/')}
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <img
                  src="/Team4Stack_Transparant.svg"
                  alt="Team4Stack Logo"
                  className="w-full h-full object-contain rounded-lg shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                  loading="eager"
                />
              </div>
              <span className="home-nav__brand text-lg sm:text-xl font-bold tracking-tight">Team4Stack</span>
            </button>

            <div className="home-nav__dock hidden md:flex">
              <button
                type="button"
                className={`home-nav__link btn-plain${isDashboardActive ? ' home-nav__link--active' : ''}`}
                onClick={() => router.push('/student')}
                aria-current={isDashboardActive ? 'page' : undefined}
              >
                Dashboard
              </button>
              <button
                type="button"
                className={`home-nav__link btn-plain${isMyCoursesActive ? ' home-nav__link--active' : ''}`}
                onClick={() => router.push('/student/courses')}
                aria-current={isMyCoursesActive ? 'page' : undefined}
              >
                My Courses
              </button>
            </div>

            <div className="home-nav__actions flex items-center gap-2 shrink-0">
              {!loading && user && isApprovedStudent && !checkingStudent && user.email && (
                <StudentCourseNotificationsBell
                  email={user.email}
                  isScrolled={isScrolled}
                  isDarkMode={true}
                />
              )}

              {!loading &&
                (user ? (
                  <div className="relative hidden md:block">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsUserMenuOpen((prev) => !prev)
                      }}
                      className="home-nav__profile-btn flex items-center gap-2 cursor-pointer btn-plain"
                    >
                      <div className="home-nav__profile-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[120px]">
                        <span className="text-sm font-medium text-white leading-tight truncate w-full">
                          {user.name || 'User'}
                        </span>
                        {user.username && (
                          <span className="text-xs text-white/70 leading-tight truncate w-full">
                            @{user.username}
                          </span>
                        )}
                      </div>
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10000" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-10001 bg-gray-800 border border-gray-700">
                          <div className="p-2">
                            <div className="px-3 py-2 rounded-md bg-gray-700/50">
                              <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                              {user.email && (
                                <p className="text-xs mt-0.5 text-gray-400">{user.email}</p>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                              <button
                                onClick={() => {
                                  setIsUserMenuOpen(false)
                                  router.push('/settings')
                                }}
                                className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-700"
                              >
                                Settings
                              </button>
                              <button
                                onClick={async () => {
                                  setIsUserMenuOpen(false)
                                  await signOut()
                                  router.push('/courses')
                                }}
                                className="w-full text-left px-3 py-2 text-sm rounded-md text-red-400 hover:bg-gray-700"
                              >
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
                    className="btn-plain home-nav__auth-btn hidden md:inline-flex"
                    aria-label="Sign In"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                ))}

              <button
                type="button"
                onClick={() => setIsMenuOpen((p) => !p)}
                className="home-nav__menu-btn btn-plain md:hidden p-2"
                aria-label={isMenuOpen ? 'Close student menu' : 'Open student menu'}
                aria-expanded={isMenuOpen}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="home-nav__glow-line pointer-events-none h-px w-full" />
      </nav>

      <CoursesAreaMobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} items={mobileDrawerItems} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialError={null} />
    </>
  )
}

export default StudentNavbar
