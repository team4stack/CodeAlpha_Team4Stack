'use client'

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const TeamPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <section
        className={`relative pt-20 md:pt-28 pb-10 md:pb-16 ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}
      >
        {/* Decorative gradients (desktop-friendly, no scroll impact) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            background: isDarkMode
              ? 'radial-gradient(800px 400px at 20% 10%, rgba(56,189,248,0.25), rgba(0,0,0,0) 60%), radial-gradient(700px 350px at 90% 20%, rgba(168,85,247,0.20), rgba(0,0,0,0) 55%)'
              : 'radial-gradient(700px 320px at 20% 10%, rgba(59,130,246,0.10), rgba(255,255,255,0) 55%), radial-gradient(650px 300px at 90% 20%, rgba(168,85,247,0.10), rgba(255,255,255,0) 55%)',
          }}
        />

        <div className="container-custom relative">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-16">
            <div className="inline-block mb-3 sm:mb-4">
              <span
                className={`text-[11px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-widest ${
                  isDarkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                Our Team
              </span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              Meet Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400">
                Team
              </span>
            </h1>
            <p
              className={`text-sm sm:text-base md:text-xl max-w-3xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              A passionate group of developers, designers, and mentors working together to build amazing projects.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
            {/* Team Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: '👥',
                  title: 'Team Members',
                  desc: 'Experienced developers and mentors dedicated to student success.',
                },
                {
                  icon: '🎯',
                  title: 'Expertise',
                  desc: 'Full-stack development, UI/UX design, and project management.',
                },
                {
                  icon: '💡',
                  title: 'Mentorship',
                  desc: 'Guiding students through real-world projects and challenges.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`p-5 md:p-6 rounded-xl border backdrop-blur ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/60'
                      : 'bg-white/60 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">{card.icon}</div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {card.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Team Section Info */}
            <div
              className={`text-center p-5 sm:p-6 md:p-8 rounded-xl border ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
              }`}
            >
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 md:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Building the Future Together! 🚀
              </h2>
              <p className={`text-sm sm:text-base md:text-lg mb-4 md:mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Our team is committed to providing quality education and mentorship to help students succeed in their development journey.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm opacity-80">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Learn more about our team members and their expertise.
                </span>
              </div>
            </div>

            {/* Coming Soon Note */}
            <div
              className={`p-3 sm:p-4 rounded-lg border ${
                isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p className={`text-xs sm:text-sm text-center ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
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

