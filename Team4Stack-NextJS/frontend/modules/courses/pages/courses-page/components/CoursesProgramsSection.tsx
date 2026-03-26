import React from 'react';
import type { DbCourse, DisplayCourse } from '../types';

interface CoursesProgramsSectionProps {
  isDarkMode: boolean;
  dbCourses: DbCourse[];
  fallbackCourses: DisplayCourse[];
  showAllCourses: boolean;
  enrolledCourses: Set<string>;
  rejectedCourses: Map<string, string>;
  onShowAll: () => void;
  onViewDetails: (course: DisplayCourse) => void;
  onBook: (courseTitle: string) => void;
  onShowRejection: (message: string) => void;
}

const mapToDisplayCourse = (c: DbCourse): DisplayCourse => ({
  key: String(c.id),
  title: c.title,
  level: c.level || '',
  description: c.description || '',
  duration: c.duration || '',
  price: c.price || '',
  note: c.note || '',
  features: Array.isArray(c.features) ? c.features : [],
  gradient: c.gradient || ''
});

const CoursesProgramsSection: React.FC<CoursesProgramsSectionProps> = ({
  isDarkMode,
  dbCourses,
  fallbackCourses,
  showAllCourses,
  enrolledCourses,
  rejectedCourses,
  onShowAll,
  onViewDetails,
  onBook,
  onShowRejection
}) => {
  const allCourses = dbCourses.length > 0 ? dbCourses.map(mapToDisplayCourse) : fallbackCourses;
  const displayedCourses = showAllCourses ? allCourses : allCourses.slice(0, 4);

  return (
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
          {displayedCourses.map((course) => (
            <div key={course.key} className="relative group">
              <div className={`relative h-full text-white hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl rounded-2xl overflow-hidden ${
                (course.gradient && course.gradient.trim().length > 0)
                  ? `bg-gradient-to-br ${course.gradient}`
                  : 'bg-gradient-to-br from-slate-600 via-blue-800 to-slate-800'
              } border border-white/20 backdrop-blur-sm shadow-xl`}>
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col h-full">
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

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{course.title}</h3>
                  <p className="text-white/90 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                    {course.description}
                  </p>

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

                  {enrolledCourses.has(course.title) ? (
                    <div className="w-full mt-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base cursor-not-allowed opacity-75">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Already Enrolled</span>
                    </div>
                  ) : rejectedCourses.has(course.title) ? (
                    <button
                      onClick={() => onShowRejection(rejectedCourses.get(course.title) || '')}
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
                        onClick={() => onViewDetails(course)}
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
                        onClick={() => onBook(course.title)}
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
          ))}
        </div>

        {allCourses.length > 4 && !showAllCourses && (
          <div className="flex justify-center mt-8 sm:mt-10">
            <button
              onClick={onShowAll}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Show More Courses</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesProgramsSection;
