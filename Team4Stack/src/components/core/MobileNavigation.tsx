// import React, { useRef, useEffect, useState } from 'react';
// import { useTheme } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import { supabase } from '../utils/supabaseClient';

// type NavbarLink = {
//   name: string;
//   href: string;
// };

// interface MobileNavigationProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onOpenStackStore?: () => void;
//   onOpenSettings?: () => void;
//   onOpenAuth?: () => void;
// }

// const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose, onOpenStackStore, onOpenSettings, onOpenAuth }) => {
//   const { isDarkMode, toggleDarkMode } = useTheme();
//   const { user, loading, signOut } = useAuth();
//   const navRef = useRef<HTMLDivElement>(null);
//   const [logoLoaded, setLogoLoaded] = useState(false);
//   const [logoKey, setLogoKey] = useState(0);
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//   const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([
//     { name: 'Home', href: '#home' },
//     { name: 'Team', href: '#about' },
//     { name: 'Services', href: '#services' },
//     { name: 'Projects', href: '#projects' },
//     { name: 'Courses', href: '#courses' },
//     { name: 'Contact', href: '#contact' }
//   ]);

//   // Force logo reload when theme changes
//   useEffect(() => {
//     setLogoKey(prev => prev + 1);
//     setLogoLoaded(false);
//   }, [isDarkMode]);

//   // Handle clicks outside the navigation
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (navRef.current && !navRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, onClose]);

//   // Add touch event listeners for swipe detection
//   useEffect(() => {
//     const element = navRef.current;
//     if (!element) return;

//     let touchStartX = 0;
//     let touchEndX = 0;

//     const handleTouchStart = (e: TouchEvent) => {
//       touchStartX = e.changedTouches[0].screenX;
//     };

//     const handleTouchEnd = (e: TouchEvent) => {
//       touchEndX = e.changedTouches[0].screenX;
//       handleSwipeGesture();
//     };

//     const handleSwipeGesture = () => {
//       const swipeThreshold = 50;
//       const diff = touchStartX - touchEndX;

//       // Detect left swipe (closing the menu)
//       if (diff > swipeThreshold) {
//         onClose();
//       }
//     };

//     element.addEventListener('touchstart', handleTouchStart);
//     element.addEventListener('touchend', handleTouchEnd);

//     return () => {
//       element.removeEventListener('touchstart', handleTouchStart);
//       element.removeEventListener('touchend', handleTouchEnd);
//     };
//   }, [onClose]);

//   // Handle keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleKeyDown);
//     }

//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isOpen, onClose]);

//   // Load navbar links from database (same as Navbar)
//   useEffect(() => {
//     const loadNavbarLinks = async () => {
//       try {
//         const { data } = await supabase
//           .from('site_settings')
//           .select('value')
//           .eq('key', 'navbar_links')
//           .single();
        
//         if (data?.value) {
//           try {
//             const parsed = JSON.parse(data.value);
//             if (Array.isArray(parsed) && parsed.length > 0) {
//               setNavbarLinks(parsed);
//             }
//           } catch {}
//         }
//       } catch {}
//     };

//     loadNavbarLinks();

//     // Real-time subscription
//     const channel = supabase
//       .channel('navbar_links_mobile')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=eq.navbar_links' }, () => {
//         loadNavbarLinks();
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   // Handle navigation item click
//   const handleNavItemClick = (href: string) => {
//     onClose();
//     // For internal section links, scroll to the section
//     // Add a delay to ensure the menu is closed and components are loaded
//     setTimeout(() => {
//       const element = document.querySelector(href);
//       if (element) {
//         // Try multiple scroll methods for better compatibility
//         try {
//           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         } catch (e) {
//           // Fallback to manual scrolling
//           const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
//           window.scrollTo({
//             top: offsetTop - 80, // Adjust for navbar height
//             behavior: 'smooth'
//           });
//         }
//       } else {
//         if (import.meta.env.DEV) {
//           console.warn(`Element with id '${href}' not found`);
//         }
//         // If element not found, try navigating to home page with hash
//         if (href.startsWith('#')) {
//           window.location.hash = href.substring(1);
//         }
//       }
//     }, 300); // Increased delay to ensure components are loaded
//   };

//   // Handle keyboard navigation for menu items
//   const handleKeyDown = (e: React.KeyboardEvent, href: string) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       handleNavItemClick(href);
//     } else if (e.key === 'Escape') {
//       onClose();
//     }
//   };

//   return (
//     <>
//       {/* Overlay */}
//       <div 
//         className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
//           isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
//         }`}
//         onClick={onClose}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Mobile Navigation"
//       />

//       {/* Mobile Navigation Panel */}
//       <div
//         ref={navRef}
//         className={`mobile-nav-panel fixed top-0 left-0 h-full w-4/5 max-w-sm z-[10000] transform transition-transform duration-300 ease-in-out ${
//           isDarkMode ? 'bg-gray-900' : 'bg-white'
//         } shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Mobile Navigation"
//       >
//         <div className="flex flex-col h-full">
//           {/* Header */}
//           <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-transparent' : 'bg-black'} transition-all duration-300`} style={{ minWidth: '40px', minHeight: '40px', padding: isDarkMode ? '0' : '4px' }}>
//                   <img
//                     src={`/Team4stack_Logo.png?v=8&t=${logoKey}`}
//                     alt="Team4Stack Logo"
//                     className={`rounded-lg shadow-sm object-contain transition-all duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
//                     style={{ width: '32px', height: '32px', display: 'block' }}
//                     loading="eager"
//                     onLoad={() => setLogoLoaded(true)}
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       if (!target.src.includes('fallback')) {
//                         target.src = `/Team4stack_Logo.png?v=8&fallback=1&t=${logoKey}`;
//                       }
//                       setLogoLoaded(true);
//                     }}
//                     key={`logo-${isDarkMode ? 'dark' : 'light'}-${logoKey}`}
//                   />
//                 </div>
//                 <span className={`text-xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//                   Team4Stack
//                 </span>
//               </div>
//               <button
//                 onClick={onClose}
//                 className={`mobile-nav-close-button p-2 rounded-lg transition-colors flex items-center justify-center ${
//                   isDarkMode 
//                     ? 'bg-white/10 hover:bg-white/20' 
//                     : 'bg-gray-100 hover:bg-gray-200'
//                 } focus:outline-none focus:ring-2 focus:ring-purple-500`}
//                 aria-label="Close menu"
//               >
//                 <svg 
//                   className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} 
//                   fill="none" 
//                   stroke="currentColor" 
//                   viewBox="0 0 24 24"
//                   aria-hidden="true"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Navigation Items */}
//           <div className="flex-1 overflow-y-auto py-4">
//             <div className="flex flex-col space-y-2 px-4">
//               {/* StackStore (Coming soon) */}
//               <button
//                 onClick={() => {
//                   onClose();
//                   setTimeout(() => onOpenStackStore && onOpenStackStore(), 200);
//                 }}
//                 className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
//                   isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
//                 } focus:outline-none focus:ring-2 focus:ring-purple-500`}
//                 aria-label="Open StackStore (Coming soon)"
//                 role="menuitem"
//               >
//                 <span className="flex items-center justify-between">
//                   <span className="font-medium">StackStore</span>
//                   <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'opacity-70' : 'opacity-60 text-gray-600'}`}>Coming soon</span>
//                 </span>
//               </button>
//               {/* Navigation items from database */}
//               {navbarLinks.map((link) => {
//                 // Skip Home if it's a hash link, handle it specially
//                 if (link.href === '#home' || link.href === '/') {
//                   return (
//                     <button
//                       key={link.href}
//                       onClick={() => {
//                         onClose();
//                         setTimeout(() => {
//                           if (link.href === '#home') {
//                             window.scrollTo({ top: 0, behavior: 'smooth' });
//                           } else {
//                             window.location.href = link.href;
//                           }
//                         }, 200);
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.key === 'Enter' || e.key === ' ') {
//                           e.preventDefault();
//                           onClose();
//                           setTimeout(() => {
//                             if (link.href === '#home') {
//                               window.scrollTo({ top: 0, behavior: 'smooth' });
//                             } else {
//                               window.location.href = link.href;
//                             }
//                           }, 200);
//                         }
//                       }}
//                       className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
//                         isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
//                       } focus:outline-none focus:ring-2 focus:ring-purple-500`}
//                       aria-label={`Go to ${link.name} section`}
//                       role="menuitem"
//                     >
//                       <span className="font-medium">{link.name}</span>
//                     </button>
//                   );
//                 }
//                 return (
//                   <button
//                     key={link.href}
//                     onClick={() => handleNavItemClick(link.href)}
//                     onKeyDown={(e) => handleKeyDown(e, link.href)}
//                     className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
//                       isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
//                     } focus:outline-none focus:ring-2 focus:ring-purple-500`}
//                     aria-label={`Go to ${link.name} section`}
//                     role="menuitem"
//                   >
//                     <span className="font-medium">{link.name}</span>
//                   </button>
//                 );
//               })}
              
//               {/* Blog link removed */}
//             </div>
//           </div>

//           {/* User Section - Show only if logged in */}
//           {!loading && user && (
//             <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//               <div className="space-y-2">
//                 {/* User Profile Display */}
//                 <button
//                   onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//                   className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
//                     {user.avatar_url ? (
//                       <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
//                     ) : (
//                       <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="flex-1 flex flex-col items-start justify-center min-w-0 text-left">
//                     <span className="text-sm font-medium text-white leading-tight truncate w-full text-left">{user.name || 'User'}</span>
//                     {user.username && (
//                       <span className="text-xs text-white/70 leading-tight truncate w-full text-left">@{user.username}</span>
//                     )}
//                   </div>
//                   <svg 
//                     className={`w-5 h-5 text-white/70 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
//                     fill="none" 
//                     stroke="currentColor" 
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {/* User Menu Dropdown */}
//                 {isUserMenuOpen && (
//                   <div className="mt-2 space-y-1">
//                     {onOpenSettings && (
//                       <button
//                         onClick={() => {
//                           setIsUserMenuOpen(false);
//                           onClose();
//                           setTimeout(() => onOpenSettings && onOpenSettings(), 200);
//                         }}
//                         className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                         Settings
//                       </button>
//                     )}
//                     {user.role === 'admin' && (
//                       <a
//                         href="/adminsami"
//                         onClick={() => {
//                           setIsUserMenuOpen(false);
//                           onClose();
//                         }}
//                         className="block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                         </svg>
//                         Admin Panel
//                       </a>
//                     )}
//                     <button
//                       onClick={() => {
//                         setIsUserMenuOpen(false);
//                         onClose();
//                         signOut();
//                       }}
//                       className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                       </svg>
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Footer with Dark Mode Toggle */}
//           <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
//                 {isDarkMode ? 'Dark Mode' : 'Light Mode'}
//               </span>
//               <button
//                 onClick={toggleDarkMode}
//                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
//                   isDarkMode 
//                     ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white' 
//                     : 'bg-gray-100/80 hover:bg-gray-200/80 border border-gray-300 text-gray-700'
//                 } backdrop-blur-sm`}
//                 aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
//                 role="switch"
//                 aria-checked={isDarkMode}
//               >
//                 {isDarkMode ? (
//                   // Moon icon for dark mode
//                   <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                   </svg>
//                 ) : (
//                   // Sun icon for light mode
//                   <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MobileNavigation;