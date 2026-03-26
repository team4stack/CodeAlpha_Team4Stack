import React, { useEffect } from 'react';

export const DarkTheme: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* DARK MODE THEME - Complete Independence */
      
      /* Dark Mode CSS Variables */
      .dark {
        /* Cyberpunk Colors - Bold Green and Purple */
        --primary: #00ff88;
        --primary-dark: #00cc6a;
        --primary-light: #33ff99;
        --secondary: #8b5cf6;
        --secondary-dark: #7c3aed;
        --secondary-light: #a78bfa;
        --accent: #06b6d4;
        --accent-dark: #0891b2;
        --accent-light: #22d3ee;
        
        /* Background Colors - Dark Cyberpunk */
        --bg-primary: #0a0a0a;
        --bg-secondary: #1a1a1a;
        --bg-tertiary: #2a2a2a;
        --bg-glass: rgba(0, 255, 136, 0.1);
        --bg-glass-hover: rgba(0, 255, 136, 0.15);
        --bg-glass-strong: rgba(0, 255, 136, 0.05);
        --bg-card: rgba(26, 26, 26, 0.9);
        --bg-card-hover: rgba(26, 26, 26, 1);
        
        /* Text Colors - Bright on Dark */
        --text-primary: #ffffff;
        --text-secondary: #e5e7eb;
        --text-tertiary: #d1d5db;
        --text-inverse: #000000;
        --text-accent: #00ff88;
        --text-muted: #9ca3af;
        
        /* Border Colors */
        --border-primary: rgba(0, 255, 136, 0.3);
        --border-secondary: rgba(139, 92, 246, 0.2);
        --border-accent: #00ff88;
        --border-glow: rgba(0, 255, 136, 0.4);
        
        /* Shadow Colors - Neon Glow */
        --shadow-sm: 0 1px 3px rgba(0, 255, 136, 0.2);
        --shadow-md: 0 4px 6px rgba(0, 255, 136, 0.3);
        --shadow-lg: 0 10px 15px rgba(0, 255, 136, 0.4);
        --shadow-xl: 0 20px 25px rgba(0, 255, 136, 0.5);
        --shadow-glow: 0 0 30px rgba(0, 255, 136, 0.4);
        --shadow-neon: 0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(139, 92, 246, 0.3);
        --shadow-purple: 0 0 20px rgba(139, 92, 246, 0.4);
        
        /* Premium Gradients - Cyberpunk */
        --gradient-primary: linear-gradient(135deg, #00ff88 0%, #8b5cf6 100%);
        --gradient-secondary: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
        --gradient-accent: linear-gradient(135deg, #06b6d4 0%, #00ff88 100%);
        --gradient-glass: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        --gradient-bg: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
        --gradient-card: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
        
        /* Background */
        background: var(--gradient-bg);
        color: var(--text-primary);
      }

      /* Dark Mode Body Override */
      .dark body {
        background: var(--gradient-bg) !important;
        color: #ffffff !important;
      }

      /* Dark Mode Section Overrides */
      .dark .section-padding {
        background: var(--gradient-bg) !important;
      }

      .dark #services {
        background: var(--gradient-bg) !important;
      }

      .dark #about {
        background: var(--gradient-bg) !important;
      }

      .dark #projects {
        background: var(--gradient-bg) !important;
      }

      .dark #courses {
        background: var(--gradient-bg) !important;
      }

      .dark #contact {
        background: var(--gradient-bg) !important;
      }

      /* Dark Mode Card Styles */
      .dark .card {
        background: rgba(26, 26, 26, 0.9) !important;
        border: 2px solid rgba(0, 255, 136, 0.3) !important;
        color: #ffffff !important;
        box-shadow: var(--shadow-glow) !important;
      }

      .dark .card * {
        color: #ffffff !important;
      }

      /* Dark Mode Text Overrides */
      .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
        color: #ffffff !important;
      }

      .dark p, .dark span, .dark div {
        color: #e5e7eb !important;
      }

      /* Dark Mode Navigation */
      .dark .nav-glass {
        background: rgba(26, 26, 26, 0.9) !important;
        border-bottom: 2px solid rgba(0, 255, 136, 0.3) !important;
        color: #ffffff !important;
      }

      .dark .student-nav.nav-glass {
        border-bottom: 0 !important;
        box-shadow: none !important;
      }

      .dark .nav-link {
        color: #e5e7eb !important;
      }

      .dark .nav-link:hover {
        color: #00ff88 !important;
        background: rgba(0, 255, 136, 0.1) !important;
      }

      /* Dark Mode Button Styles */
      .dark .btn-primary {
        background: var(--gradient-primary) !important;
        color: #000000 !important;
        border: none !important;
        box-shadow: var(--shadow-neon) !important;
      }

      .dark .btn-secondary {
        background: var(--gradient-secondary) !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: var(--shadow-neon) !important;
      }

      .dark .btn-ghost {
        background: transparent !important;
        color: #00ff88 !important;
        border: 2px solid #00ff88 !important;
        box-shadow: none !important;
      }

      /* Dark Mode Form Styles */
      .dark .form-input {
        background: rgba(26, 26, 26, 0.9) !important;
        border: 2px solid rgba(0, 255, 136, 0.3) !important;
        color: #ffffff !important;
      }

      .dark .form-label {
        color: #e5e7eb !important;
      }

      /* Dark Mode Profile Avatar */
      .dark .profile-avatar img {
        filter: brightness(1.1) contrast(1.1) saturate(1.1) !important;
      }

      /* Dark Mode Transitions */
      .dark * {
        transition: all 0.3s ease !important;
      }

      /* HERO SECTION - Always Dark in Both Modes */
      .light #home {
        background: linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%) !important;
      }

      .light #home * {
        color: white !important;
      }

      .light #home h1 {
        color: white !important;
      }

      .light #home p {
        color: #d1d5db !important;
      }

      .light #home .text-gray-300 {
        color: #d1d5db !important;
      }

      .light #home .text-pink-400 {
        color: #f472b6 !important;
      }

      .light #home .bg-white\/10 {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .light #home .border-white\/20 {
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      /* HERO SECTION - Force Dark Mode Colors in Light Mode */
      .light #home .bg-gradient-to-r.from-pink-500.to-purple-500 {
        background: linear-gradient(to right, #ec4899, #a855f7) !important;
      }

      .light #home .bg-gradient-to-r.from-blue-500.to-cyan-500 {
        background: linear-gradient(to right, #3b82f6, #06b6d4) !important;
      }

      .light #home .bg-gradient-to-r.from-purple-500.to-pink-500 {
        background: linear-gradient(to right, #a855f7, #ec4899) !important;
      }

      .light #home .bg-gradient-to-r.from-cyan-500.to-blue-500 {
        background: linear-gradient(to right, #06b6d4, #3b82f6) !important;
      }

      .light #home .bg-gradient-to-r.from-green-500.to-emerald-500 {
        background: linear-gradient(to right, #10b981, #059669) !important;
      }

      .light #home .bg-pink-400 {
        background-color: #f472b6 !important;
      }

      .light #home .bg-cyan-400 {
        background-color: #22d3ee !important;
      }

      .light #home .bg-purple-400 {
        background-color: #c084fc !important;
      }

      .light #home .bg-blue-400 {
        background-color: #60a5fa !important;
      }

      .light #home .text-white {
        color: white !important;
      }

      .light #home .text-gray-300 {
        color: #d1d5db !important;
      }

      .light #home .text-pink-400 {
        color: #f472b6 !important;
      }

      .light #home .bg-white\/10 {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .light #home .border-white\/20 {
        border-color: rgba(255, 255, 255, 0.2) !important;
      }

      .light #home .bg-white {
        background-color: white !important;
      }

      .light #home .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default DarkTheme;
