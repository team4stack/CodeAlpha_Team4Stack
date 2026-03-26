'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './Footer.css';

interface FooterLink {
  name: string;
  url: string;
  external?: boolean;
}

interface SocialLink {
  name: string;
  href: string;
}

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const footerBottomRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const dotPositionsRef = useRef<Array<{ x: number; y: number }>>([]);
  const isFooterHoveredRef = useRef(false);
  const idleTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentPosRef = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Cookies Policy', url: '/cookies' },
    { name: 'Contact Support', url: '/contact' },
    { name: 'Developers', url: '/' },
    { name: 'Help Center', url: '/help' },
    { name: 'Terms & Conditions', url: '/terms' }
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [aboutText, setAboutText] = useState<string>('We are a passionate team of MERN stack developers dedicated to creating exceptional web applications that transform ideas into reality.');

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        // Load footer links via API
        const { landingApi } = await import('@/lib/api')
        const linksResult = await landingApi.getSiteSettings(['footer_links_json'])
        const linksData = (Array.isArray(linksResult.data) ? linksResult.data : []).find((s: any) => s.key === 'footer_links_json')

        if (linksData?.value) {
          try {
            const parsedLinks = JSON.parse(linksData.value);
            if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
              setFooterLinks(parsedLinks);
            }
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error parsing footer links JSON:', e);
            }
          }
        }

        // Load social links via API
        const socialResult = await landingApi.getSiteSettings(['footer_socials_json', 'footer_about_text'])
        const socialData = Array.isArray(socialResult.data) ? socialResult.data : []

        if (socialData && Array.isArray(socialData)) {
          socialData.forEach((row: any) => {
            if (row.key === 'footer_socials_json' && row.value) {
              try {
                const parsed = JSON.parse(row.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setSocialLinks(parsed);
                }
              } catch (e) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Error parsing footer socials JSON:', e);
                }
              }
            } else if (row.key === 'footer_about_text' && row.value) {
              setAboutText(row.value);
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading footer data:', error);
        }
      }
    };

    loadFooterData();
    // Note: Realtime subscriptions removed - data is fetched on mount only
  }, []);

  const slugMap: Record<string, string> = {
    'Facebook': 'facebook',
    'Instagram': 'instagram',
    'Twitter/X': 'x',
    'LinkedIn': 'linkedin',
    'YouTube': 'youtube',
    'GitHub': 'github',
    'WhatsApp': 'whatsapp',
    'Telegram': 'telegram',
    'TikTok': 'tiktok',
    'Snapchat': 'snapchat',
    'Pinterest': 'pinterest',
    'Reddit': 'reddit',
    'Medium': 'medium',
    'Discord': 'discord',
    'Fiverr': 'fiverr',
    'Upwork': 'upwork',
    'Freelancer': 'freelancer',
    'PeoplePerHour': 'peopleperhour',
    'Guru': 'guru',
    'Toptal': 'toptal',
    'FlexJobs': 'flexjobs',
    '99designs': '99designs',
    'Upstack': 'upstack',
    'SimplyHired': 'simplyhired',
    'Gmail': 'gmail',
    'Email': 'gmail'
  };

  // Split links into Quick Links and Legal Links
  const quickLinks = footerLinks.filter(link => 
    ['Contact Support', 'Help Center', 'Developers'].includes(link.name)
  );
  const legalLinks = footerLinks.filter(link => 
    ['Privacy Policy', 'Cookies Policy', 'Terms & Conditions'].includes(link.name)
  );

  const animateCursorDots = (timestamp: number) => {
    const footer = footerRef.current;
    if (!footer) {
      rafRef.current = null;
      return;
    }

    const footerRect = footer.getBoundingClientRect();
    const footerBottomRect = footerBottomRef.current?.getBoundingClientRect();
    const delta = lastFrameTimeRef.current === null ? 16 : Math.min(50, timestamp - lastFrameTimeRef.current);
    lastFrameTimeRef.current = timestamp;

    if (!isFooterHoveredRef.current) {
      idleTimeRef.current += delta * 0.001;
      const lineY = footerBottomRect
        ? Math.max(24, footerBottomRect.top - footerRect.top - 6)
        : Math.max(24, footerRect.height - 72);
      const xRange = Math.max(70, footerRect.width * 0.34);
      const idleX = footerRect.width / 2 + Math.sin(idleTimeRef.current * 0.75) * xRange;
      const idleY = lineY + Math.sin(idleTimeRef.current * 3.1) * 2;
      targetPosRef.current = {
        x: Math.min(footerRect.width - 24, Math.max(24, idleX)),
        y: idleY
      };
    }

    const easing = isFooterHoveredRef.current ? 0.24 : 0.08;
    currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * easing;
    currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * easing;

    let leadX = currentPosRef.current.x;
    let leadY = currentPosRef.current.y;

    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;
      const lag = Math.max(0.08, 0.24 - index * 0.018);
      const pos = dotPositionsRef.current[index] ?? { x: leadX, y: leadY };

      pos.x += (leadX - pos.x) * lag;
      pos.y += (leadY - pos.y) * lag;
      dotPositionsRef.current[index] = pos;

      leadX = pos.x;
      leadY = pos.y;

      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${Math.max(0.35, 1 - index * 0.08)})`;
      dot.style.opacity = `${Math.max(0.08, 0.9 - index * 0.1)}`;
    });

    rafRef.current = requestAnimationFrame(animateCursorDots);
  };

  const handleFooterMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const footer = footerRef.current;
    if (!footer) return;
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    targetPosRef.current = { x, y };
  };

  const handleFooterMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const footer = footerRef.current;
    if (!footer) return;
    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isFooterHoveredRef.current = true;
    currentPosRef.current = { x, y };
    targetPosRef.current = { x, y };
    dotPositionsRef.current = dotRefs.current.map(() => ({ x, y }));
    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${Math.max(0.35, 1 - index * 0.08)})`;
      dot.style.opacity = `${Math.max(0.08, 0.9 - index * 0.1)}`;
    });
  };

  const handleFooterMouseLeave = () => {
    isFooterHoveredRef.current = false;
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animateCursorDots);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="footer dark"
      onMouseMove={handleFooterMouseMove}
      onMouseEnter={handleFooterMouseEnter}
      onMouseLeave={handleFooterMouseLeave}
    >
      <div className="footer-cursor-dots" aria-hidden>
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`footer-dot-${index}`}
            ref={(el) => { dotRefs.current[index] = el; }}
            className="footer-cursor-dot"
          />
        ))}
      </div>
      <div className="footer-top-border"></div>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info Section */}
          <div className="footer-section footer-about">
            <div className="footer-logo-section">
              <Link href="/" className="footer-logo-wrapper group inline-flex items-center gap-2 sm:gap-3 w-fit focus:outline-none rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/Team4Stack_Transparant.svg"
                    alt="Team4Stack Logo"
                    className="w-full h-full object-contain rounded-lg shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      if (!t.src.includes('fallback')) t.src = '/Team4Stack_Transparant.svg?fallback=1';
                    }}
                  />
                </div>
                <h2 className="footer-logo-text !m-0">Team4Stack</h2>
              </Link>
              <p className="footer-description">{aboutText}</p>
            </div>
          </div>

          {/* Quick Links Section */}
          {quickLinks.length > 0 && (
            <div className="footer-section">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-links-list">
                {quickLinks.map((link, index) => {
                  if (!link.url) return null;
                  return (
                    <li key={index}>
                      {link.external ? (
                        <a 
                          href={link.url} 
                          className="footer-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.url} className="footer-link">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Legal Links Section */}
          {legalLinks.length > 0 && (
            <div className="footer-section">
              <h3 className="footer-section-title">Legal</h3>
              <ul className="footer-links-list">
                {legalLinks.map((link, index) => {
                  if (!link.url) return null;
                  return (
                    <li key={index}>
                      <Link href={link.url} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Social Media Section */}
          {socialLinks.length > 0 && (
            <div className="footer-section">
              <h3 className="footer-section-title">Follow Us</h3>
              <div className="footer-social-icons">
                {socialLinks.map((social, idx) => {
                  const slug = slugMap[social.name as keyof typeof slugMap];
                  const iconUrl = slug ? `https://cdn.simpleicons.org/${slug}` : '';
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      title={social.name}
                      className="footer-social-icon"
                    >
                      {slug ? (
                        <img src={iconUrl} alt={social.name} className="footer-social-icon-img" loading="lazy" />
                      ) : (
                        <span className="footer-social-icon-fallback">{social.name?.charAt(0)}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div ref={footerBottomRef} className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Team4Stack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
