import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { courses } from '../../landing/sections';

const CoursesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen transition-colors duration-300">
      <section className={`pt-24 md:pt-28 ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}>
        <div className="container-custom mb-12 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Courses</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore our MERN stack training options. You can join physically at WE Connect or learn online with live
            classes and real projects.
          </p>
        </div>

        {/* Reuse existing courses section design */}
        <courses.Courses />
      </section>
    </div>
  );
};

export default CoursesPage;


