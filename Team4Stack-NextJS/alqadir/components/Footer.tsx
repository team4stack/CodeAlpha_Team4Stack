'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [contactInfo, setContactInfo] = useState({
    whatsapp: '923001234567',
    phone: '+92 300 1234567',
    email: 'info@alqadir.com',
    address: 'Vehari, Pakistan'
  });

  useEffect(() => {
    // Fetch contact settings asynchronously (non-blocking)
    const controller = new AbortController();
    
    fetch('/api/contact-settings', { 
      signal: controller.signal,
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setContactInfo(data.settings);
        }
      })
      .catch((err) => {
        // Keep default values on error (already set in state)
        if (err.name !== 'AbortError') {
          // Silently fail - defaults are already set
        }
      });

    return () => {
      controller.abort(); // Cleanup on unmount
    };
  }, []);

  return (
    <footer 
      className="site-footer"
      style={{ 
        background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
        color: '#fff',
        borderTop: '4px solid transparent',
        borderImage: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%) 1',
        marginTop: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Centered Container */}
      <div 
        style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '80px 30px 40px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '50px',
            marginBottom: '50px'
          }}
        >
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700',
                fontSize: '26px',
                marginBottom: '25px',
                fontFamily: 'var(--font-poppins), Arial, sans-serif'
              }}
            >
              Al-Qadir Shopping Mall
            </h3>
            <p style={{ 
              color: '#cbd5e0', 
              fontSize: '15px', 
              lineHeight: '1.8', 
              marginBottom: '30px' 
            }}>
              Your trusted destination for premium products with unbeatable deals and free delivery across Pakistan.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <motion.a 
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #25D366 0%, #20ba5a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  textDecoration: 'none',
                  boxShadow: '0px 6px 20px rgba(37, 211, 102, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Useful Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: '20px',
                marginBottom: '25px',
                fontFamily: 'var(--font-poppins), Arial, sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              Quick Links
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/shop', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/about', label: 'About Us' },
                { href: '/about#contact', label: 'Contact Us' }
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    style={{ 
                      color: '#cbd5e0', 
                      fontSize: '15px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      display: 'inline-block',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ff6b35';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#cbd5e0';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: '20px',
                marginBottom: '25px',
                fontFamily: 'var(--font-poppins), Arial, sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              Contact Info
            </h4>
            <div style={{ color: '#cbd5e0', fontSize: '15px', lineHeight: '2.2' }}>
              <motion.p 
                whileHover={{ x: 5 }}
                style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '18px' }}>📍</span>
                <span>{contactInfo.address}</span>
              </motion.p>
              <motion.p 
                whileHover={{ x: 5 }}
                style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '18px' }}>📞</span>
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                  style={{ 
                    color: '#ff6b35', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f7931e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ff6b35'}
                >
                  {contactInfo.phone}
                </a>
              </motion.p>
              <motion.p 
                whileHover={{ x: 5 }}
                style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '18px' }}>✉️</span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  style={{ 
                    color: '#ff6b35', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f7931e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ff6b35'}
                >
                  {contactInfo.email}
                </a>
              </motion.p>
            </div>
          </motion.div>

          {/* Payment & Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: '20px',
                marginBottom: '25px',
                fontFamily: 'var(--font-poppins), Arial, sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              Services
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Free Delivery',
                'Cash on Delivery',
                'Genuine Products',
                '24/7 Support'
              ].map((service, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    color: '#cbd5e0',
                    fontSize: '15px'
                  }}
                >
                  <span style={{ 
                    color: '#ff6b35',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>✓</span>
                  <span>{service}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            borderTop: '2px solid rgba(255, 107, 53, 0.2)',
            paddingTop: '35px',
            marginTop: '50px',
            textAlign: 'center'
          }}
        >
          <p style={{ 
            color: '#cbd5e0', 
            fontSize: '15px', 
            margin: 0,
            fontWeight: '500'
          }}>
            © {new Date().getFullYear()} Al-Qadir Shopping Mall. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
