import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-black via-gray-900 to-black pt-24 md:pt-32">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🎓 Student Dashboard
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Portal</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Access your enrolled courses, track your progress, and continue your learning journey with expert mentorship.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div
            onClick={() => navigate('/student/courses')}
            className={`rounded-xl shadow-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/30 hover:border-blue-500/50'
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              My Courses
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              View all enrolled courses
            </p>
          </div>

          <div
            onClick={() => navigate('/courses')}
            className={`rounded-xl shadow-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/30 hover:border-purple-500/50'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Browse Courses
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore new courses
            </p>
          </div>

          <div
            onClick={() => navigate('/courses/apply')}
            className={`rounded-xl shadow-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-700/30 hover:border-orange-500/50'
                : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 hover:border-orange-300'
            }`}
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Apply Now
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enroll in a new course
            </p>
          </div>
        </div>

        {/* Main CTA Card */}
        <div className={`max-w-4xl mx-auto rounded-2xl shadow-2xl p-8 md:p-12 text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="text-6xl mb-6">🚀</div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Continue Learning?
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Access your enrolled courses, track your progress, and unlock new skills with our comprehensive MERN stack training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/courses')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View My Courses
            </button>
            <button
              onClick={() => navigate('/courses')}
              className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 ${
                isDarkMode
                  ? 'border-purple-500 text-purple-400 hover:bg-purple-500/20'
                  : 'border-purple-600 text-purple-600 hover:bg-purple-50'
              }`}
            >
              Browse All Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;

