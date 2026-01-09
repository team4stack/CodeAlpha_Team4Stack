import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const StackStorePage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300">
      <section className={`pt-24 md:pt-28 ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}>
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest ${
                isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                Marketplace
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400">
                StackStore
              </span>
            </h1>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A marketplace where students can showcase, share, and sell their projects — all in one place.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Projects</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  List your web apps, tools, and creative builds for others to discover.
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">💰</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Set Your Price</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose your pricing model and start earning from your projects.
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-4xl mb-4">⭐</div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get Feedback</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Receive reviews, ratings, and valuable feedback from the community.
                </p>
              </div>
            </div>

            {/* Coming Soon Message */}
            <div className={`text-center p-8 rounded-xl border ${isDarkMode ? 'bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-emerald-50 border-purple-200'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Beta is Brewing! 🎉
              </h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We're working hard to launch StackStore. Get ready to showcase your projects!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Launching soon on Team4Stack — "By Students, For Students." 🌟
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StackStorePage;

