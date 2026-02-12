'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, MotionStyle } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPanel = pathname?.startsWith('/admin') || false;

  const isActive = (path: string) => pathname === path;

  // Disable animations for admin panel
  const headerAnimationProps = isAdminPanel ? {
    initial: false,
    animate: false,
    transition: { duration: 0 }
  } : {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  };

  const headerStyle: MotionStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    backdropFilter: 'blur(15px)',
    background: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
  };

  return (
    <motion.header 
      className="bg-white"
      {...headerAnimationProps}
      style={headerStyle}
      dir="ltr"
    >
      {/* Centered Container */}
      <div 
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <div 
          className="flex items-center"
          style={{ 
            height: '90px',
            justifyContent: isAdminPanel ? 'center' : 'space-between'
          }}
        >
          {/* Logo - Centered in Admin, Left in Regular */}
          {isAdminPanel ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Link 
                href="/" 
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    lineHeight: '1.2'
                  }}
                >
                  {/* Main Logo Text - Al-Qadir */}
                  <span
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #4CAF50 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-poppins), Arial, sans-serif'
                    }}
                  >
                    Al-Qadir
                  </span>
                  {/* Subtitle - Shopping Mall */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '2px',
                      marginTop: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-poppins), Arial, sans-serif'
                    }}
                  >
                    Shopping Mall
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              style={{
                width: 'auto',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Link 
                href="/" 
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    lineHeight: '1.2'
                  }}
                >
                  {/* Main Logo Text - Al-Qadir */}
                  <span
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-poppins), Arial, sans-serif'
                    }}
                  >
                    Al-Qadir
                  </span>
                  {/* Subtitle - Shopping Mall */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#666',
                      letterSpacing: '2px',
                      marginTop: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-poppins), Arial, sans-serif'
                    }}
                  >
                    Shopping Mall
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Navigation Buttons - Hidden in Admin Panel */}
          {!isAdminPanel && (
            <motion.nav 
              className="hidden md:flex items-center gap-3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              <Link href="/">
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{ 
                    scale: 1.08,
                    y: -2,
                    background: isActive('/')
                      ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                      : 'rgba(255, 107, 53, 0.15)',
                    boxShadow: isActive('/')
                      ? '0px 10px 30px rgba(255, 107, 53, 0.5), 0px 5px 15px rgba(247, 147, 30, 0.4)'
                      : '0px 6px 18px rgba(255, 107, 53, 0.25)'
                  }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    padding: '10px 24px',
                    fontSize: '15px',
                    fontWeight: isActive('/') ? '600' : '500',
                    color: isActive('/') ? '#ffffff' : '#4a5568',
                    background: isActive('/')
                      ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                      : 'transparent',
                    border: isActive('/') 
                      ? 'none' 
                      : '2px solid rgba(255, 107, 53, 0.4)',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive('/')
                      ? '0px 8px 25px rgba(255, 107, 53, 0.45), 0px 4px 12px rgba(247, 147, 30, 0.35)'
                      : 'none'
                  }}
                >
                  Home
                </motion.button>
              </Link>

              <Link href="/shop">
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ 
                    scale: 1.08,
                    y: -2,
                    background: isActive('/shop')
                      ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                      : 'rgba(255, 107, 53, 0.15)',
                    boxShadow: isActive('/shop')
                      ? '0px 10px 30px rgba(255, 107, 53, 0.5), 0px 5px 15px rgba(247, 147, 30, 0.4)'
                      : '0px 6px 18px rgba(255, 107, 53, 0.25)'
                  }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    padding: '10px 24px',
                    fontSize: '15px',
                    fontWeight: isActive('/shop') ? '600' : '500',
                    color: isActive('/shop') ? '#ffffff' : '#4a5568',
                    background: isActive('/shop')
                      ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                      : 'transparent',
                    border: isActive('/shop') 
                      ? 'none' 
                      : '2px solid rgba(255, 107, 53, 0.4)',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive('/shop')
                      ? '0px 8px 25px rgba(255, 107, 53, 0.45), 0px 4px 12px rgba(247, 147, 30, 0.35)'
                      : 'none'
                  }}
                >
                  Shop
                </motion.button>
              </Link>
            </motion.nav>
          )}

          {/* Mobile Menu Toggle - Hidden in Admin Panel */}
          {!isAdminPanel && (
            <button 
              type="button"
              className="md:hidden flex flex-col p-2"
              style={{ gap: '4px', zIndex: 10 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`bg-gray-600 block ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
              <span className={`bg-gray-600 block ${mobileMenuOpen ? 'opacity-0' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
              <span className={`bg-gray-600 block ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
            </button>
          )}
        </div>

        {/* Mobile Menu - Hidden in Admin Panel */}
        {!isAdminPanel && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pb-4"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '15px',
                  fontWeight: isActive('/') ? '600' : '500',
                  color: isActive('/') ? '#ffffff' : '#4a5568',
                  background: isActive('/')
                    ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                    : 'rgba(255, 107, 53, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive('/')
                    ? '0px 6px 20px rgba(255, 107, 53, 0.4), 0px 3px 10px rgba(247, 147, 30, 0.3)'
                    : 'none'
                }}
              >
                Home
              </motion.button>
            </Link>

            <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '15px',
                  fontWeight: isActive('/shop') ? '600' : '500',
                  color: isActive('/shop') ? '#ffffff' : '#4a5568',
                  background: isActive('/shop')
                    ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)'
                    : 'rgba(255, 107, 53, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive('/shop')
                    ? '0px 6px 20px rgba(255, 107, 53, 0.4), 0px 3px 10px rgba(247, 147, 30, 0.3)'
                    : 'none'
                }}
              >
                Shop
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
