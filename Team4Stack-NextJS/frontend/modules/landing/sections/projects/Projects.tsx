'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ProjectData, fetchYouTubeVideoData } from '@/lib/utils/youtube';
import { CONTACT_PHONE_NUMBERS } from '@/lib/utils/constants';
import { landingApi } from '@/lib/api';

const Projects: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  // merged list (base + extra)
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{apiKeyStatus: string, error?: string} | null>(null);

  // Extract a YouTube video ID from either a plain ID or a full URL
  const extractYouTubeId = (input: string): string => {
    if (!input) return '';
    const trimmed = input.trim();
    // If it looks like a raw 11-char ID, return as is
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    // Try common URL formats
    const regexes = [
      /v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const r of regexes) {
      const m = r.exec(trimmed);
      if (m && m[1]) return m[1];
    }
    return trimmed; // fallback
  };

  // Supabase-only now; demo lists removed

  useEffect(() => {
    // Supabase-only
    const useSupabase = true;
    setUsingSupabase(true);

    // Debug environment variables
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    setDebugInfo({
      apiKeyStatus: apiKey ? `SET (length: ${apiKey.length})` : 'NOT SET'
    });
    
    // Debug info only in development mode
    
    const fetchAllProjects = async () => {
      setLoading(true);
      try {
        if (useSupabase) {
          try {
            const result = await landingApi.getProjects();
            const { data, error } = result;
            if (error) throw error;
            const rows = data || [];
            if (rows.length > 0) {
              // For each row, fetch YouTube details and merge with DB values (DB overrides when provided)
              const mappedPromises = rows.map(async (row: any): Promise<ProjectData> => {
                const videoId = extractYouTubeId(row.video_id || '');
                const github = (row.github_url || '#').trim();
                let yt: ProjectData | null = null;
                if (videoId) {
                  try {
                    yt = await fetchYouTubeVideoData(videoId, github);
                  } catch {
                    yt = null;
                  }
                }
                return {
                  id: String(row.id),
                  title: row.title || yt?.title || 'Project',
                  description: (row.description ?? '').trim() || yt?.description || '',
                  thumbnailUrl: (row.image_url ?? '').trim() || yt?.thumbnailUrl || '',
                  videoUrl: yt?.videoUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#'),
                  githubUrl: github || yt?.githubUrl || '#',
                };
              });
              const mapped = await Promise.all(mappedPromises);
              setProjects(mapped);
              return;
            } else {
              // Supabase empty -> show none
              setProjects([]);
              return;
            }
            // else fallthrough to demo
          } catch (e) {
            // On error -> show none
            setProjects([]);
            return;
          }
        }
        // We are Supabase-only; no demo fallback
        
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching project data:', error);
        }
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
    // Note: Realtime updates removed - data now comes from backend API
    // If needed, implement polling or WebSocket from backend in the future
  }, []);

  // additional projects are merged during load; no toggle needed

  const openGitHub = (url: string) => {
    window.open(url, '_blank');
  };

  const openYouTube = (url: string) => {
    if (!url || url === '#') return;
    window.open(url, '_blank');
  };

  const totalProjects = projects.length;
  const safeFeaturedIndex = totalProjects > 0 ? featuredIndex % totalProjects : 0;
  const visibleDotsCount = Math.min(totalProjects, 8);
  const activeDotIndex = totalProjects <= 1
    ? 0
    : Math.round((safeFeaturedIndex / (totalProjects - 1)) * (visibleDotsCount - 1));

  const goPrev = () => {
    if (totalProjects === 0) return;
    setFeaturedIndex((prev) => (prev - 1 + totalProjects) % totalProjects);
  };
  const goNext = () => {
    if (totalProjects === 0) return;
    setFeaturedIndex((prev) => (prev + 1) % totalProjects);
  };

  // Auto-flip: cycle to next card (garment-style carousel)
  useEffect(() => {
    if (showAll || totalProjects <= 1 || isCarouselHovered) return;
    const interval = setInterval(goNext, 4500);
    return () => clearInterval(interval);
  }, [showAll, totalProjects, isCarouselHovered]);

  // Structured Data for SEO
  const projectsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Team4Stack Projects",
    "description": "Innovative MERN stack projects showcasing our technical expertise and creativity",
    "itemListElement": [...projects].map((project, index) => ({
      "@type": "CreativeWork",
      "position": index + 1,
      "name": project.title,
      "description": project.description,
      "url": project.videoUrl
    }))
  };

  return (
    <section id="projects" className={`section-padding ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-white'}`}>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(projectsStructuredData)}
      </script>
      
      <div className="container-custom">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6 animate-pulse"></div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-12 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New layout: Left = title + description + arrows, Right = featured card. Below = bundle grid. No animation. */}
        {!loading && projects.length > 0 && (
          <>
            {!showAll && (
              <>
                {/* Top row: Left (title + desc + arrows) | Right (featured card) */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 items-stretch">
                  {/* Left: Section name + short description (no buttons; auto-flip only) */}
                  <div className="lg:w-[42%] flex flex-col justify-center order-2 lg:order-1">
                    <p className={`text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>
                      Portfolio Showcase
                    </p>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Projects</span> Build Real Impact
                    </h2>
                    <p className={`text-base md:text-lg leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Explore production-ready MERN stack projects designed for startups, e-commerce brands, and growing businesses.
                      Each project combines clean UI, fast performance, and practical features that solve real user problems.
                      Hover on cards to pause the carousel, review details, and open live video or code instantly.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['MERN Stack', 'Responsive UI', 'Scalable Architecture', 'Clean Code', 'API Integrations', 'SEO Friendly'].map((item) => (
                        <span
                          key={item}
                          className={`px-3 py-1.5 rounded-full text-xs md:text-sm border ${isDarkMode ? 'bg-cyan-500/10 text-cyan-200 border-cyan-400/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Right: Garment-style stacked card carousel */}
                  <div className="lg:w-[58%] order-1 lg:order-2 flex flex-col items-center">
                    <div
                      className="relative w-full flex items-center justify-center"
                      style={{
                        height: 'clamp(300px, 60vw, 500px)',
                        minHeight: '300px',
                        perspective: '1000px',
                      }}
                      onMouseEnter={() => setIsCarouselHovered(true)}
                      onMouseLeave={() => setIsCarouselHovered(false)}
                    >
                      {totalProjects > 0 && projects.map((project, index) => {
                        const isActive = index === safeFeaturedIndex;
                        const isNext = index === (safeFeaturedIndex + 1) % totalProjects;
                        const isPrev = index === (safeFeaturedIndex - 1 + totalProjects) % totalProjects;

                        let zIndex = totalProjects - Math.abs(index - safeFeaturedIndex);
                        if (zIndex > totalProjects) zIndex = totalProjects;

                        let translateY = 0;
                        let rotateY = 0;
                        let scale = 1;
                        let opacity = 1;

                        if (isActive) {
                          translateY = 0;
                          rotateY = 0;
                          scale = 1;
                          opacity = 1;
                          zIndex = totalProjects + 1;
                        } else if (isNext) {
                          translateY = 30;
                          rotateY = -15;
                          scale = 0.9;
                          opacity = 0.7;
                        } else if (isPrev) {
                          translateY = -30;
                          rotateY = 15;
                          scale = 0.9;
                          opacity = 0.7;
                        } else {
                          translateY = index < safeFeaturedIndex ? -60 : 60;
                          rotateY = index < safeFeaturedIndex ? 25 : -25;
                          scale = 0.7;
                          opacity = 0.4;
                        }

                        const cardShadow = isActive
                          ? (isDarkMode
                              ? '0 25px 60px rgba(0,0,0,0.5)'
                              : '0px 25px 60px rgba(102, 126, 234, 0.3), 0px 10px 25px rgba(79, 172, 254, 0.25), 0px 0px 0px 1px rgba(102, 126, 234, 0.1)')
                          : '0 10px 30px rgba(0,0,0,0.2)';
                        const cardBg = isDarkMode
                          ? 'linear-gradient(145deg, #1f2937 0%, #111827 100%)'
                          : 'linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%)';
                        const cardBorder = isDarkMode ? '2px solid rgba(34, 211, 238, 0.4)' : '2px solid rgba(102, 126, 234, 0.4)';

                        return (
                          <motion.div
                            key={project.id}
                            className="absolute w-full max-w-[360px] flex flex-col"
                            style={{
                              width: 'clamp(260px, 65vw, 360px)',
                              height: 'clamp(300px, 75vw, 420px)',
                              transformStyle: 'preserve-3d',
                              zIndex,
                            }}
                            initial={false}
                            animate={{
                              y: translateY,
                              rotateY,
                              scale,
                              opacity,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: [0.68, -0.55, 0.265, 1.55],
                            }}
                            onClick={() => setFeaturedIndex(index)}
                          >
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                background: cardBg,
                                boxShadow: cardShadow,
                                border: cardBorder,
                                padding: '20px',
                                transform: isActive ? 'rotate(-5deg)' : 'rotate(0deg)',
                                transition: 'all 0.8s ease',
                              }}
                            >
                              <div
                                style={{
                                  borderRadius: '16px',
                                  overflow: 'hidden',
                                  boxShadow: '0px 4px 15px rgba(0,0,0,0.08)',
                                  width: '100%',
                                  aspectRatio: '16 / 9',
                                }}
                              >
                                <div
                                  className="relative w-full h-full cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openYouTube(project.videoUrl);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <img
                                    src={project.thumbnailUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover block"
                                    style={{ borderRadius: '14px', objectPosition: 'center top' }}
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                                      <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 pt-4 flex flex-col flex-1 min-h-0">
                                <h3 className={`text-base font-bold mb-2 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{project.title}</h3>
                                <p className={`text-xs leading-relaxed mb-3 line-clamp-2 flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openGitHub(project.githubUrl);
                                  }}
                                  className="w-full preview-btn rounded-lg py-2 text-sm mt-auto"
                                >
                                  View Code
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {/* Garment-style dots: active wider, rounded */}
                    {totalProjects > 0 && (
                      <div className="flex justify-center gap-2 mt-10" style={{ position: 'relative', zIndex: 100 }}>
                        {Array.from({ length: visibleDotsCount }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (totalProjects <= visibleDotsCount) {
                                setFeaturedIndex(i);
                                return;
                              }
                              const mappedIndex = Math.round((i / (visibleDotsCount - 1)) * (totalProjects - 1));
                              setFeaturedIndex(mappedIndex);
                            }}
                            aria-label={`Project ${i + 1}`}
                            style={{
                              width: i === activeDotIndex ? 30 : 10,
                              height: 10,
                              borderRadius: 5,
                              border: 'none',
                              backgroundColor: i === activeDotIndex ? (isDarkMode ? '#22d3ee' : '#1a1a2e') : (isDarkMode ? 'rgba(255,255,255,0.3)' : '#ccc'),
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Toggle to reveal full list */}
            {projects.length > perPage && !showAll && (
              <div className="flex items-center justify-center mb-6">
                <button
                  className="reviews-dot projects-toggle"
                  aria-label="Show more projects"
                  title="Show more projects"
                  onClick={() => setShowAll(true)}
                >
                  ↓
                </button>
              </div>
            )}
            {showAll && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {projects.slice((page - 1) * perPage, page * perPage).map((project, idx) => (
                    <div 
                      key={`${project.id}-grid-${idx}`}
                      className={`project-card project-neon relative group rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}
                    >
                      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => openYouTube(project.videoUrl)}>
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className={`text-xl font-bold mb-3 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{project.title}</h3>
                        <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</p>
                        <button onClick={() => openGitHub(project.githubUrl)} className="w-full preview-btn mt-auto" aria-label={`View code for ${project.title}`}>View Code</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <div className="reviews-pagination mb-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="reviews-dot"
                  >
                    ◄
                  </button>
                  {Array.from({ length: Math.max(1, Math.ceil(projects.length / perPage)) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={`p-${p}`}
                      onClick={() => setPage(p)}
                      className={`reviews-dot ${p === page ? 'reviews-dot--active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(projects.length / perPage) || 1, p + 1))}
                    disabled={page >= (Math.ceil(projects.length / perPage) || 1)}
                    className="reviews-dot"
                  >
                    ►
                  </button>
                </div>
                {/* Up arrow at the same down position */}
                <div className="flex items-center justify-center mb-10">
                  <button
                    className="reviews-dot projects-toggle"
                    aria-label="Back to projects"
                    title="Back to projects"
                    onClick={() => { setShowAll(false); setPage(1); }}
                  >
                    ↑
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {!loading && projects.length === 0 && (
          <div className="text-center py-16">
            <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>No projects available</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please check back soon — new projects will appear here.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <div className={`rounded-xl p-8 max-w-4xl mx-auto shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Want to Create Your Own Project?
            </h3>
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Let us help you build your dream MERN stack project. Click "Make a Project" to get started or "View All Work" to see more of our projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.open('https://www.fiverr.com/s/GzqRwwz', '_blank')} 
                className="preview-btn preview-btn-green preview-btn-fit text-base px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Make a project with us"
              >
                Make a Project
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/${CONTACT_PHONE_NUMBERS.primary}`, '_blank')} 
                className="btn-ghost text-lg px-8 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Contact us on WhatsApp"
              >
                WhatsApp Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
