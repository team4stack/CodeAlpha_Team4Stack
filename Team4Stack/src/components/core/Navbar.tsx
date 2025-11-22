import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import StackStoreModal from '../stackstore';
import { useAuth } from '../../auth';
import AuthModal from '../../auth/components/AuthModal';
import UserSettingsModal from '../modals/UserSettingsModal';
import { supabase } from '../../utils/supabaseClient';

type NavbarLink = {
  name: string;
  href: string;
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStackStoreOpen, setIsStackStoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([
    { name: 'Home', href: '#home' },
    { name: 'Team', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Courses', href: '#courses' },
    { name: 'Contact', href: '#contact' }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force logo reload when theme changes
  useEffect(() => {
    setLogoKey(prev => prev + 1);
    setLogoLoaded(false);
  }, [isDarkMode]);

  // Load navbar links from database
  useEffect(() => {
    const loadNavbarLinks = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'navbar_links')
          .single();
        
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setNavbarLinks(parsed);
            }
          } catch {}
        }
      } catch {}
    };

    loadNavbarLinks();

    // Real-time subscription
    const channel = supabase
      .channel('navbar_links')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.navbar_links' }, () => {
        loadNavbarLinks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle OAuth errors and password reset callbacks from Supabase
  useEffect(() => {
    const handleOAuthCallback = () => {
      // Check for OAuth errors in URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        // Decode error description if present
        let errorMsg = 'Authentication failed. Please try again.';
        if (errorDescription) {
          try {
            const decoded = decodeURIComponent(errorDescription);
            // Check for specific error types
            if (decoded.includes('Unable to exchange external code')) {
              errorMsg = 'OAuth configuration error. Please check your Google OAuth settings in Supabase dashboard.';
            } else if (decoded.includes('access_denied')) {
              errorMsg = 'Access denied. Please grant the required permissions.';
            } else {
              errorMsg = decoded;
            }
          } catch {
            errorMsg = errorDescription;
          }
        }
        
        setOauthError(errorMsg);
        setIsAuthOpen(true);
        
        // Clear error from URL
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
      
      // Check if URL has password reset token in hash
      let hash = window.location.hash;
      
      // Handle double hash format: #type=recovery#access_token=...
      if (hash.includes('#type=') && hash.includes('#access_token=')) {
        // Extract everything after first #
        hash = hash.substring(1);
        // Replace all # with & to make it a proper query string
        hash = hash.replace(/#/g, '&');
      }
      
      // Parse hash parameters
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // No sensitive info in logs
        // Password reset link clicked - open modal
        setIsAuthOpen(true);
        // Clear URL hash after a short delay to allow modal to open
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname);
        }, 500);
      }
    };
    
    // Check immediately on mount
    handleOAuthCallback();
    
    // Also listen for hash changes
    const handleHashChange = () => {
      handleOAuthCallback();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close user menu on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isUserMenuOpen]);

  const scrollToSelector = (selector: string) => {
    let attempts = 0;
    const maxAttempts = 20; // try for ~2s
    const intervalMs = 100;

    const tryScroll = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        try {
          // Use smooth scroll with offset for navbar
          const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 80;
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            window.scrollTo({ 
              top: Math.max(0, offsetTop), 
              behavior: 'smooth' 
            });
          });
        } catch {
          const offsetTop = el.getBoundingClientRect().top + window.pageYOffset;
          requestAnimationFrame(() => {
            window.scrollTo({ 
              top: Math.max(0, offsetTop - 80), 
              behavior: 'smooth' 
            });
          });
        }
        return;
      }
      if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryScroll, intervalMs);
      }
    };
    tryScroll();
  };

  const handleLinkClick = (e: React.MouseEvent, selector: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (selector === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollToSelector(selector);
  };

  // no-op: liquid effect removed per new glass btn styling

  return (
    <>
      {/* Fixed navbar with proper positioning */}
      <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isScrolled
          ? (isDarkMode ? 'nav-glass shadow-lg scrolled' : 'bg-white/90 shadow-lg border-b border-gray-200 scrolled')
          : (isDarkMode ? 'bg-transparent' : 'bg-transparent')
      }`} 
      style={{
        isolation: 'isolate',
        willChange: 'auto'
      }}
      role="navigation" aria-label="Main navigation">
        {isScrolled && (
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] animate-spin" style={{
              animationDuration: '90s',
              backgroundImage: `repeating-linear-gradient(0deg, rgba(148,163,184,0.25) 0, rgba(148,163,184,0.25) 1px, transparent 1px, transparent 30px),
                                repeating-linear-gradient(90deg, rgba(148,163,184,0.22) 0, rgba(148,163,184,0.22) 1px, transparent 1px, transparent 30px)`,
              maskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)'
            }} />
          </div>
        )}
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Hide when mobile menu is open */}
            <a 
              href="#home" 
              className={`flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'
              }`}
              aria-label="Team4Stack Home"
              onClick={(e) => handleLinkClick(e, '#home')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-transparent' : 'bg-black'} transition-all duration-300`} style={{ minWidth: '40px', minHeight: '40px', padding: isDarkMode ? '0' : '4px' }}>
                <img
                  src={`/Team4stack_Logo.png?v=8&t=${logoKey}`}
                  alt="Team4Stack Logo"
                  className={`rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-contain ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ width: '32px', height: '32px', display: 'block' }}
                  loading="eager"
                  onLoad={() => setLogoLoaded(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('fallback')) {
                      target.src = `/Team4stack_Logo.png?v=8&fallback=1&t=${logoKey}`;
                    }
                    setLogoLoaded(true);
                  }}
                  key={`logo-${isDarkMode ? 'dark' : 'light'}-${logoKey}`}
                />
              </div>
              <span 
                className={`text-xl font-display font-bold ${isScrolled ? (isDarkMode ? 'gradient-text' : 'text-black') : 'text-white'}`}
                style={{
                  textShadow: 'none',
                  WebkitTextStroke: 'none',
                  isolation: 'isolate'
                }}
              >Team4Stack</span>
            </a>

            {/* Desktop Navigation (center) */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navbarLinks.map((link) => (
              <a
                  key={link.href}
                  href={link.href}
                className={`${isScrolled
                  ? (isDarkMode ? 'text-white/90 hover:text-white transition-colors px-3 py-2' : 'text-gray-800 hover:text-purple-600 transition-colors px-3 py-2')
                  : 'text-white hover:text-purple-300 font-medium px-4 py-2 transition-all duration-300'
                } focus:outline-none relative group inline-block`}
                  aria-label={link.name}
                  onClick={(e) => handleLinkClick(e, link.href)}
              >
                  {link.name}
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-px bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              </a>
              ))}
              {/* StackStore as regular nav item with tiny badge (same style/animation) */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsStackStoreOpen(true); }}
                className={`${isScrolled
                  ? (isDarkMode ? 'text-white/90 hover:text-white transition-colors px-3 py-2' : 'text-gray-800 hover:text-purple-600 transition-colors px-3 py-2')
                  : 'text-white hover:text-purple-300 font-medium px-4 py-2 transition-all duration-300'
                } badge-visible relative focus:outline-none group inline-block`}
                aria-label="Open StackStore (Coming soon)"
                title="StackStore — Coming soon"
                role="button"
              >
                StackStore
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                <span className={`${isDarkMode ? 'bg-white/20 text-white/90 border-white/30' : 'bg-gray-200 text-gray-700 border-gray-300'} absolute -top-2 right-1 z-10 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest border shadow-sm`}>SOON</span>
              </a>
            </div>

            {/* Right-side actions: Dark Mode + Auth */}
            <div className="hidden md:flex items-center gap-2">
              {/* Dark Mode Toggle - Icon Button */}
              <div className="hidden md:flex items-center mr-2">
                <button
                  onClick={toggleDarkMode}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isScrolled
                      ? (isDarkMode ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white' : 'bg-gray-100/80 hover:bg-gray-200/80 border border-gray-300 text-gray-700')
                      : (isDarkMode ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white' : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white')
                  } backdrop-blur-sm`}
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                  role="switch"
                  aria-checked={isDarkMode}
                >
                  {isDarkMode ? (
                    // Moon icon for dark mode
                    <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    // Sun icon for light mode
                    <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Auth button/avatar */}
              {!loading && (
                user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col items-start min-w-0 max-w-[140px]">
                        <span className="text-sm font-medium text-white leading-tight truncate w-full">{user.name || 'User'}</span>
                        {user.username && (
                          <span className="text-xs text-white/70 leading-tight truncate w-full">@{user.username}</span>
                        )}
                      </div>
                    </button>
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl text-sm z-50 shadow-lg">
                          <button 
                            onClick={() => {
                              setIsSettingsOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </button>
                          <a 
                            href="/adminsami" 
                            className={`block px-3 py-2 hover:bg-white/10 flex items-center gap-2 ${user.role === 'admin' ? '' : 'hidden'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Panel
                          </a>
                          <button 
                            onClick={signOut} 
                            className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                    </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] transition-all hover:scale-110 flex items-center justify-center"
                    aria-label="Sign In"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                )
              )}

            </div>

            {/* Mobile Actions: User Info + Sign In/Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* User Info - Mobile Only (when logged in) */}
              {!loading && user && (
                <div className="flex items-center gap-2 mr-2 max-w-[120px] sm:max-w-[150px]">
                  <div className="flex flex-col items-start min-w-0 w-full">
                    <span className={`text-sm font-medium leading-tight truncate w-full ${isScrolled ? (isDarkMode ? 'text-white' : 'text-gray-800') : 'text-white'}`}>
                      {user.name || 'User'}
                    </span>
                    {user.username && (
                      <span className={`text-xs leading-tight truncate w-full ${isScrolled ? (isDarkMode ? 'text-white/70' : 'text-gray-600') : 'text-white/70'}`}>
                        @{user.username}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* Sign In Button - Mobile Only (when not logged in) */}
              {!loading && !user && (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                    isScrolled
                      ? (isDarkMode 
                          ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg' 
                          : 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg')
                      : 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                  aria-label="Sign In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                  isScrolled
                    ? (isDarkMode 
                        ? 'bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/30' 
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200')
                    : 'bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/30 text-white'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                aria-label="Open mobile menu"
                aria-expanded={isMenuOpen}
              >
                <svg className={`w-6 h-6 ${isScrolled ? (isDarkMode ? 'text-white' : 'text-gray-600') : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          setOauthError(null);
        }}
        initialError={oauthError}
      />

      {/* StackStore Modal */}
      <StackStoreModal 
        isOpen={isStackStoreOpen}
        onClose={() => setIsStackStoreOpen(false)}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Navbar;