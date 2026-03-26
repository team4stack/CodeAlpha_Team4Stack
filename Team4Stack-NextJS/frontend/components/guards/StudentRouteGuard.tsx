'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/lib/auth/components/AuthModal'
import { userHasApprovedCourseApplication } from '@/lib/courses/admissionApproved'

interface StudentRouteGuardProps {
  children: React.ReactNode
}

const StudentRouteGuard: React.FC<StudentRouteGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showNotApprovedModal, setShowNotApprovedModal] = useState(false)

  useEffect(() => {
    // Use user.id and user.email as dependencies instead of user object to prevent infinite loops
    const userId = user?.id;
    const userEmail = user?.email;
    
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const checkStudentStatus = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return
      }

      // If user is not logged in, show auth modal
      if (!userId || !userEmail) {
        if (isMounted) {
          setChecking(false)
          setShowAuthModal(true)
          setIsApproved(false)
        }
        return
      }

      if (isMounted) {
        setChecking(true)
      }

      // Check if user is an approved student via API
      try {
        const { coursesApi } = await import('@/lib/api');
        const result = await coursesApi.getAdmissionForms({ email: userEmail.toLowerCase().trim() });

        if (!isMounted) return;

        if (result.error) {
          console.error('Error checking student status:', result.error)
          setIsApproved(false)
          setChecking(false)
          return
        }

        const applications = (Array.isArray(result.data) ? result.data : []) as Record<string, unknown>[];
        // Allow portal access if ANY application row contains an approved course.
        // This prevents blocking existing students when they submit a new pending application.
        const hasAnyCourseApproved = userHasApprovedCourseApplication(applications)

        if (isMounted) {
          if (hasAnyCourseApproved) {
            setIsApproved(true)
            setShowNotApprovedModal(false)
          } else {
            setIsApproved(false)
            setShowNotApprovedModal(true)
          }
          setChecking(false)
        }
      } catch (err) {
        console.error('Error checking student status:', err)
        if (isMounted) {
          setIsApproved(false)
          setShowNotApprovedModal(true)
          setChecking(false)
        }
      }
    }

    checkStudentStatus()

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email, authLoading]) // Use specific properties instead of entire user object

  // Show loading state
  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // If not logged in, show auth modal
  if (!user || !user.email) {
    return (
      <>
        <AuthModal isOpen={showAuthModal} onClose={() => {
          setShowAuthModal(false)
          router.push('/courses')
        }} />
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                Login Required
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You need to login to access the Student Portal.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Login Now
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="w-full mt-3 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // If logged in but not approved, show not approved modal
  if (!isApproved) {
    return (
      <>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Access Restricted
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Student Portal Access Required</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You need to be an approved student to access this portal</p>
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>To access the Student Portal:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 ml-4 list-decimal space-y-1">
                    <li>Apply for a course from the Courses page</li>
                    <li>Wait for admin approval</li>
                    <li>Once approved, you'll have full access to the Student Portal</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.push('/courses/apply')}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Apply for Course
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // User is logged in and approved, show content
  return <>{children}</>
}

export default StudentRouteGuard
