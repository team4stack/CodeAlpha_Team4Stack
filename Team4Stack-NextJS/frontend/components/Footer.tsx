import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CONTACT_EMAIL, getMailToUrl } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Force logo reload when theme changes
  useEffect(() => {
    setLogoKey(prev => prev + 1);
    setLogoLoaded(false);
  }, [isDarkMode]);
  
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [supportForm, setSupportForm] = useState({
    reason: '',
    email: '',
    subject: '',
    message: ''
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showSupportModal) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable body scroll without animation
        const savedScrollY = scrollY;
        // Temporarily disable smooth scroll on html element
        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        
        // Also disable smooth scroll on body
        const originalBodyScrollBehavior = document.body.style.scrollBehavior;
        document.body.style.scrollBehavior = 'auto';
        
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restore scroll position instantly without animation - use direct assignment
        // Force immediate scroll without any animation
        window.scrollTo({
          top: savedScrollY,
          left: 0,
          behavior: 'auto'
        });
        
        // Also set scrollTop directly as fallback
        try {
          if (document.documentElement && 'scrollTop' in document.documentElement) {
            (document.documentElement as any).scrollTop = savedScrollY;
          }
          if (document.body && 'scrollTop' in document.body) {
            (document.body as any).scrollTop = savedScrollY;
          }
        } catch (e) {
          // Ignore if scrollTop is not writable
        }
        
        // Restore smooth scroll behavior after a brief moment
        setTimeout(() => {
          html.style.scrollBehavior = originalScrollBehavior;
          document.body.style.scrollBehavior = originalBodyScrollBehavior;
        }, 50);
      };
    }
  }, [showSupportModal]);

  const [footerSettings, setFooterSettings] = useState<{
    aboutText: string;
    socials: Array<{ name: string; href: string }>;
    version: string;
    supportEmail: string;
  }>({
    aboutText: 'We are a passionate team of MERN stack developers dedicated to creating exceptional web applications that transform ideas into reality.',
    socials: [],
    version: '1.1.1',
    supportEmail: 'team4stack@gmail.com'
  });

  const supportReasons = [
    { value: '', label: 'Select a reason' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'other', label: 'Other' }
  ];

  const getSubjectFromReason = (reason: string): string => {
    const subjects: Record<string, string> = {
      'technical': 'Technical Support Request',
      'billing': 'Billing Inquiry',
      'general': 'General Inquiry',
      'feature': 'Feature Request',
      'bug': 'Bug Report',
      'partnership': 'Partnership Inquiry',
      'other': 'Support Request'
    };
    return subjects[reason] || 'Support Request';
  };

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !supportForm.email) {
      setSupportForm(prev => ({ ...prev, email: user.email || '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-fill subject when reason changes
  useEffect(() => {
    if (supportForm.reason) {
      setSupportForm(prev => ({ ...prev, subject: getSubjectFromReason(prev.reason) }));
    }
  }, [supportForm.reason]);

  useEffect(() => {
    const loadFooterSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['footer_about_text', 'footer_socials_json', 'footer_version', 'footer_support_email']);

        const settings: any = {};
        data?.forEach((row) => {
          settings[row.key] = row.value;
        });

        let socials: Array<{ name: string; href: string }> = [];
        if (settings.footer_socials_json) {
          try {
            socials = JSON.parse(settings.footer_socials_json);
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error('Error parsing footer socials JSON:', e);
            }
          }
        }

        setFooterSettings({
          aboutText: settings.footer_about_text || footerSettings.aboutText,
          socials: Array.isArray(socials) ? socials : [],
          version: settings.footer_version || '1.1.1',
          supportEmail: settings.footer_support_email || 'team4stack@gmail.com'
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading footer settings:', error);
        }
      }
    };

    loadFooterSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('footer_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: 'key=in.(footer_about_text,footer_socials_json,footer_version,footer_support_email)' }, () => {
        loadFooterSettings();
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

  return (
    <footer className="relative bg-black text-gray-300 w-full footer-crazy">
      {/* Gradient Border */}
      <div className="absolute top-0 left-0 right-0 footer-neon-line"></div>
      
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-transparent' : 'bg-black'} transition-all duration-300`} style={{ minWidth: '40px', minHeight: '40px', padding: isDarkMode ? '0' : '4px' }}>
                <img 
                  src={`/Team4stack_Logo.png?v=8&t=${logoKey}`}
                  alt="Team4Stack Logo" 
                  className={`rounded-lg shadow-sm object-contain transition-all duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
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
              <span className="text-xl font-bold text-white">Team4Stack</span>
            </div>
            
            {/* Description */}
            <p className="footer-about-text text-gray-400 mb-8 max-w-2xl mx-auto">
              {footerSettings.aboutText}
            </p>
          </div>
          
          {/* Social Links */}
          {footerSettings.socials && footerSettings.socials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6 w-full whitespace-normal">
              {footerSettings.socials.map((social, idx) => {
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
                    className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20"
                  >
                    {slug ? (
                      <img src={iconUrl} alt={social.name} className="w-5 h-5" loading="lazy" />
                    ) : (
                      <span className="text-xs text-white/80">{social.name?.charAt(0)}</span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
          {/* Support Button */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setShowSupportModal(true)}
              className="footer-support-btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
              style={{ color: '#ffffff' }}
              title="Contact Support"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: '#ffffff' }}>Support</span>
            </button>
            <button className="reviews-dot back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">↑</button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-4 border-t border-gray-700">
          <div className="text-center">
            <p className="footer-copyright text-gray-400 text-sm mb-2">
              © Team4Stack {currentYear}. All rights reserved.
            </p>
            {footerSettings.version && (
              <p className="footer-version text-gray-600 text-xs">
                Version {footerSettings.version}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-20 md:pt-24" 
          onClick={() => setShowSupportModal(false)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 md:p-8 max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col" 
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h3 className="text-2xl font-bold text-white">Contact Support</h3>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportForm({ reason: '', email: user?.email || '', subject: '', message: '' });
                  setSubmitMessage(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div 
              className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar" 
              style={{ maxHeight: 'calc(90vh - 120px)' }}
              onWheel={(e) => {
                e.stopPropagation();
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                  e.preventDefault();
                }
              }}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <form onSubmit={async (e) => {
              e.preventDefault();
              if (!supportForm.reason || !supportForm.email || !supportForm.message) {
                setSubmitMessage({ type: 'error', text: 'Please fill in all required fields' });
                return;
              }

              setIsSubmitting(true);
              setSubmitMessage(null);

              try {
                // Store support request in Supabase
                const { error } = await supabase
                  .from('support_requests')
                  .insert({
                    reason: supportReasons.find(r => r.value === supportForm.reason)?.label || supportForm.reason,
                    email: supportForm.email,
                    subject: supportForm.subject || getSubjectFromReason(supportForm.reason),
                    message: supportForm.message,
                    user_id: user?.id || null,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  });

                if (error) {
                  // If table doesn't exist, fallback to mailto
                  if (error.code === '42P01') {
                    const emailBody = `Reason: ${supportReasons.find(r => r.value === supportForm.reason)?.label || supportForm.reason}\n\nFrom: ${supportForm.email}\n\n${supportForm.message}`;
                    window.location.href = getMailToUrl(footerSettings.supportEmail, supportForm.subject || getSubjectFromReason(supportForm.reason), emailBody);
                    setShowSupportModal(false);
                    return;
                  }
                  throw error;
                }

                setSubmitMessage({ type: 'success', text: 'Support request submitted successfully! We will contact you soon.' });
                
                // Reset form
                setTimeout(() => {
                  setSupportForm({ reason: '', email: user?.email || '', subject: '', message: '' });
                  setShowSupportModal(false);
                  setSubmitMessage(null);
                }, 2000);
              } catch (error: any) {
                // Fallback to mailto if database insert fails
                const emailBody = `Reason: ${supportReasons.find(r => r.value === supportForm.reason)?.label || supportForm.reason}\n\nFrom: ${supportForm.email}\n\n${supportForm.message}`;
                window.location.href = getMailToUrl(footerSettings.supportEmail, supportForm.subject || getSubjectFromReason(supportForm.reason), emailBody);
                setShowSupportModal(false);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason <span className="text-red-400">*</span>
                </label>
                <select
                  value={supportForm.reason}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {supportReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Support Request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={supportForm.message}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe your issue or inquiry..."
                  required
                />
              </div>

              {submitMessage && (
                <div className={`p-3 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {submitMessage.text}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;