'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { coursesApi } from '@/lib/api';
import CoursesNavbar from '@/navigation/CoursesNavbar';

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ params }) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.courseId);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const result = await coursesApi.getAllCourses();
        
        if (!result.error && result.data) {
          const courses = result.data as any[];
          const foundCourse = courses.find(c => String(c.id) === courseId || c.title === courseId);
          
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            // Fallback to default courses
            const defaultCourses = [
              {
                id: 'physical',
                title: 'Physical Training (WE Connect)',
                description: 'Hands-on MERN stack training with real projects at WE Connect Software House.',
                duration: '3 months',
                price: 'Rs 10,000 (first month)',
                note: 'Next months: compromise possible',
                level: 'Physical',
                features: [
                  'In-person classes + project work',
                  'Monthly payment via JazzCash',
                  'Certificate on completion',
                  'Limited seats'
                ]
              },
              {
                id: 'online',
                title: 'Online Training',
                description: 'Live online MERN stack course with recordings and support community.',
                duration: '4 months',
                price: 'Rs 5,000 (first month)',
                note: 'Next months: compromise possible',
                level: 'Online',
                features: [
                  'Live classes + recordings',
                  'Monthly payment via JazzCash',
                  'Assignments and projects',
                  'Flexible timings'
                ]
              }
            ];
            
            const defaultCourse = defaultCourses.find(c => c.id === courseId || c.title === courseId);
            if (defaultCourse) {
              setCourse(defaultCourse);
            }
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18]">
        <CoursesNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white/70">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18]">
        <CoursesNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-white/70 text-xl mb-4">Course not found</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18]">
      <CoursesNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-28 pb-12 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl animate-pulse" style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.45), rgba(56,189,248,0) 60%)',
            animationDuration: '4s'
          }}></div>
          <div className="absolute -bottom-28 -right-24 w-[60vw] h-[60vw] rounded-full opacity-15 blur-3xl animate-pulse" style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.45), rgba(168,85,247,0) 60%)',
            animationDuration: '5s',
            animationDelay: '1s'
          }}></div>
        </div>

        <div className="container-custom max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm text-white/80 font-medium">{course.level || 'Course'}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {course.description}
            </p>

            {/* Course Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-cyan-400 text-sm font-semibold mb-1">Duration</div>
                <div className="text-white text-lg font-bold">{course.duration || 'N/A'}</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-purple-400 text-sm font-semibold mb-1">Price</div>
                <div className="text-white text-lg font-bold">{course.price || 'N/A'}</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-pink-400 text-sm font-semibold mb-1">Level</div>
                <div className="text-white text-lg font-bold">{course.level || 'All Levels'}</div>
              </div>
            </div>

            {course.note && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.note}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Details Section */}
      <section className="py-12 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Details */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Course Details
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    The MERN Stack Web Development Course offers complete training in building powerful web applications using the popular MERN stack — MongoDB, Express.js, React.js, and Node.js. This course takes you through the entire process of developing full-stack JavaScript applications, from designing the frontend interface to building backend APIs and managing databases. In this course, you can learn at your own pace, gaining practical skills to create dynamic, scalable, and responsive web apps. This course is designed to prepare you for careers as a MERN stack developer or freelancer in the web development field.
                  </p>
                </div>
              </div>

              {/* Who Can Join This Course? */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Who Can Join This Course?
                </h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  This course is ideal for:
                </p>
                <ul className="space-y-3">
                  {[
                    'Students: Looking to build professional web development skills',
                    'Beginners: No prior experience required; start from scratch',
                    'Frontend Developers: Want to learn backend development with Node.js and MongoDB',
                    'Backend Developers: Interested in mastering React for frontend development',
                    'Freelancers: Wanting to offer full-stack development services',
                    'IT Professionals: Seeking to upgrade their skills and work on modern web technologies'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-300 mt-6 leading-relaxed">
                  No previous experience is required. This course takes you from beginner level to advanced level, step by step.
                </p>
              </div>

              {/* What Will You Learn? */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  What Will You Learn?
                </h2>
                <ul className="space-y-3">
                  {[
                    'Introduction to NoSQL databases',
                    'Creating and managing collections and documents',
                    'Querying, updating, and deleting data',
                    'Setting up the server environment',
                    'Building RESTful APIs',
                    'Middleware and routing',
                    'React fundamentals: Components, state, and props',
                    'React hooks and functional components',
                    'Managing routes and navigation',
                    'Integrating React frontend with Express backend'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {[
                    'Basic computer and internet skills',
                    'A laptop or desktop with internet access',
                    'Basic understanding of HTML, CSS, and JavaScript',
                    'Interest in full-stack development',
                    'Willingness to learn modern JavaScript frameworks'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Material Includes */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Material Includes
                </h2>
                <ul className="space-y-3">
                  {[
                    'Complete MERN stack training',
                    'MongoDB database setup and management',
                    'Express.js API development guides',
                    'React.js frontend development materials',
                    'Node.js backend development tutorials',
                    'Project-based learning resources'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Course Features */}
                {course.features && Array.isArray(course.features) && course.features.length > 0 && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Course Features</h3>
                    <ul className="space-y-3">
                      {course.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply Button */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <button
                    onClick={() => router.push('/courses/apply')}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transform flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
