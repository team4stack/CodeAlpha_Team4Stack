'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Window interface for beforeinstallprompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

const PWAInstallPrompt: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [manualInstallMode, setManualInstallMode] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running as standalone (installed)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Check if running from home screen on iOS
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    if (checkIfInstalled()) {
      return;
    }

    // Check if user has already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem('pwaInstallPromptDismissed');
    const dismissedTime = hasSeenPrompt ? parseInt(hasSeenPrompt, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show prompt again after 7 days if user dismissed it
    if (hasSeenPrompt && daysSinceDismissed < 7) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (e.g., 10 seconds after page load)
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback prompt for browsers where beforeinstallprompt does not fire
    // (common on iOS Safari and some desktop contexts).
    const fallbackTimer = window.setTimeout(() => {
      if (isInstalled) return;
      if (deferredPrompt) return;
      setManualInstallMode(true);
      setShowPrompt(true);
    }, 12000);

    // Check if app gets installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwaInstallPromptDismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      // User accepted the install prompt
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwaInstallPromptDismissed');
    } else {
      // User dismissed the install prompt
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[10000] animate-slide-up">
      <div className={`rounded-2xl border ${
        isDarkMode 
          ? 'bg-[#0c1224]/95 border-white/10 backdrop-blur-xl text-white' 
          : 'bg-white/95 border-gray-200 backdrop-blur-xl text-gray-900 shadow-xl'
      } p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Install Team4Stack App
            </h3>
            <p className={`text-xs mb-3 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              {manualInstallMode
                ? 'Add this app to your home screen from the browser menu for quick access and a better experience.'
                : 'Install our app for a better experience. Quick access, offline support, and more!'}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={manualInstallMode ? handleDismiss : handleInstallClick}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {manualInstallMode ? 'Got it' : 'Install'}
              </button>
              <button
                onClick={handleDismiss}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/15 text-white/80' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'hover:bg-white/10 text-white/60' 
                : 'hover:bg-gray-100 text-gray-400'
            }`}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

