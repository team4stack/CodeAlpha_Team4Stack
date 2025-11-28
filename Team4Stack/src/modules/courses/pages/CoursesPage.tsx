import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { courses } from '../../landing/sections';

const CoursesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className={`pt-24 md:pt-32 pb-16 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                🎓 MERN Stack Training
              </span>
            </div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">Full Stack</span> Development
            </h1>
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Learn MERN stack with hands-on projects. Join us physically at WE Connect or learn online with live classes and expert mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/courses/apply')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Apply Now
              </button>
              <button
                onClick={() => navigate('/student')}
                className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'border-purple-500 text-purple-400 hover:bg-purple-500/20'
                    : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}
              >
                Student Portal
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}`}>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">500+</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students Trained</div>
            </div>
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}`}>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">100+</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Projects Completed</div>
            </div>
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}`}>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">95%</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</div>
            </div>
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}`}>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">24/7</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Training Programs</span>
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the learning path that suits you best. Both options include real-world projects and industry mentorship.
            </p>
          </div>
          <courses.Courses />
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;


