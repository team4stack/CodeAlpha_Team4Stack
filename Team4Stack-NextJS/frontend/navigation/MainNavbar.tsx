'use client'

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/lib/auth/components/AuthModal';
import MobileNavigation from '@/components/MobileNavigation';
import './HomeNavbar.css';

type NavbarLink = {
  name: string;
  href: string;
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [activeHash, setActiveHash] = useState<string>('');
  const lastActiveHashRef = useRef<string>('');
  const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '/projects' },
    { name: 'Courses', href: '/courses' },
    { name: 'Contact', href: '#contact' }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force logo reload when theme changes
  useEffect(() => {
    setLogoKey(prev => prev + 1);
    setLogoLoaded(false);
  }, [isDarkMode]);

  // Load navbar links from database via API
  useEffect(() => {
    const loadNavbarLinks = async () => {
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings(['navbar_links'])
        const data = (Array.isArray(result.data) ? result.data : []).find((s: any) => s.key === 'navbar_links')
        
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Remove any "Home" style entries coming from database,
              // because logo + text handle the Home scroll behavior now.
              const filtered = parsed.filter((link: NavbarLink) => {
                const name = link?.name?.toLowerCase?.() || '';
                return name !== 'home' && name !== 'start' && name !== 'main';
              }).map((link: NavbarLink) => {
                const name = String(link?.name ?? '').trim();
                const href = String(link?.href ?? '').trim();
                const lower = name.toLowerCase();
                if (lower === 'team' || lower.includes('team')) {
                  return { name: name || 'Team', href: '/team' };
                }
                if (lower === 'projects' || lower.includes('project')) {
                  return { name: name || 'Projects', href: '/projects' };
                }
                return { name, href };
              });
              if (filtered.length > 0) {
                setNavbarLinks(filtered);
              }
            }
          } catch {}
        }
      } catch {}
    };

    loadNavbarLinks();
    // Note: Realtime subscriptions removed - data is fetched on mount only
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

    const isHash = selector.startsWith('#');
    const isHome = selector === '#home';

    const scrollOnHome = () => {
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveHash('#home');
        lastActiveHashRef.current = '#home';
      } else if (isHash) {
        scrollToSelector(selector);
        setActiveHash(selector);
        lastActiveHashRef.current = selector;
      }
    };

    // If we're not on the main page, navigate home first, then scroll
    if (pathname !== '/') {
      router.push('/');
      // Give Next.js a moment to render the home sections
      setTimeout(scrollOnHome, 400);
      return;
    }

    // Already on home page
    scrollOnHome();
  };

  useEffect(() => {
    if (pathname !== '/') {
      setActiveHash('');
      lastActiveHashRef.current = '';
    }
  }, [pathname]);

  // no-op: liquid effect removed per new glass btn styling


  return (
    <>
      {/* Fixed navbar with proper positioning (mix with hero at top, solid on scroll) */}
      <nav
        className={`navbar-fixed home-nav transition-all duration-300 ${
          isScrolled ? 'home-nav--scrolled' : 'home-nav--top'
        }`}
      style={{
        willChange: 'auto'
      }}
      role="navigation" aria-label="Main navigation">
        <div
          className={`home-nav__blur-layer${isScrolled ? ' home-nav__blur-layer--full' : ''}`}
          aria-hidden
        />
        <div className="container-custom px-4 sm:px-6 relative">
          <div className="home-nav__bar">
            {/* Logo */}
            <a 
              href="/" 
              className="home-nav__logo flex items-center gap-2 sm:gap-3 group focus:outline-none rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shrink-0 opacity-100"
              aria-label="Team4Stack Home"
              onClick={(e) => {
                e.preventDefault()
                setActiveHash('')
                lastActiveHashRef.current = ''
                if (pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  router.push('/')
                }
              }}
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <img
                  src={`/Team4Stack_Transparant.svg?t=${logoKey}`}
                  alt="Team4Stack Logo"
                  className={`w-full h-full object-contain rounded-lg shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="eager"
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(true)}
                  key={`logo-${logoKey}`}
                />
              </div>
              <span className="home-nav__brand text-lg sm:text-xl font-bold tracking-tight transition-all duration-300 group-hover:opacity-90 group-active:scale-95">
                Team4Stack
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="home-nav__dock hidden md:flex">
              {/* Team as regular nav item - moved to first position */}
              {(() => {
                const isTeamActive = pathname?.startsWith('/team');
                return (
              <a
                href="/team"
                className={`home-nav__link focus:outline-none group inline-block${isTeamActive ? ' home-nav__link--active' : ''}`}
                aria-label="Team"
                title="Team — Meet Our Team"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveHash('')
                  lastActiveHashRef.current = ''
                  router.push('/team')
                }}
              >
                Team
              </a>
                );
              })()}
              {navbarLinks
                .filter((link) => link.name?.toLowerCase() !== 'team') // Filter out Team from navbarLinks since we show it separately
                .map((link) => {
                const isCoursesLink =
                  link.href === '/courses' ||
                  link.name?.toLowerCase?.() === 'courses';
                const isProjectsLink =
                  link.href === '/projects' ||
                  link.href === '#projects' ||
                  link.name?.toLowerCase?.() === 'projects';
                const isHashLink = link.href.startsWith('#');
                const isActive = isHashLink
                  ? pathname === '/' && activeHash !== '' && activeHash === link.href
                  : link.href === '/courses'
                    ? pathname?.startsWith('/courses')
                    : isProjectsLink
                      ? pathname?.startsWith('/projects')
                      : false;

                const baseClasses = `home-nav__link focus:outline-none relative group inline-block${isActive ? ' home-nav__link--active' : ''}`;

                if (isCoursesLink) {
                  const coursesActive = pathname?.startsWith('/courses');
                  return (
                    <a
                      key={link.href}
                      href="/courses"
                      className={`home-nav__link focus:outline-none relative group inline-block${coursesActive ? ' home-nav__link--active' : ''}`}
                      aria-label={link.name}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveHash('');
                        lastActiveHashRef.current = '';
                        router.push('/courses');
                      }}
                    >
                      {link.name}
                    </a>
                  );
                }

                if (isProjectsLink) {
                  const projectsActive = pathname?.startsWith('/projects');
                  return (
                    <a
                      key={link.href}
                      href="/projects"
                      className={`home-nav__link focus:outline-none relative group inline-block${projectsActive ? ' home-nav__link--active' : ''}`}
                      aria-label={link.name}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveHash('');
                        lastActiveHashRef.current = '';
                        router.push('/projects');
                      }}
                    >
                      {link.name}
                    </a>
                  );
                }

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={baseClasses}
                    aria-label={link.name}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </a>
                );
              })}
              <a
                href="/stackstore"
                className={`home-nav__link relative focus:outline-none group inline-block${pathname?.startsWith('/stackstore') ? ' home-nav__link--active' : ''}`}
                aria-label="StackStore Marketplace"
                title="StackStore — Marketplace"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveHash('')
                  lastActiveHashRef.current = ''
                  router.push('/stackstore')
                }}
              >
                StackStore
              </a>
            </div>

            {/* Right-side actions */}
            <div className="home-nav__actions hidden md:flex items-center gap-2 shrink-0">
              {/* Auth button/avatar */}
              {!loading && (
                user ? (
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsUserMenuOpen(prev => !prev)
                      }}
                      className="home-nav__profile-btn flex items-center gap-2 cursor-pointer btn-plain"
                    >
                      <div className="home-nav__profile-avatar">
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
                          className="fixed inset-0 z-10000"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsUserMenuOpen(false)
                          }}
                        />
                        <div 
                          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-10001 ${
                            isDarkMode 
                              ? 'bg-gray-800 border border-gray-700' 
                              : 'bg-white border border-gray-200'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2">
                            <div className={`px-3 py-2 rounded-md ${
                              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                              <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {user.name || 'User'}
                              </p>
                              {user.email && (
                                <p className={`text-xs mt-0.5 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {user.email}
                                </p>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                              <button 
                                onClick={() => {
                                  router.push('/settings');
                                  setIsUserMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                  isDarkMode
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </button>
                              <a 
                                href="/adminlandingt4s" 
                                className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                  user.role === 'admin' 
                                    ? (isDarkMode
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-700 hover:bg-gray-100')
                                    : 'hidden'
                                }`}
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin Panel
                              </a>
                              <button 
                                onClick={async () => {
                                  setIsUserMenuOpen(false)
                                  await signOut()
                                  router.push('/')
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                  isDarkMode
                                    ? 'text-red-400 hover:bg-gray-700'
                                    : 'text-red-600 hover:bg-gray-100'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                              </button>
                            </div>
                          </div>
                    </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="btn-plain home-nav__auth-btn"
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
                    <span className="text-sm font-medium text-white leading-tight truncate w-full">
                      {user.name || 'User'}
                    </span>
                    {user.username && (
                      <span className="text-xs text-white/70 leading-tight truncate w-full">
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
                  className="home-nav__auth-btn p-2 rounded-lg transition-all flex items-center justify-center btn-plain focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Sign In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              {/* Mobile Menu Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  // Ensure toggle fires even when some layers are animating.
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  // Fallback for browsers that don't reliably fire pointer events.
                  setIsMenuOpen((prev) => !prev);
                }}
                className="home-nav__menu-btn btn-plain p-2 relative z-10002 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-0"
                aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="home-nav__glow-line pointer-events-none h-px w-full" />
      </nav>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          setOauthError(null);
        }}
        initialError={oauthError}
      />

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenSettings={() => router.push('/settings')}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </>
  );
};

export default Navbar;
