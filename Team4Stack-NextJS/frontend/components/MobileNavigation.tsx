'use client'

import React, { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

type NavbarLink = {
  name: string;
  href: string;
};

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStackStore?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose, onOpenStackStore, onOpenSettings, onOpenAuth }) => {
  const { isDarkMode } = useTheme();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([
    { name: 'Home', href: '#home' },
    { name: 'Team', href: '/team' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Courses', href: '#courses' },
    { name: 'Contact', href: '#contact' }
  ]);

  // Handle clicks outside the navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Add touch event listeners for swipe detection
  useEffect(() => {
    const element = navRef.current;
    if (!element) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    };

    const handleSwipeGesture = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      // Detect left swipe (closing the menu)
      if (diff > swipeThreshold) {
        onClose();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Load navbar links from database (same as Navbar)
  useEffect(() => {
    const loadNavbarLinks = async () => {
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings(['navbar_links'])
        const data = Array.isArray(result.data) ? result.data.find((s: any) => s.key === 'navbar_links') : undefined
        
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Normalize "Team" link even if DB config contains wrong href.
              const normalized = parsed.map((l: any) => {
                const name = String(l?.name ?? '').trim();
                const href = String(l?.href ?? '').trim();
                const lower = name.toLowerCase();
                const looksLikeTeam = lower === 'team' || lower.includes('team');
                const safeHref = looksLikeTeam ? '/team' : href;
                return {
                  name: name || 'Team',
                  href: safeHref || '/team',
                };
              });
              setNavbarLinks(normalized);
            }
          } catch {}
        }
      } catch {}
    };

    loadNavbarLinks();
    // Note: Realtime subscriptions removed - data is fetched on mount only
  }, []);

  // Handle navigation item click
  const handleNavItemClick = (href: string) => {
    onClose();
    if (href.startsWith('/')) {
      setTimeout(() => {
        router.push(href);
      }, 200);
      return;
    }
    if (href.startsWith('#') && pathname !== '/') {
      setTimeout(() => {
        router.push(`/${href}`);
      }, 200);
      return;
    }
    // For internal section links, scroll to the section
    // Add a delay to ensure the menu is closed and components are loaded
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        // Try multiple scroll methods for better compatibility
        try {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
          // Fallback to manual scrolling
          const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: offsetTop - 80, // Adjust for navbar height
            behavior: 'smooth'
          });
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Element with id '${href}' not found`);
        }
        // If element not found, try navigating to home page with hash
        if (href.startsWith('#')) {
          window.location.hash = href.substring(1);
        }
      }
    }, 300); // Increased delay to ensure components are loaded
  };

  // Handle keyboard navigation for menu items
  const handleKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavItemClick(href);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-nav-overlay"
            className="fixed left-0 right-0 bottom-0 top-16 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={onClose}
            role="presentation"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={navRef}
            key="mobile-nav-panel"
            className={`mobile-nav-panel fixed top-16 left-0 w-[16.5rem] max-w-[85vw] z-[10000] shadow-2xl overflow-hidden rounded-r-3xl rounded-l-none ${
              isDarkMode
                ? 'bg-slate-950/85 text-white border-r border-white/10'
                : 'bg-white/85 text-slate-900 border-r border-slate-900/10'
            } backdrop-blur-xl max-h-[calc(100vh-4rem)] h-auto`}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            style={{ willChange: 'transform' }}
          >
            <div className="flex flex-col">
          {/* Spacer header (no logo/name and no inside X button) */}
          <div className={`h-12 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

          {/* Navigation Items */}
          <div className="overflow-y-auto py-4 max-h-[calc(100vh-7rem)]">
            <div className="flex flex-col space-y-2 px-4">
              {/* StackStore (Coming soon) - COMMENTED OUT */}
              {/* <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onOpenStackStore && onOpenStackStore(), 200);
                }}
                className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                aria-label="Open StackStore (Coming soon)"
                role="menuitem"
              >
                <span className="flex items-center justify-between">
                  <span className="font-medium">StackStore</span>
                  <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'opacity-70' : 'opacity-60 text-gray-600'}`}>Coming soon</span>
                </span>
              </button> */}
              {/* Navigation items from database */}
              {navbarLinks.map((link) => {
                // Skip Home if it's a hash link, handle it specially
                if (link.href === '#home' || link.href === '/') {
                  return (
                    <button
                      key={link.href}
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          if (link.href === '#home') {
                            if (pathname !== '/') {
                              router.push('/');
                            } else {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          } else {
                            window.location.href = link.href;
                          }
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onClose();
                          setTimeout(() => {
                            if (link.href === '#home') {
                              if (pathname !== '/') {
                                router.push('/');
                              } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            } else {
                              window.location.href = link.href;
                            }
                          }, 200);
                        }
                      }}
                      className={`text-left px-4 py-3 rounded-xl transition-colors duration-200 border border-transparent ${
                        isDarkMode
                          ? 'text-white hover:bg-white/10 hover:border-white/15'
                          : 'text-gray-800 hover:bg-gray-100 hover:border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      aria-label={`Go to ${link.name} section`}
                      role="menuitem"
                    >
                      <span className="font-medium">{link.name}</span>
                    </button>
                  );
                }

                // Handle Courses as simple link (dropdown removed)
                const isCoursesLink = link.href === '/courses' || link.name?.toLowerCase() === 'courses';
                if (isCoursesLink) {
                  return (
                    <button
                      key={link.href}
                      onClick={() => {
                        onClose();
                        setTimeout(() => router.push('/courses'), 200);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 border border-transparent ${
                        isDarkMode
                          ? 'text-white hover:bg-white/10 hover:border-white/15'
                          : 'text-gray-800 hover:bg-gray-100 hover:border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      role="menuitem"
                    >
                      <span className="font-medium">{link.name}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavItemClick(link.href)}
                    onKeyDown={(e) => handleKeyDown(e, link.href)}
                    className={`text-left px-4 py-3 rounded-xl transition-colors duration-200 border border-transparent ${
                      isDarkMode
                        ? 'text-white hover:bg-white/10 hover:border-white/15'
                        : 'text-gray-800 hover:bg-gray-100 hover:border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    aria-label={`Go to ${link.name} section`}
                    role="menuitem"
                  >
                    <span className="font-medium">{link.name}</span>
                  </button>
                );
              })}
              
              {/* Blog link removed */}
            </div>
          </div>

          {/* User Section - Show only if logged in */}
          {!loading && user && (
            <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="space-y-2">
                {/* User Profile Display */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-start justify-center min-w-0 text-left">
                    <span className="text-sm font-medium text-white leading-tight truncate w-full text-left">{user.name || 'User'}</span>
                    {user.username && (
                      <span className="text-xs text-white/70 leading-tight truncate w-full text-left">@{user.username}</span>
                    )}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-white/70 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Menu Dropdown */}
                {isUserMenuOpen && (
                  <div className="mt-2 space-y-1">
                    {onOpenSettings && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onClose();
                          setTimeout(() => onOpenSettings && onOpenSettings(), 200);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <a
                        href="/adminsami"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onClose();
                        }}
                        className="block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Panel
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onClose();
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer spacing */}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
