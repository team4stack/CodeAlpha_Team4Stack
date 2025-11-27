import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const TeamPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <section className={`pt-24 md:pt-28 ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}>
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest ${
                isDarkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                Our Team
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400">
                Team
              </span>
            </h1>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A passionate group of developers, designers, and mentors working together to build amazing projects.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">👥</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Members</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Experienced developers and mentors dedicated to student success.
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">🎯</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Expertise</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Full-stack development, UI/UX design, and project management.
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">💡</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mentorship</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Guiding students through real-world projects and challenges.
                </p>
              </div>
            </div>

            {/* Team Section Info */}
            <div className={`text-center p-8 rounded-xl border ${isDarkMode ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Building the Future Together! 🚀
              </h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Our team is committed to providing quality education and mentorship to help students succeed in their development journey.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Learn more about our team members and their expertise.
                </span>
              </div>
            </div>

            {/* Coming Soon Note */}
            <div className={`mt-8 p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-sm text-center ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                📝 Detailed team profiles and management features coming soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;

