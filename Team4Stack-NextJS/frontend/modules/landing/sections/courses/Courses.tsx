'use client'

import React, { useEffect, useMemo, useState } from 'react';

const Courses: React.FC = () => {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<string>('');
  const [dbCourses, setDbCourses] = useState<Array<{ id: number; title: string; description?: string; image_url?: string; level?: string; duration?: string; price?: string; note?: string; features?: string[]; gradient?: string }>>([]);

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
      gradient: 'from-purple-blue-500 to-indigo-cyan-500'
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
      gradient: 'from-green-teal-500 to-orange-pink-500'
    }
  ]), []);
  
  // Load courses via API
  useEffect(() => {
    (async () => {
      try {
        const { coursesApi } = await import('@/lib/api');
        const result = await coursesApi.getAllCourses();
        if (!result.error && result.data) {
          setDbCourses(result.data as any);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    })();
  }, []);
  const openBooking = (courseTitle: string) => {
    setPendingCourse(courseTitle);
    setNoticeOpen(true);
  };

  const proceedToForm = () => {
    try { localStorage.setItem('selectedCourse', pendingCourse); } catch {}
    setNoticeOpen(false);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#contact';
    }
  };

  return (
    <section id="courses" className="section-padding bg-gradient-to-b from-black to-gray-900">
      <div className="container-custom px-4">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            MERN Stack <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Training</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            We provide MERN Stack courses online and physical, guided by our team of experienced developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {(dbCourses.length > 0 ? dbCourses.map((c) => ({ key: String(c.id), title: c.title, level: c.level || '', description: c.description || '', duration: c.duration || '', price: c.price || '', note: c.note || '', features: Array.isArray((c as any).features) ? (c as any).features : [], gradient: c.gradient || '' })) : courses).map((course) => (
            <div key={course.key} className="relative group">
              {/* Course Card with Gradient Background - Improved Design */}
              <div className={`card text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${(course.gradient && course.gradient.trim().length > 0) ? course.gradient : 'from-purple-600/20 to-cyan-600/20'} border border-white/20 backdrop-blur-sm overflow-hidden`}>
                {/* Course Header - Improved Layout */}
                <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold opacity-95 block">{course.level}</span>
                      <div className="text-xs opacity-80">{course.duration}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1">{course.price}</div>
                    <div className="text-xs opacity-85 leading-tight">{course.note}</div>
                  </div>
                </div>
                
                {/* Course Title and Description - Better Spacing */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 sm:mb-3 leading-tight">{course.title}</h3>
                <p className="text-white/85 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {course.description}
                </p>
                
                {/* Features - Improved Styling */}
                {course.features && course.features.length > 0 && (
                  <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
                    {course.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-start space-x-2 sm:space-x-3 text-xs sm:text-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white/90 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Book Now Button - Better Styling */}
                <button 
                  onClick={() => openBooking(course.title)}
                  className="w-full preview-btn mt-auto font-semibold py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Notice Modal */}
        {noticeOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg card text-white bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/20 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Before You Book</h3>
              <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">Please pay the first month fee via JazzCash and keep the screenshot. Next months: compromise possible.</p>
              <div className="rounded-lg bg-white/10 border border-white/20 p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="text-xs sm:text-sm">JazzCash Number</div>
                <div className="text-lg sm:text-xl font-semibold mt-1">+92 308 3266634</div>
                <div className="text-xs sm:text-sm mt-1">Account Name: <span className="font-medium">Muhammad Sami Ullah</span></div>
          </div>
              <p className="text-white/70 mb-4 text-sm sm:text-base">After submitting the form, send the payment screenshot on WhatsApp.</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={proceedToForm} className="flex-1 preview-btn py-2.5 sm:py-3 text-sm sm:text-base">Continue to Form</button>
                <button onClick={() => setNoticeOpen(false)} className="flex-1 glass-btn py-2.5 sm:py-3 text-sm sm:text-base">Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};

export default Courses;
