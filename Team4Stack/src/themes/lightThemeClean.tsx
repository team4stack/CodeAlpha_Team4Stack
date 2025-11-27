import React, { useEffect } from 'react';

export const LightThemeClean: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'light-theme-styles';
    style.textContent = `
      /* LIGHT MODE THEME - Vibrant Neo-Glass (inspired by references) */
      
      /* Light Mode CSS Variables */
      .light {
        /* Core palette */
        --primary: #6c63ff;           /* indigo */
        --primary-dark: #5247ff;
        --primary-light: #8b86ff;
        --secondary: #00c2ff;         /* cyan */
        --secondary-dark: #0098cc;
        --secondary-light: #47d6ff;
        --accent: #ff3d9a;            /* magenta */
        --accent-dark: #dc167f;
        --accent-light: #ff7bbd;

        /* Star Ratings */
        --star-filled: #f59e0b;       /* amber-500 */
        --star-empty: #d1d5db;        /* gray-300 */

        /* Backgrounds */
        --bg-primary: #ffffff;
        --bg-secondary: #f7fbff;      /* bluish tint */
        --bg-tertiary: #eef2ff;
        --bg-card: #ffffff;
        --bg-card-hover: #f5f8ff;
        --bg-glass: rgba(108, 99, 255, 0.08);
        --bg-glass-hover: rgba(108, 99, 255, 0.12);

        /* Typography */
        --text-primary: #111827;      /* gray-900 */
        --text-secondary: #374151;    /* gray-700 */
        --text-tertiary: #6b7280;     /* gray-500 */
        --text-inverse: #ffffff;
        --text-accent: #6c63ff;

        /* Borders & Shadows */
        --border-primary: #e6e9ff;
        --border-secondary: #d9defa;
        --border-accent: #6c63ff;
        --border-glow: rgba(108, 99, 255, 0.28);
        --shadow-sm: 0 1px 3px rgba(17, 24, 39, 0.06);
        --shadow-md: 0 4px 6px rgba(17, 24, 39, 0.08);
        --shadow-lg: 0 10px 15px rgba(17, 24, 39, 0.1);
        --shadow-xl: 0 20px 25px rgba(17, 24, 39, 0.12);
        --shadow-glow: 0 0 24px rgba(108, 99, 255, 0.2);

        /* Gradients */
        --gradient-primary: linear-gradient(135deg, #6c63ff 0%, #00c2ff 60%, #ff3d9a 100%);
        --gradient-secondary: linear-gradient(135deg, #00c2ff 0%, #6c63ff 60%, #ff3d9a 100%);
        --gradient-accent: linear-gradient(135deg, #ff3d9a 0%, #6c63ff 100%);
        --gradient-bg: radial-gradient(900px circle at 15% -10%, rgba(255,61,154,0.12), transparent 60%), radial-gradient(900px circle at 85% 10%, rgba(0,194,255,0.12), transparent 55%), linear-gradient(180deg, #ffffff 0%, #f7fbff 60%, #ffffff 100%);
      }

      /* Light Mode Body */
      .light body {
        background: #ffffff !important;
        color: #1f2937 !important;
        transition: background 0.3s ease, color 0.3s ease !important;
      }

      /* Light Mode Sections */
      .light .section-padding {
        background: #ffffff !important;
        transition: background 0.3s ease !important;
      }

      .light #services,
      .light #about,
      .light #projects,
      .light #courses,
      .light #contact,
      .light #reviews {
        background: #ffffff !important;
        transition: background 0.3s ease !important;
      }

      /* Light Mode Cards */
      .light .card {
        background: #ffffff !important;
        border: 1px solid #e5e7eb !important;
        color: #1f2937 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
      }

      .light .card * {
        color: #1f2937 !important;
        transition: color 0.3s ease !important;
      }

      /* Light Mode Text */
      .light h1, .light h2, .light h3, .light h4, .light h5, .light h6 {
        color: #1f2937 !important;
        transition: color 0.3s ease !important;
      }

      .light p, .light span, .light div {
        color: #4b5563 !important;
        transition: color 0.3s ease !important;
      }

      /* Light Mode Navigation */
      .light .nav-glass {
        background: rgba(255, 255, 255, 0.75) !important;
        backdrop-filter: blur(10px) !important;
        border-bottom: 1px solid var(--border-primary) !important;
        box-shadow: var(--shadow-md) !important;
        color: var(--text-primary) !important;
        transition: all 0.3s ease !important;
      }

      .light .nav-link {
        color: #4b5563 !important;
        transition: all 0.3s ease !important;
      }

      .light .nav-link:hover { color: #6c63ff !important; background: rgba(108, 99, 255, 0.1) !important; }

      /* Light Mode Buttons */
      .light .btn-primary {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 2px solid var(--border-glow) !important;
        box-shadow: var(--shadow-glow) !important;
        transition: all 0.3s ease !important;
      }

      .light .btn-primary:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-xl), var(--shadow-glow) !important;
      }

      .light .btn-primary:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgb(255, 255, 255), var(--shadow-glow) !important;
        border-color: var(--border-accent) !important;
      }

      .light .btn-primary:active {
        transform: translateY(0) !important;
        box-shadow: var(--shadow-md) !important;
      }

      .light .btn-secondary {
        background: var(--gradient-secondary) !important;
        color: #ffffff !important;
        border: 2px solid rgba(16, 185, 129, 0.25) !important;
        box-shadow: 0 6px 14px rgba(16, 185, 129, 0.25) !important;
        transition: all 0.3s ease !important;
      }

      .light .btn-secondary:hover {
        filter: brightness(1.04) !important;
        transform: translateY(-2px) !important;
      }

      .light .btn-secondary:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.20), 0 6px 14px rgba(16, 185, 129, 0.25) !important;
        border-color: rgba(16, 185, 129, 0.4) !important;
      }

      .light .btn-secondary:active {
        transform: translateY(0) !important;
        box-shadow: var(--shadow-md) !important;
      }

      .light .btn-ghost {
        background: transparent !important;
        color: var(--primary) !important;
        border: 2px solid var(--primary) !important;
        box-shadow: none !important;
        transition: all 0.3s ease !important;
      }

      .light .btn-ghost:hover {
        background: rgba(124, 58, 237, 0.08) !important;
      }

      .light .btn-ghost:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18) !important;
      }

      .light .btn-ghost:active {
        transform: translateY(0) !important;
        box-shadow: var(--shadow-sm) !important;
      }

      /* Light Mode Form Elements */
      .light .form-input {
        background: #ffffff !important;
        border: 1px solid #d1d5db !important;
        color: #1f2937 !important;
        transition: all 0.3s ease !important;
      }

      .light .form-label {
        color: #4b5563 !important;
        transition: color 0.3s ease !important;
      }

      /* Light Mode Skills Tags */
      .light .bg-white\\/20 {
        background: #f3f4f6 !important;
        color: #1f2937 !important;
        border: 1px solid #d1d5db !important;
        transition: all 0.3s ease !important;
      }

      /* Light Mode Profile Images */
      .light .profile-avatar img {
        filter: brightness(1) contrast(1) saturate(1) !important;
        transition: filter 0.3s ease !important;
      }

      /* Courses section enroll button override (Hero excluded) */
      .light #courses .card button.w-full {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 2px solid var(--border-glow) !important;
        box-shadow: var(--shadow-glow) !important;
        transition: all 0.3s ease !important;
      }

      .light #courses .card button.w-full:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px) !important;
      }

      .light #courses .card button.w-full:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18), var(--shadow-glow) !important;
      }

      .light #courses .card button.w-full:active {
        transform: translateY(0) !important;
        box-shadow: var(--shadow-md) !important;
      }

      /* Team (About) and Projects buttons - match Sir's View Profile (Light Only) */
      .light #about .card a,
      .light #about .card a *,
      .light #about .card button,
      .light #about .card button *,
      .light #projects .card a,
      .light #projects .card a *,
      .light #projects .card button,
      .light #projects .card button *,
      .light #projects .card .btn-primary {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 2px solid var(--border-glow) !important;
        box-shadow: var(--shadow-glow) !important;
        transition: all 0.3s ease !important;
      }

      .light #about .card a:hover,
      .light #about .card button:hover,
      .light #projects .card a:hover,
      .light #projects .card button:hover,
      .light #projects .card .btn-primary:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-xl), var(--shadow-glow) !important;
      }

      .light #about .card a:focus,
      .light #about .card button:focus,
      .light #projects .card a:focus,
      .light #projects .card button:focus,
      .light #projects .card .btn-primary:focus {
        outline: none !important;
        box-shadow: 0 0 0 3px #ffffff, var(--shadow-glow) !important;
      }

      .light #about .card a:active,
      .light #about .card button:active,
      .light #projects .card a:active,
      .light #projects .card button:active,
      .light #projects .card .btn-primary:active {
        transform: translateY(0) !important;
        box-shadow: var(--shadow-md) !important;
      }

      /* GitHub button navbar-style override - Light mode: Dark glassmorphic style for visibility */
      /* Using maximum specificity to override all other rules including .cta styles */
      .light #about .t4s-card .actions .cta-row a.github-btn-navbar-style,
      .light #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style,
      .light #about .card .actions .cta-row a.github-btn-navbar-style,
      .light #about article.t4s-card .actions .cta-row a.github-btn-navbar-style,
      .light #about .t4s-card a.github-btn-navbar-style,
      .light #about .t4s-card.team-neon a.github-btn-navbar-style,
      .light #about .card a.github-btn-navbar-style,
      .light #about article.t4s-card a.github-btn-navbar-style {
        background: rgba(108, 99, 255, 0.15) !important;
        background-image: none !important;
        background-color: rgba(108, 99, 255, 0.15) !important;
        border: 1px solid rgba(108, 99, 255, 0.3) !important;
        border-radius: 50px !important;
        color: #6c63ff !important;
        box-shadow: 0 2px 8px rgba(108, 99, 255, 0.2) !important;
        backdrop-filter: blur(16px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
        position: relative !important;
        overflow: hidden !important;
        z-index: 1 !important;
        filter: none !important;
        padding: 0.5rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        transition: all 0.2s ease !important;
      }

      /* Glassmorphic texture effect - Light mode: Purple/indigo gradient for visibility */
      .light #about .t4s-card .actions .cta-row a.github-btn-navbar-style::before,
      .light #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style::before,
      .light #about .card .actions .cta-row a.github-btn-navbar-style::before,
      .light #about article.t4s-card .actions .cta-row a.github-btn-navbar-style::before,
      .light #about .t4s-card a.github-btn-navbar-style::before,
      .light #about .t4s-card.team-neon a.github-btn-navbar-style::before,
      .light #about .card a.github-btn-navbar-style::before,
      .light #about article.t4s-card a.github-btn-navbar-style::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: linear-gradient(180deg, rgba(108, 99, 255, 0.2) 0%, rgba(108, 99, 255, 0.08) 40%, rgba(108, 99, 255, 0.03) 70%, transparent 100%) !important;
        pointer-events: none !important;
        border-radius: inherit !important;
        z-index: 0 !important;
      }

      /* Additional 3D layered effect from top-left - Light mode */
      .light #about .t4s-card .actions .cta-row a.github-btn-navbar-style::after,
      .light #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style::after,
      .light #about .card .actions .cta-row a.github-btn-navbar-style::after,
      .light #about article.t4s-card .actions .cta-row a.github-btn-navbar-style::after,
      .light #about .t4s-card a.github-btn-navbar-style::after,
      .light #about .t4s-card.team-neon a.github-btn-navbar-style::after,
      .light #about .card a.github-btn-navbar-style::after,
      .light #about article.t4s-card a.github-btn-navbar-style::after {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 50% !important;
        height: 50% !important;
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, transparent 100%) !important;
        pointer-events: none !important;
        border-radius: inherit !important;
        z-index: 0 !important;
      }

      .light #about .t4s-card .actions .cta-row a.github-btn-navbar-style:hover,
      .light #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style:hover,
      .light #about .card .actions .cta-row a.github-btn-navbar-style:hover,
      .light #about article.t4s-card .actions .cta-row a.github-btn-navbar-style:hover,
      .light #about .t4s-card a.github-btn-navbar-style:hover,
      .light #about .t4s-card.team-neon a.github-btn-navbar-style:hover,
      .light #about .card a.github-btn-navbar-style:hover,
      .light #about article.t4s-card a.github-btn-navbar-style:hover {
        background: rgba(108, 99, 255, 0.25) !important;
        background-image: none !important;
        background-color: rgba(108, 99, 255, 0.25) !important;
        box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3) !important;
        transform: translateY(-1px) !important;
        filter: none !important;
      }

      .light #about .t4s-card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .light #about .t4s-card.team-neon .actions .cta-row a.github-btn-navbar-style:hover::before,
      .light #about .card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .light #about article.t4s-card .actions .cta-row a.github-btn-navbar-style:hover::before,
      .light #about .t4s-card a.github-btn-navbar-style:hover::before,
      .light #about .t4s-card.team-neon a.github-btn-navbar-style:hover::before,
      .light #about .card a.github-btn-navbar-style:hover::before,
      .light #about article.t4s-card a.github-btn-navbar-style:hover::before {
        background: linear-gradient(180deg, rgba(108, 99, 255, 0.3) 0%, rgba(108, 99, 255, 0.12) 40%, rgba(108, 99, 255, 0.05) 70%, transparent 100%) !important;
      }

      /* Portfolio button gradient design - Modern gradient matching website style */
      .light #about .t4s-card .actions .cta-row a.portfolio-btn-gradient,
      .light #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient,
      .light #about .card .actions .cta-row a.portfolio-btn-gradient,
      .light #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient,
      .light #about .t4s-card a.portfolio-btn-gradient,
      .light #about .t4s-card.team-neon a.portfolio-btn-gradient,
      .light #about .card a.portfolio-btn-gradient,
      .light #about article.t4s-card a.portfolio-btn-gradient {
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%) !important;
        background-image: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%) !important;
        background-color: transparent !important;
        border: 1px solid rgba(139, 92, 246, 0.3) !important;
        border-radius: 50px !important;
        color: #ffffff !important;
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4), 0 0 0 rgba(6, 182, 212, 0.25) !important;
        position: relative !important;
        overflow: hidden !important;
        z-index: 1 !important;
        filter: none !important;
        font-weight: 400 !important;
      }

      /* Portfolio button text color fix - Ensure white text in light mode */
      .light #about .t4s-card .actions .cta-row a.portfolio-btn-gradient *,
      .light #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient *,
      .light #about .card .actions .cta-row a.portfolio-btn-gradient *,
      .light #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient *,
      .light #about .t4s-card a.portfolio-btn-gradient *,
      .light #about .t4s-card.team-neon a.portfolio-btn-gradient *,
      .light #about .card a.portfolio-btn-gradient *,
      .light #about article.t4s-card a.portfolio-btn-gradient * {
        color: #ffffff !important;
      }

      /* Portfolio button shimmer effect */
      .light #about .t4s-card .actions .cta-row a.portfolio-btn-gradient::before,
      .light #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient::before,
      .light #about .card .actions .cta-row a.portfolio-btn-gradient::before,
      .light #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient::before,
      .light #about .t4s-card a.portfolio-btn-gradient::before,
      .light #about .t4s-card.team-neon a.portfolio-btn-gradient::before,
      .light #about .card a.portfolio-btn-gradient::before,
      .light #about article.t4s-card a.portfolio-btn-gradient::before {
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

      .light #about .t4s-card .actions .cta-row a.portfolio-btn-gradient:hover,
      .light #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient:hover,
      .light #about .card .actions .cta-row a.portfolio-btn-gradient:hover,
      .light #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient:hover,
      .light #about .t4s-card a.portfolio-btn-gradient:hover,
      .light #about .t4s-card.team-neon a.portfolio-btn-gradient:hover,
      .light #about .card a.portfolio-btn-gradient:hover,
      .light #about article.t4s-card a.portfolio-btn-gradient:hover {
        background: linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #818cf8 100%) !important;
        background-image: linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #818cf8 100%) !important;
        box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5), 0 0 20px rgba(6, 182, 212, 0.35) !important;
        transform: translateY(-2px) !important;
        filter: brightness(1.15) !important;
      }

      .light #about .t4s-card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .light #about .t4s-card.team-neon .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .light #about .card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .light #about article.t4s-card .actions .cta-row a.portfolio-btn-gradient:hover::before,
      .light #about .t4s-card a.portfolio-btn-gradient:hover::before,
      .light #about .t4s-card.team-neon a.portfolio-btn-gradient:hover::before,
      .light #about .card a.portfolio-btn-gradient:hover::before,
      .light #about article.t4s-card a.portfolio-btn-gradient:hover::before {
        left: 100% !important;
      }

      /* Light Mode - Team Cards Buttons Visibility Fix */
      .light #about .t4s-card .actions .cta-row .cta,
      .light #about .t4s-card.team-neon .actions .cta-row .cta,
      .light #about article.t4s-card .actions .cta-row .cta {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 1px solid var(--border-glow) !important;
        box-shadow: var(--shadow-glow) !important;
      }

      .light #about .t4s-card .actions .cta-row .cta:hover,
      .light #about .t4s-card.team-neon .actions .cta-row .cta:hover,
      .light #about article.t4s-card .actions .cta-row .cta:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-xl), var(--shadow-glow) !important;
      }

      /* Preview Button - Light Mode */
      .light #about .t4s-card .actions .cta-row .preview-btn,
      .light #about .t4s-card.team-neon .actions .cta-row .preview-btn,
      .light #about article.t4s-card .actions .cta-row .preview-btn {
        background: var(--gradient-primary) !important;
        color: #ffffff !important;
        border: 1px solid var(--border-glow) !important;
        box-shadow: var(--shadow-glow) !important;
      }

      .light #about .t4s-card .actions .cta-row .preview-btn:hover,
      .light #about .t4s-card.team-neon .actions .cta-row .preview-btn:hover,
      .light #about article.t4s-card .actions .cta-row .preview-btn:hover {
        filter: brightness(1.05) !important;
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-xl), var(--shadow-glow) !important;
      }

      /* Light Mode - Mobile Navigation Button Design (Separate from Dark Mode) */
      /* 3-Line Menu Button */
      .light nav button[aria-label="Open mobile menu"] {
        background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%) !important;
        border: 2px solid #6c63ff !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3), 0 2px 4px rgba(108, 99, 255, 0.2) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .light nav button[aria-label="Open mobile menu"] svg {
        color: #ffffff !important;
      }

      .light nav.scrolled button[aria-label="Open mobile menu"] {
        background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%) !important;
        border: 2px solid #6c63ff !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3), 0 2px 4px rgba(108, 99, 255, 0.2) !important;
      }

      .light nav.scrolled button[aria-label="Open mobile menu"] svg {
        color: #ffffff !important;
      }

      .light nav button[aria-label="Open mobile menu"]:hover {
        background: linear-gradient(135deg, #5247ff 0%, #7c3aed 100%) !important;
        border-color: #5247ff !important;
        box-shadow: 0 6px 16px rgba(108, 99, 255, 0.4), 0 4px 8px rgba(108, 99, 255, 0.3) !important;
        transform: translateY(-1px) !important;
      }

      /* Sign In Button - Mobile */
      .light nav button[aria-label="Sign In"] {
        background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%) !important;
        border: 2px solid #6c63ff !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3), 0 2px 4px rgba(108, 99, 255, 0.2) !important;
      }

      .light nav button[aria-label="Sign In"] svg {
        color: #ffffff !important;
      }

      .light nav button[aria-label="Sign In"]:hover {
        background: linear-gradient(135deg, #5247ff 0%, #7c3aed 100%) !important;
        border-color: #5247ff !important;
        box-shadow: 0 6px 16px rgba(108, 99, 255, 0.4), 0 4px 8px rgba(108, 99, 255, 0.3) !important;
        transform: translateY(-1px) !important;
      }

      /* Mobile Navigation Close Button */
      .light .mobile-nav-close-button {
        background: linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%) !important;
        border: 2px solid #6c63ff !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3), 0 2px 4px rgba(108, 99, 255, 0.2) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .light .mobile-nav-close-button svg {
        color: #ffffff !important;
      }

      .light .mobile-nav-close-button:hover {
        background: linear-gradient(135deg, #5247ff 0%, #7c3aed 100%) !important;
        border-color: #5247ff !important;
        box-shadow: 0 6px 16px rgba(108, 99, 255, 0.4), 0 4px 8px rgba(108, 99, 255, 0.3) !important;
        transform: translateY(-1px) !important;
      }

      /* Light Mode - Mobile Navigation Panel Buttons Design (Enhanced) */
      /* Navigation Items Buttons (StackStore, Home, Team, etc.) */
      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button) {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%) !important;
        border: 2px solid rgba(108, 99, 255, 0.5) !important;
        color: #1f2937 !important;
        box-shadow: 
          0 2px 8px rgba(108, 99, 255, 0.2),
          inset 0 1px 3px rgba(255, 255, 255, 0.6),
          inset 0 -1px 2px rgba(108, 99, 255, 0.1) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-weight: 600 !important;
        position: relative !important;
        overflow: hidden !important;
      }

      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button)::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent) !important;
        transition: left 0.5s ease !important;
        z-index: 0 !important;
      }

      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button):hover {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%) !important;
        border-color: #6c63ff !important;
        color: #6c63ff !important;
        box-shadow: 
          0 6px 16px rgba(108, 99, 255, 0.35),
          inset 0 1px 3px rgba(255, 255, 255, 0.7),
          inset 0 -1px 2px rgba(108, 99, 255, 0.15) !important;
        transform: translateX(6px) scale(1.02) !important;
      }

      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button):hover::before {
        left: 100% !important;
      }

      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button) span {
        position: relative !important;
        z-index: 1 !important;
      }

      /* User Profile Button */
      .light .mobile-nav-panel button[class*="w-full flex items-center gap-3"] {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%) !important;
        border: 2px solid rgba(108, 99, 255, 0.5) !important;
        color: #1f2937 !important;
        box-shadow: 
          0 3px 10px rgba(108, 99, 255, 0.2),
          inset 0 1px 3px rgba(255, 255, 255, 0.6) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .light .mobile-nav-panel button[class*="w-full flex items-center gap-3"]:hover {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%) !important;
        border-color: #6c63ff !important;
        box-shadow: 
          0 6px 18px rgba(108, 99, 255, 0.35),
          inset 0 1px 3px rgba(255, 255, 255, 0.7) !important;
        transform: translateY(-2px) !important;
      }

      /* User Menu Dropdown Buttons (Settings, Admin Panel, Logout) */
      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button),
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"] {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%) !important;
        border: 2px solid rgba(108, 99, 255, 0.45) !important;
        color: #1f2937 !important;
        box-shadow: 
          0 2px 8px rgba(108, 99, 255, 0.18),
          inset 0 1px 3px rgba(255, 255, 255, 0.6),
          inset 0 -1px 2px rgba(108, 99, 255, 0.1) !important;
        margin-bottom: 0.5rem !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-weight: 500 !important;
        position: relative !important;
        overflow: hidden !important;
      }

      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button)::before,
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"]::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
        transition: left 0.4s ease !important;
        z-index: 0 !important;
      }

      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button):hover,
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"]:hover {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%) !important;
        border-color: #6c63ff !important;
        color: #6c63ff !important;
        box-shadow: 
          0 5px 14px rgba(108, 99, 255, 0.35),
          inset 0 1px 3px rgba(255, 255, 255, 0.7),
          inset 0 -1px 2px rgba(108, 99, 255, 0.15) !important;
        transform: translateX(6px) scale(1.02) !important;
      }

      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button):hover::before,
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"]:hover::before {
        left: 100% !important;
      }

      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button) span,
      .light .mobile-nav-panel button[class*="text-left px-3 py-2"]:not(.mobile-nav-close-button) svg,
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"] span,
      .light .mobile-nav-panel a[class*="text-left px-3 py-2"] svg {
        position: relative !important;
        z-index: 1 !important;
      }

      /* Dark Mode Toggle Button */
      .light .mobile-nav-panel button[aria-label*="Switch"],
      .light .mobile-nav-panel button[aria-label*="mode"] {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
        border: 2px solid #f59e0b !important;
        color: #1f2937 !important;
        box-shadow: 
          0 4px 12px rgba(251, 191, 36, 0.3),
          inset 0 1px 3px rgba(255, 255, 255, 0.5),
          inset 0 -1px 2px rgba(251, 191, 36, 0.2) !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .light .mobile-nav-panel button[aria-label*="Switch"]:hover,
      .light .mobile-nav-panel button[aria-label*="mode"]:hover {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        border-color: #d97706 !important;
        box-shadow: 
          0 6px 20px rgba(251, 191, 36, 0.45),
          inset 0 1px 3px rgba(255, 255, 255, 0.6),
          inset 0 -1px 2px rgba(251, 191, 36, 0.3) !important;
        transform: scale(1.08) rotate(5deg) !important;
      }

      /* Active/Focus States for Better UX */
      .light .mobile-nav-panel button:focus:not(.mobile-nav-close-button),
      .light .mobile-nav-panel a:focus {
        outline: 3px solid rgba(108, 99, 255, 0.4) !important;
        outline-offset: 2px !important;
        border-color: #6c63ff !important;
      }

      /* Button Spacing Improvements */
      .light .mobile-nav-panel button[role="menuitem"]:not(.mobile-nav-close-button) {
        margin-bottom: 0.5rem !important;
      }

      /* Light Mode - Navbar Team4Stack Text Color (Desktop) */
      /* White when at top, black when scrolled */
      .light nav:not(.scrolled) a span.text-white,
      .light nav:not(.scrolled) span.text-white {
        color: #ffffff !important;
      }

      .light nav.scrolled a span.text-black,
      .light nav.scrolled span.text-black {
        color: #000000 !important;
      }

      /* Light Mode - Auth Modal All Text White */
      /* Target the Auth Modal container - set base color to white */
      .light div[class*="bg-\\[\\#0c1224\\]"],
      .light div[class*="backdrop-blur-xl"][class*="bg-\\[\\#0c1224\\]"] {
        color: #ffffff !important;
      }

      /* Welcome text */
      .light div[class*="bg-\\[\\#0c1224\\]"] div[class*="text-xs"],
      .light div[class*="backdrop-blur-xl"] div[class*="text-xs"] {
        color: #ffffff !important;
      }

      /* Sign In / Sign Up / Reset Password heading */
      .light div[class*="bg-\\[\\#0c1224\\]"] h3,
      .light div[class*="backdrop-blur-xl"] h3 {
        color: #ffffff !important;
      }

      /* All buttons in Auth Modal - make text white */
      .light div[class*="bg-\\[\\#0c1224\\]"] button,
      .light div[class*="backdrop-blur-xl"] button {
        color: #ffffff !important;
      }

      /* All child elements in buttons - make text white */
      .light div[class*="bg-\\[\\#0c1224\\]"] button *,
      .light div[class*="backdrop-blur-xl"] button * {
        color: #ffffff !important;
      }

      /* All spans, paragraphs, and divs in Auth Modal */
      .light div[class*="bg-\\[\\#0c1224\\]"] span,
      .light div[class*="backdrop-blur-xl"] span,
      .light div[class*="bg-\\[\\#0c1224\\]"] p,
      .light div[class*="backdrop-blur-xl"] p,
      .light div[class*="bg-\\[\\#0c1224\\]"] div,
      .light div[class*="backdrop-blur-xl"] div {
        color: #ffffff !important;
      }

      /* Preserve error and success message colors */
      .light div[class*="bg-\\[\\#0c1224\\]"] .text-red-400,
      .light div[class*="backdrop-blur-xl"] .text-red-400 {
        color: #f87171 !important;
      }
      .light div[class*="bg-\\[\\#0c1224\\]"] .text-green-400,
      .light div[class*="backdrop-blur-xl"] .text-green-400 {
        color: #4ade80 !important;
      }

      /* Input placeholders should remain visible */
      .light div[class*="bg-\\[\\#0c1224\\]"] input::placeholder,
      .light div[class*="backdrop-blur-xl"] input::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
      }

      /* Sign In button text (gradient button) */
      .light .auth-signin-btn,
      .light .auth-signin-btn *,
      .light button[class*="bg-gradient-to-r"][class*="from-pink-500"],
      .light button[class*="bg-gradient-to-r"][class*="from-pink-500"] *,
      .light div[class*="bg-\\[\\#0c1224\\]"] button[class*="bg-gradient-to-r"],
      .light div[class*="bg-\\[\\#0c1224\\]"] button[class*="bg-gradient-to-r"] * {
        color: #ffffff !important;
      }
      
      /* More specific targeting for Auth Modal buttons */
      .light div[class*="backdrop-blur-xl"] button[class*="bg-gradient-to-r"],
      .light div[class*="backdrop-blur-xl"] button[class*="bg-gradient-to-r"] *,
      .light div[class*="backdrop-blur-xl"] .auth-signin-btn,
      .light div[class*="backdrop-blur-xl"] .auth-signin-btn * {
        color: #ffffff !important;
      }

      /* Light Mode - Mobile Navigation Panel Text Colors */
      .light .mobile-nav-panel button:not(.mobile-nav-close-button) span,
      .light .mobile-nav-panel a span,
      .light .mobile-nav-panel button:not(.mobile-nav-close-button),
      .light .mobile-nav-panel a {
        color: #1f2937 !important;
      }

      /* Light Mode - User Profile Text in Mobile Nav */
      .light .mobile-nav-panel button span.text-white,
      .light .mobile-nav-panel button span.text-white\\/70,
      .light .mobile-nav-panel .text-white,
      .light .mobile-nav-panel .text-white\\/70 {
        color: #1f2937 !important;
      }

      .light .mobile-nav-panel button span.text-white\\/70,
      .light .mobile-nav-panel .text-white\\/70 {
        color: #6b7280 !important;
      }

      /* Light Mode - Mobile Nav SVG Icons */
      .light .mobile-nav-panel button:not(.mobile-nav-close-button):not([aria-label*="Switch"]) svg,
      .light .mobile-nav-panel a svg {
        color: #1f2937 !important;
      }

      .light .mobile-nav-panel button:hover:not(.mobile-nav-close-button):not([aria-label*="Switch"]) svg,
      .light .mobile-nav-panel a:hover svg {
        color: #6c63ff !important;
      }

      /* Light Mode Transitions */
      .light * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }

      /* HERO SECTION - Always Dark (Special Case) */
      .light #home {
        background:
          radial-gradient(900px circle at 10% 5%, rgba(255,61,154,0.22), transparent 60%),
          radial-gradient(900px circle at 85% 15%, rgba(0,194,255,0.22), transparent 55%),
          linear-gradient(135deg, #21124a 0%, #0a1b4f 50%, #2b0f3a 100%) !important;
        transition: background 0.3s ease !important;
      }

      .light #home * {
        color: white !important;
        transition: color 0.3s ease !important;
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

      .light #home .bg-white\\/10 {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .light #home .border-white\\/20 {
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
    `;
    
    // Remove any existing light theme styles
    const existingStyle = document.getElementById('light-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById('light-theme-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return null;
};

export default LightThemeClean;