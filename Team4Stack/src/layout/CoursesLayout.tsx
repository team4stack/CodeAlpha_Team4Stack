import React from 'react';
import { utilities, modals } from '../components';
import CoursesNavbar from '../components/navigation/CoursesNavbar';
import { MainFooter } from '../shared/components/Footer';
const { WhatsAppButton } = utilities;
const { PWAInstallPrompt } = modals;

interface CoursesLayoutProps {
  children: React.ReactNode;
}

const CoursesLayout: React.FC<CoursesLayoutProps> = ({ children }) => {
  return (
    <>
      <CoursesNavbar />
      <main className="responsive-main pt-16 md:pt-20">
        {children}
      </main>
      <MainFooter />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </>
  );
};

export default CoursesLayout;


