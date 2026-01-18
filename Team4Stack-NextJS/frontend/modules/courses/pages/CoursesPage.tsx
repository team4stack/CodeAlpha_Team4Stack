'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi } from '@/lib/api';
import CoursesNavbar from '@/navigation/CoursesNavbar';

const CoursesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<string>('');
  const [dbCourses, setDbCourses] = useState<Array<{ id: number; title: string; description?: string; image_url?: string; level?: string; duration?: string; price?: string; note?: string; features?: string[]; gradient?: string }>>([]);
  const [isApprovedStudent, setIsApprovedStudent] = useState<boolean | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [rejectedCourses, setRejectedCourses] = useState<Map<string, string>>(new Map()); // course_name -> rejection_message
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionMessage, setSelectedRejectionMessage] = useState<string>('');
  const [showAllCourses, setShowAllCourses] = useState(false);

  const courses = useMemo(() => ([
    {
      key: 'physical' as const,
      title: 'Physical Training (WE Connect)',
      level: 'Physical',
      description: 'Hands-on MERN stack training with real projects at WE Connect Software House.',
      duration: '3 months',
      price: 'Rs 10,000 (first month)',
      note: 'Next months: compromise possible',
      features: [
        'In-person classes + project work',
        'Monthly payment via JazzCash',
        'Certificate on completion',
        'Limited seats'
      ],
      gradient: 'from-orange-500 via-red-500 to-pink-500'
    },
    {
      key: 'online' as const,
      title: 'Online Training',
      level: 'Online',
      description: 'Live online MERN stack course with recordings and support community.',
      duration: '4 months',
      price: 'Rs 5,000 (first month)',
      note: 'Next months: compromise possible',
      features: [
        'Live classes + recordings',
        'Monthly payment via JazzCash',
        'Assignments and projects',
        'Flexible timings'
      ],
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
    }
  ]), []);
  
  // Load courses from API
  useEffect(() => {
    (async () => {
      const result = await coursesApi.getAllCourses();
      if (!result.error && result.data) setDbCourses(result.data as any);
    })();
  }, []);

  // Check if user is an approved student and get enrolled courses
  useEffect(() => {
    const checkStudentStatus = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If user is not logged in, show Apply button
      if (!user || !user.email) {
        setIsApprovedStudent(false);
        setEnrolledCourses(new Set());
        return;
      }

      // Check if user is an approved student and get all applications
      try {
        const result = await coursesApi.getAdmissionForms({
          email: user.email.toLowerCase().trim()
        });

        if (result.error) {
          console.error('Error checking student status:', result.error);
          setIsApprovedStudent(false);
          setEnrolledCourses(new Set());
          return;
        }

        const applicationData = result.data || [];

        // Check if user has at least one course approved
        const hasAnyCourseApproved = applicationData?.some((app: any) => {
          // Check if new per-course approval system is being used
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          
          if (hasNewApprovals) {
            // New system: check if at least one selected course is approved
            const hasCourse1 = Boolean(app.course_name)
            const hasCourse2 = Boolean(app.course_name_2)
            
            if (hasCourse1 && hasCourse2) {
              // Both courses selected - at least one must be approved
              return app.approved_1 === true || app.approved_2 === true
            } else if (hasCourse1) {
              // Only course 1 selected - must be approved
              return app.approved_1 === true
            }
            return false
          } else {
            // Old system: use the approved field directly
            return app.approved === true
          }
        }) || false;
        
        const hasApproved = hasAnyCourseApproved;
        setIsApprovedStudent(hasApproved || false);

        // Get course names from applications where at least one course is approved
        if (applicationData && applicationData.length > 0) {
          const appsWithAnyApproved = applicationData.filter((app: any) => {
            const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
            
            if (hasNewApprovals) {
              const hasCourse1 = Boolean(app.course_name)
              const hasCourse2 = Boolean(app.course_name_2)
              
              if (hasCourse1 && hasCourse2) {
                // At least one course must be approved
                return app.approved_1 === true || app.approved_2 === true
              } else if (hasCourse1) {
                return app.approved_1 === true
              }
              return false
            } else {
              return app.approved === true
            }
          });
          
          const courseNames = new Set<string>();
          const rejectedMap = new Map<string, string>();
          
          appsWithAnyApproved.forEach(app => {
            // Only add courses that are actually approved
            if (app.course_name?.trim() && app.approved_1 === true) {
              courseNames.add(app.course_name.trim());
            }
            if (app.course_name_2?.trim() && app.approved_2 === true) {
              courseNames.add(app.course_name_2.trim());
            }
            // Backward compatibility: if using old system, add course_name if approved
            if (!app.approved_1 && !app.approved_2 && app.approved === true && app.course_name?.trim()) {
              courseNames.add(app.course_name.trim());
            }
          });
          
          // Track rejected courses with their rejection messages
          applicationData.forEach((app: any) => {
            const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
            
            if (hasNewApprovals) {
              // Check course 1
              if (app.course_name?.trim() && app.approved_1 === false && app.rejection_message_1) {
                rejectedMap.set(app.course_name.trim(), app.rejection_message_1);
              }
              // Check course 2
              if (app.course_name_2?.trim() && app.approved_2 === false && app.rejection_message_2) {
                rejectedMap.set(app.course_name_2.trim(), app.rejection_message_2);
              }
            } else {
              // Old system
              if (app.course_name?.trim() && app.approved === false && app.rejection_message) {
                rejectedMap.set(app.course_name.trim(), app.rejection_message);
              }
            }
          });
          
          setEnrolledCourses(courseNames);
          setRejectedCourses(rejectedMap);
        } else {
          setEnrolledCourses(new Set());
          setRejectedCourses(new Map());
        }
      } catch (err) {
        console.error('Error checking student status:', err);
        setIsApprovedStudent(false);
        setEnrolledCourses(new Set());
      }
    };

    checkStudentStatus();
  }, [user, authLoading]);

  const openBooking = (courseTitle: string) => {
    setPendingCourse(courseTitle);
    setNoticeOpen(true);
  };

  const proceedToForm = () => {
    try { localStorage.setItem('selectedCourse', pendingCourse); } catch {}
    setNoticeOpen(false);
    router.push('/courses/apply');
  };
  
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navbar integrated into hero section */}
      <CoursesNavbar />
      
      {/* Hero Section */}
      <section className={`relative pt-20 md:pt-28 pb-20 overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-b from-black via-gray-900 to-black' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-purple-500' : 'bg-purple-200'
          }`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-20 ${
            isDarkMode ? 'bg-orange-500' : 'bg-orange-200'
          }`}></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-12 md:mb-16 px-4">
            <div className="inline-block mb-4 md:mb-6 animate-fade-in">
              <span className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
              }`}>
                🎓 MERN Stack Training
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight px-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-gradient">
                Full Stack
              </span> Development
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Learn MERN stack with hands-on projects. Join us physically at WE Connect or learn online with live classes and expert mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {isApprovedStudent ? (
                <button
                  onClick={() => router.push('/student')}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Student Portal</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/courses/apply')}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Apply</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 md:mt-20 max-w-5xl mx-auto px-4">
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-orange-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-orange-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">500+</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students Trained</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-purple-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">100+</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projects Completed</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-cyan-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">95%</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</div>
            </div>
            <div className={`text-center p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700/50 hover:border-green-500/50' 
                : 'bg-white border border-gray-200 shadow-lg hover:shadow-green-200'
            }`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">24/7</div>
              <div className={`text-xs sm:text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className={`py-12 sm:py-16 md:py-20 lg:py-24 relative ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 via-black to-gray-900' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}>
        <div className="container-custom px-4">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Training Programs
              </span>
            </h2>
            <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Choose the learning path that suits you best. Both options include real-world projects and industry mentorship.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {(() => {
              const allCourses = dbCourses.length > 0 
                ? dbCourses.map((c) => ({ 
                    key: String(c.id), 
                    title: c.title, 
                    level: c.level || '', 
                    description: c.description || '', 
                    duration: c.duration || '', 
                    price: c.price || '', 
                    note: c.note || '', 
                    features: Array.isArray((c as any).features) ? (c as any).features : [], 
                    gradient: c.gradient || '' 
                  })) 
                : courses;
              const displayedCourses = showAllCourses ? allCourses : allCourses.slice(0, 4);
              return displayedCourses.map((course) => (
              <div key={course.key} className="relative group">
                {/* Course Card with Gradient Background - Enhanced Design */}
                <div className={`relative h-full text-white hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl rounded-2xl overflow-hidden ${
                  (course.gradient && course.gradient.trim().length > 0) 
                    ? `bg-gradient-to-br ${course.gradient}` 
                    : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
                } border border-white/20 backdrop-blur-sm shadow-xl`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col h-full">
                    {/* Course Header - Enhanced Layout */}
                    <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6 pb-4 sm:pb-5 md:pb-6 border-b border-white/20">
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold opacity-95 block mb-0.5 sm:mb-1">{course.level}</span>
                          <div className="text-xs opacity-80 flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                          {course.price}
                        </div>
                        <div className="text-xs opacity-85 font-medium leading-tight">{course.note}</div>
                      </div>
                    </div>
                    
                    {/* Course Title and Description - Enhanced Spacing */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{course.title}</h3>
                    <p className="text-white/90 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                      {course.description}
                    </p>
                    
                    {/* Features - Enhanced Styling */}
                    {course.features && course.features.length > 0 && (
                      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
                        {course.features.map((feature: string, featureIndex: number) => (
                          <div key={featureIndex} className="flex items-start space-x-2 sm:space-x-3 group/item">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-white/30 transition-colors">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-white/95 leading-relaxed text-xs sm:text-sm md:text-base">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Book Now / Already Enrolled / Rejected Button */}
                    {enrolledCourses.has(course.title) ? (
                      <div className="w-full mt-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base cursor-not-allowed opacity-75">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Already Enrolled</span>
                      </div>
                    ) : rejectedCourses.has(course.title) ? (
                      <button 
                        onClick={() => {
                          setSelectedRejectionMessage(rejectedCourses.get(course.title) || '');
                          setShowRejectionModal(true);
                        }}
                        className="w-full mt-auto bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm border border-red-400/50 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 flex items-center justify-center gap-2 group text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Rejected</span>
                      </button>
                    ) : (
                      <div className="w-full mt-auto flex flex-row gap-3">
                        <button 
                          onClick={() => {
                            const courseId = dbCourses.length > 0 
                              ? dbCourses.find(c => c.title === course.title)?.id || course.key
                              : course.key;
                            router.push(`/courses/detail/${courseId}`);
                          }}
                          className="flex-1 bg-green-500/80 hover:bg-green-600/90 backdrop-blur-sm border border-green-400/50 !text-black font-extrabold py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 group text-sm sm:text-base relative z-10"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 !text-black drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline !text-black font-extrabold drop-shadow-sm">View Details</span>
                          <span className="sm:hidden !text-black font-extrabold drop-shadow-sm">Details</span>
                        </button>
                        <button 
                          onClick={() => openBooking(course.title)}
                          className="flex-1 bg-green-500/80 hover:bg-green-600/90 backdrop-blur-sm border border-green-400/50 !text-black font-extrabold py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 group text-sm sm:text-base relative z-10"
                        >
                          <span className="!text-black font-extrabold drop-shadow-sm">Book Now</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform !text-black drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ));
            })()}
          </div>
          {(() => {
            const allCourses = dbCourses.length > 0 
              ? dbCourses.map((c) => ({ 
                  key: String(c.id), 
                  title: c.title, 
                  level: c.level || '', 
                  description: c.description || '', 
                  duration: c.duration || '', 
                  price: c.price || '', 
                  note: c.note || '', 
                  features: Array.isArray((c as any).features) ? (c as any).features : [], 
                  gradient: c.gradient || '' 
                })) 
              : courses;
            if (allCourses.length > 4 && !showAllCourses) {
              return (
                <div className="flex justify-center mt-8 sm:mt-10">
                  <button
                    onClick={() => setShowAllCourses(true)}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span>Show More Courses</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </section>

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-xl sm:rounded-2xl text-white bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-400/30 max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${
            isDarkMode ? 'shadow-2xl' : 'shadow-xl'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Application Rejected
              </h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedRejectionMessage('');
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-white/90 mb-2">Rejection Reason:</p>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                {selectedRejectionMessage || 'No reason provided.'}
              </p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-white/90">
                <strong>Note:</strong> You cannot apply again for this course. If you have questions, please contact the administration.
              </p>
            </div>
            <button
              onClick={() => {
                setShowRejectionModal(false);
                setSelectedRejectionMessage('');
              }}
              className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Notice Modal */}
      {noticeOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pt-20 md:pt-24">
          <div className={`w-full max-w-lg rounded-xl sm:rounded-2xl text-white bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/20 max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${
            isDarkMode ? 'shadow-2xl' : 'shadow-xl'
          }`}>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Before You Book</h3>
            <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">Please pay the first month fee via JazzCash and keep the screenshot. Next months: compromise possible.</p>
            <div className="rounded-lg bg-white/10 border border-white/20 p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm">JazzCash Number</div>
              <div className="text-lg sm:text-xl font-semibold mt-1">+92 308 3266634</div>
              <div className="text-xs sm:text-sm mt-1">Account Name: <span className="font-medium">Muhammad Sami Ullah</span></div>
            </div>
            <p className="text-white/70 mb-4 text-sm sm:text-base">After submitting the form, send the payment screenshot on WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button onClick={proceedToForm} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm sm:text-base">
                Continue to Form
              </button>
              <button onClick={() => setNoticeOpen(false)} className={`flex-1 border-2 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base ${
                isDarkMode ? 'border-white/30 hover:bg-white/10' : 'border-white/30 hover:bg-white/10'
              }`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;


