'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CrazyMernEffect } from '@/components/effects';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState<{index: number, name: string, top: number, left: number} | null>(null);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
        setSelectedMemberIndex(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      if (document.body && document.body.style) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restore body scroll when modal is closed
      if (document.body && document.body.style) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage) {
      setIsModalOpen(true);
    } else {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; role: string; image: string; portfolio: string; github: string; description: string; primaryTag?: string; bannerImage?: string }>>([]);
  const [mentor, setMentor] = useState<{
    name: string;
    role: string;
    description: string;
    image: string;
    bannerImage?: string;
    portfolio?: string;
    github?: string;
    tags: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sanitizeImageUrl = (u?: string): string => {
      if (!u) return '';
      if (u.includes('github.com') && u.includes('/blob/') && !u.includes('?raw=')) {
        return `${u}?raw=1`;
      }
      return u;
    };
    (async () => {
      setIsLoading(true);
      const { teamApi } = await import('@/lib/api')
      const result = await teamApi.getTeamMembers()
      if (Array.isArray(result.data)) {
        // Filter active members and sort
        const activeMembers = result.data
          .filter((m: any) => m.active === true)
          .sort((a: any, b: any) => {
            if (a.is_head !== b.is_head) return b.is_head ? 1 : -1
            if (a.order_index !== b.order_index) return (a.order_index || 0) - (b.order_index || 0)
            return (a.id || 0) - (b.id || 0)
          })
        const mapped = activeMembers.map((r: any) => ({
          name: r.name,
          role: r.role,
          image: sanitizeImageUrl(r.profile_image_url || r.image_url || ''),
          portfolio: r.portfolio_url || '#',
          github: r.github_url || '#',
          description: r.description || '',
          primaryTag: r.primary_tag || undefined,
          bannerImage: sanitizeImageUrl(r.banner_image_url || '' ) || undefined,
        }));
        setTeamMembers(mapped);
      }

      // Fetch mentor profile (first active) via API
      const mentorResult = await teamApi.getMentorProfiles()
      if (Array.isArray(mentorResult.data) && mentorResult.data.length > 0) {
        const m = mentorResult.data[0] as any;
        setMentor({
          name: m.name,
          role: m.role,
          description: m.description || '',
          image: sanitizeImageUrl(m.profile_image_url || ''),
          bannerImage: sanitizeImageUrl(m.banner_image_url || ''),
          portfolio: m.portfolio_url || '#',
          github: m.github_url || '#',
          tags: String(m.primary_tag || '')
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
        });
      } else {
        setMentor(null);
      }
      setIsLoading(false);
    })();
  }, []);

  // Mentor (Sir Abdullah) information for modal preview (-1 index)
  const sirAbdullahInfo = {
    name: mentor?.name || 'Mentor',
    role: mentor?.role || '',
    description:
      mentor?.description ||
      'Mentor profile. Update details in admin → Mentor.',
    image: mentor?.image || ''
  };

  // Curated developer-themed banner images (Unsplash - free usage)
  const bannerImages = [
    'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop'
  ];

  // Structured Data for SEO
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Team4Stack",
    "description": "Four passionate MERN Stack developers working together to build exceptional web applications and deliver cutting-edge solutions for our clients.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Team4Stack",
      "description": "Professional web development team specializing in MERN stack technologies",
      "member": teamMembers.map(member => ({
        "@type": "Person",
        "name": member.name,
        "jobTitle": member.role,
        "url": member.portfolio,
        "sameAs": [member.github]
      }))
    }
  };

  const handlePortfolioClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, url: string) => {
    e.preventDefault();
    if (document.body && document.body.style) {
      document.body.style.overflow = 'hidden';
    }
    setLoadingPortfolio({index, name: teamMembers[index].name, top: 0, left: 0});
    setTimeout(() => {
      window.location.href = url;
    }, 1500);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (document.body && document.body.style) {
        document.body.style.overflow = '';
      }
    };
  }, []);

  return (
    <section id="about" className={`section-padding relative ${isDarkMode ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-white'}`}>
      <script type="application/ld+json">
        {JSON.stringify(aboutStructuredData)}
      </script>

      {/* MERN Effect Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
        <CrazyMernEffect isDarkMode={isDarkMode} />
      </div>

      <div className="container-custom relative" style={{ zIndex: 1 }}>
        {/* Mentor Section (from Supabase) */}
        <div className="flex items-center justify-center px-4">
            <div className="max-w-5xl w-full">
            {isLoading ? (
              // Skeleton loading for mentor (no card) - circular profile picture
              <div className="flex flex-col items-center gap-6 py-8">
                <div 
                  className={`mentor-skeleton-profile ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}
                ></div>
                <div className={`h-10 w-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                <div className={`h-6 w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className={`h-8 w-20 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                  <div className={`h-8 w-24 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                  <div className={`h-8 w-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <div className={`flex-1 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                  <div className={`flex-1 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse`}></div>
                  <div className={`w-full sm:w-auto sm:flex-1 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse`}></div>
                </div>
              </div>
            ) : mentor ? (
              <div className="flex flex-col items-center gap-6 py-8">
                {/* Profile Picture */}
                <button 
                  className="mentor-profile-btn"
                  onClick={() => { setSelectedImage(mentor.image); setSelectedMemberIndex(-1); }} 
                  aria-label={`Open ${mentor.name} image`}
                >
                  {/* Glass effect below the picture - circular */}
                  <div 
                    className="mentor-glass-effect"
                    style={{
                      background: 'conic-gradient(#6c63ff, #00d4ff, #ff2d9b, #6c63ff)'
                    }}
                  />
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="mentor-profile-img"
                  />
                </button>

                {/* Name and Role */}
                <div className="text-center">
                  <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {mentor.name}
                  </h1>
                  <p className={`text-xl font-medium ${isDarkMode ? 'text-purple-blue-300' : 'text-purple-600'}`}>
                    {mentor.role}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {mentor.tags.map((skill, index) => (
                    <span key={index} className={`text-sm font-medium px-4 py-2 rounded-full border ${isDarkMode ? 'bg-white/20 text-white border-white/30' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                      <a 
                    className="flex-1 no-underline inline-flex items-center justify-center font-medium transition-all rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 text-white"
                        href={mentor.portfolio || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                  >
                    Profile
                      </a>
                      <a 
                    className="flex-1 no-underline inline-flex items-center justify-center font-medium border transition-colors rounded-lg px-6 py-3 hover:bg-white/10"
                        href={mentor.github || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>Github</span>
                      </a>
                  <button 
                    className="preview-btn w-full sm:w-auto sm:flex-1" 
                    onClick={() => {
                        setSelectedImage(mentor.image);
                        setSelectedMemberIndex(-1);
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Meet Team4Stack Section */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            We have come to solve your <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-green-400 to-emerald-500' : 'from-purple-500 to-green-500'}`}>business</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Four passionate MERN Stack developers working together to build exceptional web applications and deliver cutting-edge solutions for our clients.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16" style={{ alignItems: 'stretch' }}>
          {isLoading ? (
            // Skeleton loading cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="relative group flex flex-col" style={{ height: '100%' }}>
                <article className="t4s-card team-neon">
                  <div className={`banner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`}>
                    <div className="dp bg-gray-600 animate-pulse" style={{ width: '6.5rem', height: '6.5rem', borderRadius: '50%', transform: 'translateY(40%)', margin: '0 auto' }}></div>
                  </div>
                  <div className="menu">
                    <div className="opener"><span></span><span></span><span></span></div>
                  </div>
                  <div className="flex flex-col flex-grow" style={{ justifyContent: 'space-between' }}>
                    <div className="flex flex-col items-center justify-center flex-grow" style={{ paddingTop: '1rem', minHeight: '120px' }}>
                      <div className={`h-6 w-32 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse mb-2`}></div>
                      <div className={`h-4 w-24 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                    </div>
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      <div className="flex flex-wrap gap-2 justify-center px-4 mb-3 min-h-[32px]">
                        <div className={`h-6 w-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                      </div>
                      <div className="actions">
                        <div className="cta-row">
                          <div className={`flex-1 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse`}></div>
                          <div className={`flex-1 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse`}></div>
                        </div>
                        <div className="cta-row">
                          <div className={`w-full h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))
          ) : (
            teamMembers.map((member, index) => (
            <div key={index} className="relative group flex flex-col" style={{ height: '100%' }}>
              <article className="t4s-card team-neon">
                <div className="banner" style={{ backgroundImage: `url(${member.bannerImage || bannerImages[index % bannerImages.length]})` }}>
                  <button className="dp" onClick={() => { setSelectedImage(member.image); setSelectedMemberIndex(index); }} aria-label={`Open ${member.name} image`}>
                    <img src={member.image} alt={member.name} />
                  </button>
                </div>
                <div className="menu">
                  <div className="opener"><span></span><span></span><span></span></div>
                </div>
                <div className="flex flex-col flex-grow" style={{ justifyContent: 'space-between' }}>
                  <div className="flex flex-col items-center justify-center flex-grow" style={{ paddingTop: '1rem', minHeight: '120px' }}>
                    <h2 className={`name ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{marginTop: '0', paddingTop: '0'}}>{member.name}</h2>
                    <div className="title">{member.role}</div>
                  </div>
                  <div style={{ marginTop: 'auto', width: '100%' }}>
                    <div className="flex flex-wrap gap-2 justify-center px-4 mb-3 min-h-[32px]">
                      {member.primaryTag ? (() => {
                        const tags = String(member.primaryTag)
                          .split(',')
                          .map(t => t.trim())
                          .filter(Boolean);
                        if (tags.length === 0) return null;
                        return tags.map((t, i) => (
                          <span
                            key={i}
                            className={`text-xs font-medium px-3 py-1 rounded-full border ${isDarkMode ? 'bg-white/20 text-white border-white/30' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
                          >
                            {t}
                          </span>
                        ));
                      })() : <div style={{ height: '8px' }}></div>}
                    </div>
                    <div className="actions">
                      <div className="cta-row">
                        <a 
                          className="portfolio-btn-new flex-1 no-underline inline-flex items-center justify-center font-medium transition-all rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-3 relative"
                          href={member.portfolio} 
                          onClick={(e) => handlePortfolioClick(e, index, member.portfolio)}
                          style={{ 
                            textDecoration: 'none', 
                            borderRadius: '50px',
                            width: '100%',
                            minWidth: '0',
                            position: 'relative',
                            zIndex: 1,
                            color: '#ffffff'
                          }}
                        >
                          <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Portfolio</span>
                        </a>
                        <a 
                          className="github-btn-navbar-style flex-1 no-underline inline-flex items-center justify-center font-medium border transition-colors rounded-lg"
                          href={member.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          <span>Github</span>
                        </a>
                      </div>
                      <div className="cta-row">
                        <button className="preview-btn w-full" onClick={() => { setSelectedImage(member.image); setSelectedMemberIndex(index); }}>Preview</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            ))
          )}
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white dark:text-white light:text-gray-800">Our Mission</h3>
            <p className="text-lg text-white/80 dark:text-white/80 light:text-gray-600 mb-6">
              We create opportunities to learn and build. We teach MERN online and in person at WE Connect for hands-on practice, and we build complete MERN websites and apps for clients. Our mission is to deliver practical, industry-ready solutions.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-blue-100 dark:bg-purple-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-purple-blue-600 rounded-full"></div>
                </div>
                <p className="text-white/80 dark:text-white/80 light:text-gray-600">Innovation and creativity in every project</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="card">
              <h3 className="text-2xl font-bold mb-6 text-white dark:text-white light:text-gray-800">Our Values</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-white dark:text-white light:text-gray-800">Quality</h4>
                    <p className="text-white/80 dark:text-white/80 light:text-gray-600">Excellence in every deliverable</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-white dark:text-white light:text-gray-800">Innovation</h4>
                    <p className="text-white/80 dark:text-white/80 light:text-gray-600">Cutting-edge solutions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-teal-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-white dark:text-white light:text-gray-800">Collaboration</h4>
                    <p className="text-white/80 dark:text-white/80 light:text-gray-600">Working together for success</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-[9999] flex items-center justify-center p-4 pt-10 md:pt-14 transition-all duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => { setSelectedImage(null); setSelectedMemberIndex(null); }}>
          <div className={`relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out ${isModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-4 px-3 pb-5 pt-10 md:pt-12">
              <div className="w-full rounded-3xl border border-white/10 bg-black/90 backdrop-blur-md p-5 shadow-xl relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setSelectedMemberIndex(null); }} 
                  className="preview-modal-close-btn w-9 h-9 md:w-12 md:h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 text-lg md:text-2xl font-bold shadow-lg hover:scale-110 z-50"
                  aria-label="Close preview"
                >
                  ×
                </button>
                <div className="mx-auto rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl shadow-white/20" style={{ width: 'clamp(180px, 60vw, 320px)', height: 'clamp(180px, 60vw, 320px)' }}>
                  <img src={selectedImage} alt="Profile" className="w-full h-full object-cover object-center" />
                </div>
                {selectedMemberIndex !== null && (
                  <div className="mt-4 text-center space-y-2">
                    {selectedMemberIndex === -1 ? (
                      <>
                        <h3 className="text-2xl font-bold text-white">{sirAbdullahInfo.name}</h3>
                        <p className="text-white/80">{sirAbdullahInfo.role}</p>
                        <p className="text-sm text-white/80 leading-relaxed" style={{ textAlign: 'justify' }}>{sirAbdullahInfo.description}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-white">{teamMembers[selectedMemberIndex].name}</h3>
                        <p className="text-white/80">{teamMembers[selectedMemberIndex].role}</p>
                        <p className="text-sm text-white/80 leading-relaxed" style={{ textAlign: 'justify' }}>{teamMembers[selectedMemberIndex].description}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Portfolio Popup */}
      {loadingPortfolio && (
        <>
          <div className="fixed inset-0" style={{ backdropFilter: 'blur(4px)', backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)', zIndex: 9998 }} />
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
            <div className={`rounded-xl p-6 max-w-sm w-full shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Loading Portfolio...
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Opening {loadingPortfolio.name}'s portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default About;
