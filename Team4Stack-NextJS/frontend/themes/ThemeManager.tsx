'use client'

import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import LightThemeClean from './lightThemeClean';
import DarkThemeClean from './darkThemeClean';

const ThemeManager: React.FC = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Apply theme classes to document
    const root = document.documentElement;
    const body = document.body;
    
    // Add a transition class to prevent flashes
    root.classList.add('theme-transition');
    body.classList.add('theme-transition');
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Force a reflow to ensure the transition class is applied
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = root.offsetHeight;
    
    // Add current theme class
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.add('light');
      body.classList.add('light');
    }

    // Keep favicon as consistent across all states - no change needed
    // Favicon is already set in index.html, no need to change it dynamically
    
    // Cleanup function to remove transition class after theme change
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
      body.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [isDarkMode]);

  return (
    <>
      {isDarkMode ? <DarkThemeClean /> : <LightThemeClean />}
    </>
  );
};

export default ThemeManager;