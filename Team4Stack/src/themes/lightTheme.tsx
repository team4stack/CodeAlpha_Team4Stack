import React, { useEffect } from 'react';

export const LightTheme: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* LIGHT MODE THEME - Complete Independence */
      
      /* Light Mode CSS Variables */
      .light {
        /* Light Mode Colors - Clean White Design */
        --primary: #8b5cf6;
        --primary-dark: #7c3aed;
        --primary-light: #a78bfa;
        --secondary: #10b981;
        --secondary-dark: #059669;
        --secondary-light: #34d399;
        --accent: #06b6d4;
        --accent-dark: #0891b2;
        --accent-light: #22d3ee;
        
        /* Background Colors - Pure White */
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --bg-glass: rgba(139, 92, 246, 0.1);
        --bg-glass-hover: rgba(139, 92, 246, 0.15);
        --bg-glass-strong: rgba(139, 92, 246, 0.05);
        --bg-card: rgba(255, 255, 255, 0.9);
        --bg-card-hover: rgba(255, 255, 255, 1);
        
        /* Text Colors - Dark on White */
        --text-primary: #1f2937;
        --text-secondary: #4b5563;
        --text-tertiary: #6b7280;
        --text-inverse: #ffffff;
        --text-accent: #8b5cf6;
        --text-muted: #9ca3af;
        
        /* Border Colors */
        --border-primary: rgba(139, 92, 246, 0.3);
        --border-secondary: rgba(16, 185, 129, 0.2);
        --border-accent: #8b5cf6;
        --border-glow: rgba(139, 92, 246, 0.4);
        
        /* Shadow Colors - Subtle for Light Mode */
        --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
        --shadow-glow: 0 0 30px rgba(139, 92, 246, 0.2);
        --shadow-neon: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(16, 185, 129, 0.1);
        --shadow-purple: 0 0 20px rgba(139, 92, 246, 0.2);
        
        /* Premium Gradients - Purple & Green Mixing */
        --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%);
        --gradient-secondary: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
        --gradient-accent: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
        --gradient-glass: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
        --gradient-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
        --gradient-card: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
        
        /* Background */
        background: var(--gradient-bg);
        color: var(--text-primary);
      }

      /* Light Mode Body Override */
      .light body {
        background: #ffffff !important;
        color: #1f2937 !important;
      }

      /* Light Mode Section Overrides */
      .light .section-padding {
        background: #ffffff !important;
      }

      .light #services {
        background: #ffffff !important;
      }

      .light #about {
        background: #ffffff !important;
      }

      .light #projects {
        background: #ffffff !important;
      }

      .light #courses {
        background: #ffffff !important;
      }

      .light #contact {
        background: #ffffff !important;
      }

      /* Light Mode Card Styles */
      .light .card {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(139, 92, 246, 0.2) !important;
        color: #1f2937 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      }

      .light .card * {
        color: #1f2937 !important;
      }

      /* Light Mode Text Overrides */
      .light h1, .light h2, .light h3, .light h4, .light h5, .light h6 {
        color: #1f2937 !important;
      }

      .light p, .light span, .light div {
        color: #4b5563 !important;
      }

      /* Light Mode Navigation */
      .light .nav-glass {
        background: rgba(255, 255, 255, 0.9) !important;
        border-bottom: 2px solid rgba(139, 92, 246, 0.2) !important;
        color: #1f2937 !important;
      }

      .light .nav-link {
        color: #4b5563 !important;
      }

      .light .nav-link:hover {
        color: #8b5cf6 !important;
        background: rgba(139, 92, 246, 0.1) !important;
      }

      /* Light Mode Button Styles */
      .light .btn-primary {
        background: var(--gradient-primary) !important;
        color: white !important;
        border: none !important;
        box-shadow: var(--shadow-glow) !important;
      }

      .light .btn-secondary {
        background: var(--gradient-secondary) !important;
        color: white !important;
        border: none !important;
        box-shadow: var(--shadow-glow) !important;
      }

      .light .btn-ghost {
        background: transparent !important;
        color: var(--primary) !important;
        border: 2px solid var(--primary) !important;
        box-shadow: none !important;
      }

      /* Light Mode Form Styles */
      .light .form-input {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid rgba(139, 92, 246, 0.2) !important;
        color: #1f2937 !important;
      }

      .light .form-label {
        color: #4b5563 !important;
      }

      /* Light Mode Profile Avatar */
      .light .profile-avatar img {
        filter: brightness(1) contrast(1) saturate(1) !important;
      }

      /* Light Mode Transitions */
      .light * {
        transition: all 0.3s ease !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default LightTheme;
