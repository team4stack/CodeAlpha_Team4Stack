'use client'

import React, { useEffect } from 'react';

export const DarkThemeClean: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dark-theme-styles';
    style.textContent = `
      /* DARK MODE THEME - Aurora Neon (Purple/Blue/Magenta) */
      
      /* Dark Mode CSS Variables */
      .dark {
        /* Brand */
        --primary: #6c63ff;          /* indigo */
        --primary-dark: #5247ff;
        --primary-light: #8b86ff;
        --secondary: #00d4ff;        /* cyan */
        --secondary-dark: #00a4d1;
        --secondary-light: #49e3ff;
        --accent: #ff2d9b;           /* magenta */
        --accent-dark: #e01282;
        --accent-light: #ff6fbd;
        
        /* Star Ratings */
        --star-filled: #fbbf24;
        --star-empty: #4b5563;
        
        /* Surfaces */
        --bg-primary: #0a0f1f;
        --bg-secondary: #0e1530;
        --bg-tertiary: #121a3b;
        --bg-card: #121735;
        --bg-card-hover: #162044;
        
        /* Typography */
        --text-primary: #ffffff;
        --text-secondary: #e5e7eb;
        --text-tertiary: #cfd3da;
        --text-inverse: #000000;
        --text-accent: #00d4ff;
        
        /* Borders & Shadows */
        --border-primary: rgba(108, 99, 255, 0.35);
        --border-secondary: rgba(0, 212, 255, 0.25);
        --border-accent: rgba(255, 45, 155, 0.35);
        
        --shadow-sm: 0 1px 3px rgba(0, 212, 255, 0.18);
        --shadow-md: 0 4px 6px rgba(108, 99, 255, 0.22);
        --shadow-lg: 0 10px 18px rgba(255, 45, 155, 0.22);
        --shadow-xl: 0 20px 26px rgba(108, 99, 255, 0.28);
        --shadow-glow: 0 0 30px rgba(108, 99, 255, 0.35), 0 0 50px rgba(0, 212, 255, 0.25);
        --shadow-neon: 0 0 20px rgba(0, 212, 255, 0.45), 0 0 38px rgba(255, 45, 155, 0.28);
        
        /* Gradients */
        --gradient-primary: linear-gradient(135deg, #6c63ff 0%, #00d4ff 50%, #ff2d9b 100%);
        --gradient-secondary: linear-gradient(135deg, #00d4ff 0%, #6c63ff 60%, #ff2d9b 100%);
        --gradient-bg: 
          radial-gradient(900px circle at 20% -10%, rgba(255,45,155,0.16), transparent 60%),
          radial-gradient(900px circle at 85% 15%, rgba(0,212,255,0.16), transparent 55%),
          radial-gradient(800px circle at 40% 90%, rgba(108,99,255,0.14), transparent 60%),
          linear-gradient(180deg, #0a0f1f 0%, #0b1030 55%, #120726 100%);
      }

      /* Dark Mode Body */
      .dark body {
        background: var(--gradient-bg) !important;
        color: #ffffff !important;
        transition: background 0.3s ease, color 0.3s ease !important;
      }

      .dark body:has(.home-page) {
        background: #000000 !important;
      }

      /* Home page sections: solid black (keep blur orbs / card effects in components) */
      .dark .home-page,
      .dark .home-page section,
      .dark .home-page .section-padding,
      .dark .home-page #home,
      .dark .home-page #about,
      .dark .home-page #services,
      .dark .home-page #projects,
      .dark .home-page #contact,
      .dark .home-page #reviews,
      .dark .home-page #our-team {
        background-color: #000000 !important;
        background-image: none !important;
        transition: background 0.3s ease !important;
      }

      /* Dark Mode Cards */
      .dark .card {
        background: #1a1a1a !important;
        border: 1px solid rgba(0, 255, 136, 0.3) !important;
        color: #ffffff !important;
        box-shadow: var(--shadow-glow) !important;
        transition: all 0.3s ease !important;
      }

      .dark .card * {
        color: #ffffff !important;
        transition: color 0.3s ease !important;
      }

      /* Dark Mode Text */
      .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
        color: #ffffff !important;
        transition: color 0.3s ease !important;
      }

      .dark p, .dark span, .dark div {
        color: #e5e7eb !important;
        transition: color 0.3s ease !important;
      }

      /* Dark Mode Navigation */
      .dark .nav-glass {
        background: rgba(10, 15, 31, 0.8) !important;
        backdrop-filter: blur(10px) !important;
        border-bottom: 1px solid var(--border-primary) !important;
        color: #ffffff !important;
        transition: all 0.3s ease !important;
      }

      .dark .student-nav.nav-glass,
      .dark .student-nav {
        border-bottom: 0 !important;
        box-shadow: none !important;
      }

      .dark .nav-link {
        color: #e5e7eb !important;
        transition: all 0.3s ease !important;
      }

      .dark .nav-link:hover {
        color: #00d4ff !important;
        background: rgba(0, 212, 255, 0.1) !important;
      }

      /* Dark Mode Buttons - Enhanced Styling */
      .dark .btn-primary {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 1px solid var(--border-primary) !important;
        box-shadow: var(--shadow-neon) !important;
        position: relative !important;
        overflow: hidden !important;
        transition: all 0.3s ease !important;
      }

      .dark .btn-primary:hover {
        filter: brightness(1.05) !important;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 45, 155, 0.4) !important;
        transform: translateY(-2px) !important;
      }

      .dark .btn-primary:active { transform: translateY(0) !important; box-shadow: var(--shadow-md) !important; }

      .dark .btn-secondary {
        background: var(--gradient-secondary) !important;
        color: #ffffff !important;
        border: 1px solid var(--border-secondary) !important;
        box-shadow: var(--shadow-neon) !important;
        position: relative !important;
        overflow: hidden !important;
        transition: all 0.3s ease !important;
      }

      .dark .btn-secondary:hover { filter: brightness(1.05) !important; transform: translateY(-2px) !important; }

      .dark .btn-secondary:active {
        transform: translateY(0) !important;
        box-shadow: 0 0 15px rgba(139, 92, 246, 0.4), 0 0 30px rgba(6, 182, 212, 0.2) !important;
      }

      .dark .btn-ghost {
        background: transparent !important;
        color: var(--secondary) !important;
        border: 1px solid var(--border-secondary) !important;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.25) !important;
        position: relative !important;
        overflow: hidden !important;
        transition: all 0.3s ease !important;
      }

      .dark .btn-ghost:hover {
        background: rgba(0, 212, 255, 0.1) !important;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4) !important;
        transform: translateY(-2px) !important;
      }

      .dark .btn-ghost:active {
        transform: translateY(0) !important;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3) !important;
      }

      /* Dark Mode Button Shimmer Effect */
      .dark .btn-primary::before,
      .dark .btn-secondary::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
        transition: left 0.5s !important;
      }

      .dark .btn-primary:hover::before,
      .dark .btn-secondary:hover::before {
        left: 100% !important;
      }

      /* Courses Section - Enroll Button Override (Dark Only) */
      .dark #courses .card button.w-full { background: var(--gradient-primary) !important; color: #ffffff !important; border: 1px solid var(--border-primary) !important; box-shadow: var(--shadow-neon) !important; transition: all 0.3s ease !important; }

      .dark #courses .card button.w-full:hover { filter: brightness(1.05) !important; transform: translateY(-2px) !important; }

      .dark #courses .card button.w-full:active {
        transform: translateY(0) !important;
        box-shadow: 0 0 14px rgba(0, 255, 136, 0.35) !important;
      }

      /* Global Dark Button Treatment */
      .dark button,
      .dark .btn-primary,
      .dark .btn-secondary { border-radius: 12px !important; }

      /* About/Team Section - anchor buttons (View Portfolio, View GitHub) */
      .dark #about .card a { background: var(--gradient-primary) !important; color: #ffffff !important; border: 1px solid var(--border-primary) !important; box-shadow: var(--shadow-neon) !important; transition: all 0.3s ease !important; }

      .dark #about .card a:hover { filter: brightness(1.05) !important; transform: translateY(-2px) !important; }

      .dark #about .card a:active {
        transform: translateY(0) !important;
        box-shadow: 0 0 14px rgba(0, 255, 136, 0.35) !important;
      }

      /* GitHub button navbar-style override - Match StackStore button from hero section EXACTLY */
      /* Using maximum specificity to override all other rules including .cta styles */
      .dark #about .t4s-card .actions .cta-row a.github-btn-navbar-style,
      .dark #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style,
      .dark #about .card .actions .cta-row a.github-btn-navbar-style,
      .dark #about article.t4s-card .actions .cta-row a.github-btn-navbar-style,
      .dark #about .t4s-card a.github-btn-navbar-style,
      .dark #about .t4s-card.team-neon a.github-btn-navbar-style,
      .dark #about .card a.github-btn-navbar-style,
      .dark #about article.t4s-card a.github-btn-navbar-style {
        background: rgba(255, 255, 255, 0.06) !important;
        background-image: none !important;
        background-color: rgba(255, 255, 255, 0.06) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 50px !important;
        color: rgba(255, 255, 255, 0.9) !important;
        box-shadow: none !important;
        backdrop-filter: blur(12px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
        position: relative !important;
        overflow: hidden !important;
        z-index: 1 !important;
        filter: none !important;
      }

      /* Glassmorphic texture effect - white overlay for that white texture */
      .dark #about .t4s-card .actions .cta-row a.github-btn-navbar-style::before,
      .dark #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style::before,
      .dark #about .card .actions .cta-row a.github-btn-navbar-style::before,
      .dark #about article.t4s-card .actions .cta-row a.github-btn-navbar-style::before,
      .dark #about .t4s-card a.github-btn-navbar-style::before,
      .dark #about .t4s-card.team-neon a.github-btn-navbar-style::before,
      .dark #about .card a.github-btn-navbar-style::before,
      .dark #about article.t4s-card a.github-btn-navbar-style::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.02) 70%, transparent 100%) !important;
        pointer-events: none !important;
        border-radius: inherit !important;
        z-index: 0 !important;
      }

      /* Additional 3D layered effect from top-left */
      .dark #about .t4s-card .actions .cta-row a.github-btn-navbar-style::after,
      .dark #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style::after,
      .dark #about .card .actions .cta-row a.github-btn-navbar-style::after,
      .dark #about article.t4s-card .actions .cta-row a.github-btn-navbar-style::after,
      .dark #about .t4s-card a.github-btn-navbar-style::after,
      .dark #about .t4s-card.team-neon a.github-btn-navbar-style::after,
      .dark #about .card a.github-btn-navbar-style::after,
      .dark #about article.t4s-card a.github-btn-navbar-style::after {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 50% !important;
        height: 50% !important;
        background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%) !important;
        pointer-events: none !important;
        border-radius: inherit !important;
        z-index: 0 !important;
      }

      .dark #about .t4s-card .actions .cta-row a.github-btn-navbar-style:hover,
      .dark #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style:hover,
      .dark #about .card .actions .cta-row a.github-btn-navbar-style:hover,
      .dark #about article.t4s-card .actions .cta-row a.github-btn-navbar-style:hover,
      .dark #about .t4s-card a.github-btn-navbar-style:hover,
      .dark #about .t4s-card.team-neon a.github-btn-navbar-style:hover,
      .dark #about .card a.github-btn-navbar-style:hover,
      .dark #about article.t4s-card a.github-btn-navbar-style:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        background-image: none !important;
        background-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 0 20px rgba(255,255,255,0.1) !important;
        transform: none !important;
        filter: none !important;
      }

      .dark #about .t4s-card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .dark #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style:hover::before,
      .dark #about .card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .dark #about article.t4s-card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .dark #about .t4s-card a.github-btn-navbar-style:hover::before,
      .dark #about .t4s-card.team-neon a.github-btn-navbar-style:hover::before,
      .dark #about .card a.github-btn-navbar-style:hover::before,
      .dark #about article.t4s-card a.github-btn-navbar-style:hover::before {
        background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 70%, transparent 100%) !important;
      }

      /* Portfolio button gradient design - Modern gradient matching website style */
      .dark #about .t4s-card .actions .cta-row a.portfolio-btn-gradient,
      .dark #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient,
      .dark #about .card .actions .cta-row a.portfolio-btn-gradient,
      .dark #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient,
      .dark #about .t4s-card a.portfolio-btn-gradient,
      .dark #about .t4s-card.team-neon a.portfolio-btn-gradient,
      .dark #about .card a.portfolio-btn-gradient,
      .dark #about article.t4s-card a.portfolio-btn-gradient {
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%) !important;
        background-image: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%) !important;
        background-color: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 50px !important;
        color: #ffffff !important;
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4), 0 0 0 rgba(6, 182, 212, 0.25) !important;
        position: relative !important;
        overflow: hidden !important;
        z-index: 1 !important;
        filter: none !important;
      }

      /* Portfolio button shimmer effect */
      .dark #about .t4s-card .actions .cta-row a.portfolio-btn-gradient::before,
      .dark #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient::before,
      .dark #about .card .actions .cta-row a.portfolio-btn-gradient::before,
      .dark #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient::before,
      .dark #about .t4s-card a.portfolio-btn-gradient::before,
      .dark #about .t4s-card.team-neon a.portfolio-btn-gradient::before,
      .dark #about .card a.portfolio-btn-gradient::before,
      .dark #about article.t4s-card a.portfolio-btn-gradient::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
        transition: left 0.6s ease !important;
        z-index: 0 !important;
      }

      .dark #about .t4s-card .actions .cta-row a.portfolio-btn-gradient:hover,
      .dark #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient:hover,
      .dark #about .card .actions .cta-row a.portfolio-btn-gradient:hover,
      .dark #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient:hover,
      .dark #about .t4s-card a.portfolio-btn-gradient:hover,
      .dark #about .t4s-card.team-neon a.portfolio-btn-gradient:hover,
      .dark #about .card a.portfolio-btn-gradient:hover,
      .dark #about article.t4s-card a.portfolio-btn-gradient:hover {
        background: linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #818cf8 100%) !important;
        background-image: linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #818cf8 100%) !important;
        box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5), 0 0 20px rgba(6, 182, 212, 0.35) !important;
        transform: translateY(-2px) !important;
        filter: brightness(1.15) !important;
      }

      .dark #about .t4s-card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .dark #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .dark #about .card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .dark #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .dark #about .t4s-card a.portfolio-btn-gradient:hover::before,
      .dark #about .t4s-card.team-neon a.portfolio-btn-gradient:hover::before,
      .dark #about .card a.portfolio-btn-gradient:hover::before,
      .dark #about article.t4s-card a.portfolio-btn-gradient:hover::before {
        left: 100% !important;
      }

      /* Dark Mode Button Ripple Effect */
      .dark .btn-primary,
      .dark .btn-secondary,
      .dark .btn-ghost {
        transition: all 0.3s ease !important;
      }

      .dark .btn-primary:focus,
      .dark .btn-secondary:focus,
      .dark .btn-ghost:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.3) !important;
      }

      /* Dark Mode Form Elements */
      .dark .form-input {
        background: #1a1a1a !important;
        border: 1px solid rgba(0, 255, 136, 0.3) !important;
        color: #ffffff !important;
        transition: all 0.3s ease !important;
      }

      .dark .form-label {
        color: #e5e7eb !important;
        transition: color 0.3s ease !important;
      }

      /* Dark Mode Skills Tags */
      .dark .bg-white\\/20 {
        background: rgba(0, 255, 136, 0.1) !important;
        color: #ffffff !important;
        border: 1px solid rgba(0, 255, 136, 0.3) !important;
        transition: all 0.3s ease !important;
      }

      /* Dark Mode Profile Images */
      .dark .profile-avatar img {
        filter: brightness(1.1) contrast(1.1) saturate(1.1) !important;
        transition: filter 0.3s ease !important;
      }

      /* Dark Mode Transitions */
      .dark * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }

      /* HERO SECTION on home — solid black base; orbs/effects stay in component markup */
      .dark .home-page #home {
        background-color: #000000 !important;
        background-image: none !important;
        transition: background 0.3s ease !important;
      }

      .dark .home-page #home * {
        color: white !important;
        transition: color 0.3s ease !important;
      }

      .dark .home-page #home h1 {
        color: white !important;
      }

      .dark .home-page #home p {
        color: #d1d5db !important;
      }

      .dark .home-page #home .text-gray-300 {
        color: #d1d5db !important;
      }

      .dark .home-page #home .text-pink-400 {
        color: #f472b6 !important;
      }

      .dark .home-page #home .bg-white\\/10 {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .dark .home-page #home .border-white\\/20 {
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
    `;
    
    // Remove any existing dark theme styles
    const existingStyle = document.getElementById('dark-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById('dark-theme-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return null;
};

export default DarkThemeClean;
