import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CertificateProps {
  courseName: string;
  studentName?: string;
}

const Certificate: React.FC<CertificateProps> = ({ courseName, studentName }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-lg border-2 shadow-lg p-6 ${
      isDarkMode 
        ? 'border-green-500 bg-gray-800' 
        : 'border-green-500 bg-white'
    }`}>
      <div className="text-center">
        <h5 className={`text-xl font-bold mb-2 ${
          isDarkMode ? 'text-green-400' : 'text-green-600'
        }`}>
          Course Completed
        </h5>
        <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Congratulations <strong>{studentName || 'Student'}</strong>! You have successfully completed the{' '}
          <strong>{courseName}</strong> course.
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Downloadable certificates can be enabled after integrating a PDF service.
        </p>
      </div>
    </div>
  );
};

export default Certificate;

