import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

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
  
  // Load courses from Supabase if enabled
  useEffect(() => {
    const useSupabase = true;
    if (!useSupabase) return;
    (async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id,title,description,image_url,level,duration,price,note,features,gradient')
        .order('order_index', { ascending: true })
        .order('id', { ascending: false });
      if (!error && data) setDbCourses(data as any);
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
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            MERN Stack <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Training</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We provide MERN Stack courses online and physical, guided by our team of experienced developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {(dbCourses.length > 0 ? dbCourses.map((c) => ({ key: String(c.id), title: c.title, level: c.level || '', description: c.description || '', duration: c.duration || '', price: c.price || '', note: c.note || '', features: Array.isArray((c as any).features) ? (c as any).features : [], gradient: c.gradient || '' })) : courses).map((course) => (
            <div key={course.key} className="relative group">
              {/* Course Card with Gradient Background */}
              <div className={`card text-white hover:scale-105 transition-all duration-500 hover:shadow-2xl bg-gradient-to-br ${(course.gradient && course.gradient.trim().length > 0) ? course.gradient : 'from-purple-600/20 to-cyan-600/20'} border border-white/20`}>
                {/* Course Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium opacity-90">{course.level}</span>
                      <div className="text-xs opacity-75">{course.duration}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold">{course.price}</div>
                    <div className="text-xs opacity-90">{course.note}</div>
                  </div>
                </div>
                
                {/* Course Title and Description */}
                <h3 className="text-2xl font-display font-bold mb-4">{course.title}</h3>
                <p className="text-white/90 mb-6 leading-relaxed">
                  {course.description}
                </p>
                
                {/* Features */}
                {course.features && course.features.length > 0 && (
                  <div className="space-y-2 mb-8">
                    {course.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Book Now */}
                <button 
                  onClick={() => openBooking(course.title)}
                  className="w-full preview-btn"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Notice Modal */}
        {noticeOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pt-20 md:pt-24">
            <div className="w-full max-w-lg card text-white bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/20 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-2">Before You Book</h3>
              <p className="text-white/80 mb-2">Please pay the first month fee via JazzCash and keep the screenshot. Next months: compromise possible.</p>
              <div className="rounded-lg bg-white/10 border border-white/20 p-4 mb-4">
                <div className="text-sm">JazzCash Number</div>
                <div className="text-xl font-semibold mt-1">+92 308 3266634</div>
                <div className="text-sm mt-1">Account Name: <span className="font-medium">Muhammad Sami Ullah</span></div>
          </div>
              <p className="text-white/70 mb-4">After submitting the form, send the payment screenshot on WhatsApp.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={proceedToForm} className="flex-1 preview-btn">Continue to Form</button>
                <button onClick={() => setNoticeOpen(false)} className="flex-1 glass-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};

export default Courses;
