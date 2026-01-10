import React from 'react';
import { AdmissionForm } from '../sections';
import CoursesNavbar from '@/navigation/CoursesNavbar';

const AdmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <CoursesNavbar />
      <AdmissionForm />
    </div>
  );
};

export default AdmissionPage;


