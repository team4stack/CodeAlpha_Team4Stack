import React from 'react';
import CoursesNavbar from '@/navigation/CoursesNavbar';

interface CourseDetailShellProps {
  children: React.ReactNode;
}

const CourseDetailShell: React.FC<CourseDetailShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18]">
      <CoursesNavbar />
      {children}
    </div>
  );
};

export default CourseDetailShell;
