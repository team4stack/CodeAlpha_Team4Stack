'use client'

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeManager from '@/themes/ThemeManager';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeManager />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
