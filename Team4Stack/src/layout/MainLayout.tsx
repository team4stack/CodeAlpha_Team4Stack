import React from 'react';
import { core, utilities, modals } from '../components';

const { Navbar, Footer } = core;
const { WhatsAppButton } = utilities;
const { PWAInstallPrompt } = modals;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
      <PWAInstallPrompt />
    </>
  );
};

export default MainLayout;