'use client'

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ColorTheme } from '@/types/theme';

type ThemeContextType = {
  theme: ColorTheme;
  isDarkMode: boolean;
  setTheme: (theme: ColorTheme) => void;
  toggleDarkMode: () => void;
};

const defaultTheme: ColorTheme = 'cyberpunk';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ColorTheme>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set default to true for dark mode

  // Theme application is now handled by ThemeManager component

  const toggleDarkMode = () => {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
    }, 10);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
