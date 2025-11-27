import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-black to-gray-900 pt-24 md:pt-28">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Portal</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Access your enrolled courses, track your progress, and continue learning.
          </p>
        </div>

        <div className={`max-w-3xl mx-auto rounded-xl shadow-lg p-8 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <p className={`text-xl mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to Student Portal
          </p>
          <p className={`mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            View your enrolled courses and continue your learning journey.
          </p>
          <button
            onClick={() => navigate('/student/courses')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View My Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;

