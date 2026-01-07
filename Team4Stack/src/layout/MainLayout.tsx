import React from 'react';
import { utilities, modals } from '../components';
import MainNavbar from '../components/navigation/MainNavbar';
import { MainFooter } from '../shared/components/Footer';
const { WhatsAppButton } = utilities;
const { PWAInstallPrompt } = modals;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <MainNavbar />
      <main className="responsive-main">
        {children}
      </main>
      <MainFooter />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </>
  );
};

export default MainLayout;