'use client'

import React, { useEffect, useState } from 'react';
import { CONTACT_PHONE_NUMBERS, getWhatsAppUrl } from '@/lib/utils/constants';

// Social Icon Link Component with error handling
const SocialIconLink: React.FC<{ href: string; name?: string; iconUrl: string; slug?: string }> = ({ href, name, iconUrl, slug }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      title={name}
      className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20"
    >
      {slug && !imageError ? (
        <img 
          src={iconUrl} 
          alt={name || 'Social icon'} 
          className="w-5 h-5" 
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs text-white/80">{name?.charAt(0) || '?'}</span>
      )}
    </a>
  );
};

// Helper function to validate and convert Google Maps URL to embed format
const getEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // If it's already an embed URL, return as is
    if (url.includes('/embed') || url.includes('output=embed')) {
      return url;
    }
    
    // Handle Google Maps short URLs (maps.app.goo.gl)
    // Short URLs need to be converted to embed format
    if (urlObj.hostname.includes('maps.app.goo.gl') || urlObj.hostname.includes('goo.gl')) {
      // For short URLs, try to convert to embed format
      // Extract the short code from path
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length > 0) {
        const shortCode = pathParts[pathParts.length - 1];
        // Convert short URL to embed format using Google Maps embed API
        // Format: https://www.google.com/maps/embed?pb=...
        // We'll use the short URL directly with iframe, Google Maps handles it
        // But better approach: convert to full URL first
        // For now, return the short URL - it might work in iframe
        // Short URLs cannot be directly embedded - need embed URL
        return null;
      }
    }
    
    // If it's a regular Google Maps URL, try to convert it
    if (urlObj.hostname.includes('google.com') && urlObj.pathname.includes('/maps')) {
      // Handle /maps/place/ URLs - extract place name and coordinates
      if (urlObj.pathname.includes('/place/')) {
        // Extract place name from URL (e.g., /maps/place/We+Connect+Vehari/@30.0364947,72.3614507)
        const placeMatch = urlObj.pathname.match(/\/place\/([^/@]+)/);
        const coordMatch = urlObj.pathname.match(/@([^/]+)/);
        
        if (placeMatch && coordMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          const coords = coordMatch[1]; // e.g., "30.0364947,72.3614507,17z"
          const coordParts = coords.split(',');
          const lat = coordParts[0]?.trim();
          const lng = coordParts[1]?.trim();
          
          if (lat && lng) {
            // Convert to embed format using coordinates
            // Use standard Google Maps embed format (no API key needed)
            return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=17&output=embed`;
          }
        }
        
        // Fallback: use place name only
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          // Use standard Google Maps embed format with place name
          return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&z=17&output=embed`;
        }
      }
      
      // Extract query parameters
      const params = new URLSearchParams(urlObj.search);
      
      // If it has a 'q' parameter, convert to embed format
      if (params.has('q')) {
        return `https://www.google.com/maps?q=${encodeURIComponent(params.get('q') || '')}&hl=en&z=17&output=embed`;
      }
      
      // Try to convert with output=embed parameter
      const paramsWithEmbed = new URLSearchParams(urlObj.search);
      paramsWithEmbed.set('output', 'embed');
      paramsWithEmbed.set('hl', 'en');
      return `${urlObj.origin}${urlObj.pathname}?${paramsWithEmbed.toString()}`;
    }
    
    // For other map services, return as is
    return url;
  } catch {
    // Invalid URL - try to add output=embed as fallback
    try {
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
        return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
      }
    } catch {
      // Silent fail
    }
    return null;
  }
};

const Contact: React.FC = () => {
  const [mapError, setMapError] = useState(false);

  // Admin-controlled contact settings (from site_settings)
  const [contactSettings, setContactSettings] = useState<{
    address?: string;
    website?: string;
    phone?: string;
    mapSrc?: string;
    primaryName?: string;
    primaryTagline?: string;
    whatsapp?: string;
    socials?: Array<{ name: string; href: string }>;
  }>({});

  // Reset map error when mapSrc changes (from admin panel)
  useEffect(() => {
    if (contactSettings.mapSrc) {
      setMapError(false);
    }
  }, [contactSettings.mapSrc]);

  // Load admin settings from site_settings (keys prefixed contact_*) via API
  useEffect(() => {
    const load = async () => {
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings([
          'contact_address',
          'contact_website',
          'contact_phone',
          'contact_map_src',
          'contact_primary_name',
          'contact_primary_tagline',
          'contact_whatsapp',
          'contact_socials_json'
        ])
        if (result.data) {
          const kv: Record<string, string> = Object.fromEntries((result.data as any[]).map(r => [r.key, r.value]));
          let socials: Array<{ name: string; href: string }> = [];
          try { socials = kv['contact_socials_json'] ? JSON.parse(kv['contact_socials_json']) : []; } catch {}
          setContactSettings({
            address: kv['contact_address'] || undefined,
            website: kv['contact_website'] || undefined,
            phone: kv['contact_phone'] || undefined,
            mapSrc: kv['contact_map_src'] || undefined,
            primaryName: kv['contact_primary_name'] || undefined,
            primaryTagline: kv['contact_primary_tagline'] || undefined,
            whatsapp: kv['contact_whatsapp'] || undefined,
            socials
          });
        } else {
          setContactSettings({});
        }
      } catch {
        setContactSettings({});
      }
    };
    load();
    // Note: Realtime subscriptions removed - data is fetched on mount only
  }, []);

  const openWhatsApp = () => {
    const phoneNumber = contactSettings.whatsapp || CONTACT_PHONE_NUMBERS.primary;
    const message = 'Hello Team4Stack! I would like to contact your team for support/inquiry.';
    const whatsappUrl = getWhatsAppUrl(phoneNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const teamMembers = [
    {
      name: 'M. Sami Ullah Khan',
      role: 'Full Stack Manager & Team Lead',
      specialization:
        'Full stack manager responsible for system architecture, code reviews, deployments, and client communication. Leads Team4Stack projects end-to-end and mentors the team.',
      github: 'https://github.com/Sami3234',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[0],
      isLeader: true
    },
    {
      name: 'Muhammad Hasnain',
      role: 'Full Stack Developer',
      specialization:
        'Frontend design management: UI/UX alignment, responsive layouts, component library, and structure planning for React + Tailwind. Also owns API integration plans and DB schema coordination for features.',
      github: 'https://github.com/hasnain17576',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[1],
      isLeader: false
    },
    {
      name: 'M. Aftab Akram',
      role: 'Full Stack Developer & Account Manager',
      specialization:
        'Operations focus: manages Team4Stack social media, prepares invoices and tracks payments (accountant manager), maintains project documentation, assists with deployments/monitoring, and coordinates internal handoffs between Dev and QA.',
      github: 'https://github.com/Aftab272/Aftab272',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[2],
      isLeader: false
    },
    {
      name: 'Fiaz Ahmad',
      role: 'Full Stack Developer & QA Lead',
      specialization:
        'Testing management and QA: project passing checks, quality assurance, bug triage, and release readiness. Ensures performance, accessibility and best practices.',
      github: 'https://github.com/fiaz32304',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[3],
      isLeader: false
    }
  ];

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-gray-900 to-black">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Touch</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to start your next MERN stack project? Contact our team leader or send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Location + Primary Contact Cards */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Physical Location Card (WE Connect) */}
          <div className="card text-white">
            <h3 className="text-2xl font-bold mb-4">WE Connect – Physical Location</h3>
            <p className="text-white/80 mb-4">Visit us for on-site MERN physical training and project discussions.</p>
            {(contactSettings.mapSrc || contactSettings.address || contactSettings.website || contactSettings.phone) ? (
              <>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  {contactSettings.mapSrc && !mapError ? (
                    (() => {
                      const embedUrl = getEmbedUrl(contactSettings.mapSrc);
                      const isShortUrl = contactSettings.mapSrc.includes('maps.app.goo.gl') || contactSettings.mapSrc.includes('goo.gl');
                      
                      if (!embedUrl) {
                        return (
                          <div className="w-full h-64 flex flex-col items-center justify-center text-white/70 gap-3 p-4">
                            {isShortUrl ? (
                              <>
                                <svg className="w-12 h-12 text-yellow-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-center font-semibold">Short Google Maps URL Detected</p>
                                <p className="text-sm text-center text-white/60 max-w-md">
                                  Short URLs (maps.app.goo.gl) cannot be embedded directly.
                                </p>
                                <p className="text-xs text-center text-white/50 max-w-md">
                                  To fix: Open map → Share → Embed a map → Copy iframe src URL → Use that in admin panel
                                </p>
                              </>
                            ) : (
                              <p>Invalid map URL format. Please use a valid Google Maps embed URL.</p>
                            )}
                          </div>
                        );
                      }
                      return (
                        <iframe
                          title="WE Connect Location"
                          src={embedUrl}
                          className="w-full h-64"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                          onError={() => {
                            setMapError(true);
                          }}
                        />
                      );
                    })()
                  ) : mapError ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-white/70 gap-2">
                      <p>Map could not be loaded</p>
                      <p className="text-xs text-white/50">Please check the map URL in admin panel</p>
                    </div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-white/70">No map available</div>
                  )}
                </div>
                <div className="mt-4 space-y-1 text-sm text-white/80">
                  <p><span className="font-semibold text-white">Address:</span> {contactSettings.address || 'No data available'}</p>
                  <p><span className="font-semibold text-white">Website:</span> {contactSettings.website ? (<a href={contactSettings.website} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{(contactSettings.website || '').replace(/^https?:\/\//,'')}</a>) : 'No data available'}</p>
                  <p><span className="font-semibold text-white">Phone:</span> {contactSettings.phone ? (<a href={`tel:${contactSettings.phone}`} className="hover:underline text-blue-300">{contactSettings.phone}</a>) : 'No data available'}</p>
                </div>
                {contactSettings.mapSrc && (
                  <a
                    href={contactSettings.mapSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-maps-btn w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2 mt-4"
                    style={{ color: '#ffffff' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ffffff' }}><path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z"/><path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>
                    <span style={{ color: '#ffffff' }}>Open in Google Maps</span>
                  </a>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-white/10 p-6 text-center text-white/70">No data available</div>
            )}
          </div>

          {/* Primary Contact Card */}
          <div className="card text-white bg-gradient-to-r from-purple-600 to-blue-600 text-center flex flex-col items-center justify-center min-h-[300px] py-6">
            <h3 className="text-2xl font-bold mb-4">Primary Contact</h3>
            {(contactSettings.primaryName || contactSettings.primaryTagline || contactSettings.whatsapp) ? (
              <>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-semibold">{contactSettings.primaryName || 'No data available'}</h4>
                    <p className="text-white/80">{contactSettings.primaryTagline || 'No data available'}</p>
                  </div>
                </div>
                {contactSettings.whatsapp ? (
                  <button onClick={openWhatsApp} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                                <path d="M12.004 22.785h-.005A9.87 9.87 0 016.968 21.41l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 011.12 12C1.121 6.55 5.555 2.116 11.007 2.116a9.88 9.88 0 019.885 9.888c-.003 5.45-4.437 9.884-9.888 9.884z"/>
                              </svg>
                    <span>Chat on WhatsApp</span>
                  </button>
                ) : (
                  <div className="text-white/80">No WhatsApp available</div>
                )}
              </>
            ) : (
              <div className="text-white/80">No data available</div>
            )}
            {contactSettings.socials && contactSettings.socials.length > 0 && (
              <>
                <p className="mt-6 text-white/80 text-sm">Connect with us on social media</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  {contactSettings.socials.map((s, idx) => {
                    const slugMap: Record<string,string> = {
                      'Facebook': 'facebook', 'Instagram': 'instagram', 'Twitter/X': 'x', 'LinkedIn': 'linkedin', 'YouTube': 'youtube', 'GitHub': 'github',
                      'WhatsApp': 'whatsapp', 'Telegram': 'telegram', 'TikTok': 'tiktok', 'Snapchat': 'snapchat', 'Pinterest': 'pinterest', 'Reddit': 'reddit',
                      'Medium': 'medium', 'Discord': 'discord', 'Fiverr': 'fiverr', 'Upwork': 'upwork', 'Freelancer': 'freelancer', 'PeoplePerHour': 'peopleperhour',
                      'Guru': 'guru', 'Toptal': 'toptal', 'FlexJobs': 'flexjobs', '99designs': '99designs', 'Upstack': 'upstack', 'SimplyHired': 'simplyhired'
                    };
                    const slug = slugMap[s.name as keyof typeof slugMap];
                    const iconUrl = slug ? `https://cdn.simpleicons.org/${slug}` : '';
                    return (
                      <SocialIconLink
                        key={idx}
                        href={s.href}
                        name={s.name}
                        iconUrl={iconUrl}
                        slug={slug}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
