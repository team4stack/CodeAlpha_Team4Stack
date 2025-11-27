import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';
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
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Cookies Policy', url: '/cookies' },
    { name: 'Contact Support', url: '/contact' },
    { name: 'Developers', url: 'https://www.team4stack.com', external: true },
    { name: 'Help Center', url: '/help' },
    { name: 'Terms & Conditions', url: '/terms' }
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [aboutText, setAboutText] = useState<string>('We are a passionate team of MERN stack developers dedicated to creating exceptional web applications that transform ideas into reality.');

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        // Load footer links
        const { data: linksData } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('key', 'footer_links_json')
          .maybeSingle();

        if (linksData?.value) {
          try {
            const parsedLinks = JSON.parse(linksData.value);
            if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
              setFooterLinks(parsedLinks);
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error('Error parsing footer links JSON:', e);
            }
          }
        }

        // Load social links
        const { data: socialData } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['footer_socials_json', 'footer_about_text'])
          .maybeSingle();

        if (socialData) {
          socialData.forEach((row: any) => {
            if (row.key === 'footer_socials_json' && row.value) {
              try {
                const parsed = JSON.parse(row.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setSocialLinks(parsed);
                }
              } catch (e) {
                if (import.meta.env.DEV) {
                  console.error('Error parsing footer socials JSON:', e);
                }
              }
            } else if (row.key === 'footer_about_text' && row.value) {
              setAboutText(row.value);
            }
          });
        }

        // Load from multiple rows
        const { data: allData } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['footer_socials_json', 'footer_about_text']);

        if (allData) {
          allData.forEach((row: any) => {
            if (row.key === 'footer_socials_json' && row.value) {
              try {
                const parsed = JSON.parse(row.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setSocialLinks(parsed);
                }
              } catch (e) {
                if (import.meta.env.DEV) {
                  console.error('Error parsing footer socials JSON:', e);
                }
              }
            } else if (row.key === 'footer_about_text' && row.value) {
              setAboutText(row.value);
            }
          });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading footer data:', error);
        }
      }
    };

    loadFooterData();

    const channel = supabase
      .channel('footer_data')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'site_settings', 
        filter: 'key=in.(footer_links_json,footer_socials_json,footer_about_text)' 
      }, () => {
        loadFooterData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  return (
    <footer className="footer dark">
      <div className="footer-top-border"></div>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info Section */}
          <div className="footer-section footer-about">
            <div className="footer-logo-section">
              <div className="footer-logo-wrapper">
                <img 
                  src="/Team4Stack_Transparant.svg" 
                  alt="Team4Stack Logo" 
                  className="footer-logo-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <h2 className="footer-logo-text">Team4Stack</h2>
              </div>
              <p className="footer-description">{aboutText}</p>
            </div>
          </div>

          {/* Quick Links Section */}
          {quickLinks.length > 0 && (
            <div className="footer-section">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-links-list">
                {quickLinks.map((link, index) => (
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
                      <Link to={link.url} className="footer-link">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Links Section */}
          {legalLinks.length > 0 && (
            <div className="footer-section">
              <h3 className="footer-section-title">Legal</h3>
              <ul className="footer-links-list">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.url} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
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
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Team4Stack. All rights reserved.
            </p>
            <p className="footer-owners">
              Website Owners: M.Sami khan, Aftab Akram, M.Hasnain, Faiz Ahmad
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
