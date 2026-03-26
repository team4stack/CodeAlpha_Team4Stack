import React from 'react';

interface CoursesHeroSectionProps {
  isDarkMode: boolean;
  isApprovedStudent: boolean | null;
  onPrimaryAction: () => void;
}

const CoursesHeroSection: React.FC<CoursesHeroSectionProps> = ({
  isDarkMode,
  isApprovedStudent,
  onPrimaryAction
}) => {
  return (
    <section className={`relative pt-20 md:pt-28 pb-20 overflow-hidden ${
      isDarkMode
        ? 'bg-gradient-to-b from-black via-gray-900 to-black'
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    }`}>
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
            <button
              onClick={onPrimaryAction}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{isApprovedStudent ? 'Student Portal' : 'Apply'}</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

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
  );
};

export default CoursesHeroSection;
