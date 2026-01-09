'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ProjectData, fetchYouTubeVideoData } from '@/lib/utils/youtube';
import { CONTACT_PHONE_NUMBERS } from '@/lib/utils/constants';
import { supabase } from '@/lib/supabase/client';

const Projects: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  // merged list (base + extra)
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;
  // Add state for debugging info
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
            const { data, error } = await supabase
              .from('projects')
              .select('id,title,description,image_url,video_id,github_url,order_index')
              .order('order_index', { ascending: true, nullsFirst: false })
              .order('id', { ascending: false });
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
    // Realtime updates for projects
    const channel = supabase.channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchAllProjects();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  // additional projects are merged during load; no toggle needed

  const openGitHub = (url: string) => {
    window.open(url, '_blank');
  };

  const openYouTube = (url: string) => {
    if (!url || url === '#') return;
    window.open(url, '_blank');
  };

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force stop all animations on mobile whenever isMobile changes
  useEffect(() => {
    if (isMobile) {
      // Find all project tracks and stop their animations
      const tracks = document.querySelectorAll('.project-track');
      tracks.forEach((track) => {
        const el = track as HTMLDivElement;
        (el as any).isPaused = true;
        if ((el as any)._raf) {
          cancelAnimationFrame((el as any)._raf);
          (el as any)._raf = null;
        }
        el.style.transform = 'none';
        (el as any)._tx = 0;
      });
    }
  }, [isMobile]);

  // helpers for marquee dragging and auto scroll (desktop only)
  const getTx = (el: HTMLDivElement) => {
    // Prefer inline transform (most up-to-date), then computed, then stored
    const inline = el.style.transform;
    const matchInline = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(inline);
    if (matchInline) {
      const v = parseFloat(matchInline[1]);
      if (!isNaN(v)) return v;
    }
    const computed = getComputedStyle(el).transform;
    const matchComputed = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(computed);
    if (matchComputed) {
      const v = parseFloat(matchComputed[1]);
      if (!isNaN(v)) return v;
    }
    const stored = (el as any)._tx;
    return typeof stored === 'number' && !isNaN(stored) ? stored : 0;
  };
  
  // Desktop auto-animation (transform-based)
  const autoAnimate = (track: HTMLDivElement, speed: number = 1.5) => {
    // Skip animation on mobile - use native scroll instead
    if (isMobile) {
      // Cancel any existing animation on mobile
      if ((track as any)._raf) {
        cancelAnimationFrame((track as any)._raf);
        (track as any)._raf = null;
      }
      return;
    }
    
    let tx = (track as any)._tx ?? getTx(track);
    const step = () => {
      // Check again if mobile (in case screen was resized)
      if (isMobile) {
        if ((track as any)._raf) {
          cancelAnimationFrame((track as any)._raf);
          (track as any)._raf = null;
        }
        return;
      }
      
      // Only continue if not paused
      if ((track as any).isPaused) {
        (track as any)._raf = requestAnimationFrame(step);
        return;
      }

      // move left and loop
      tx -= speed; // faster speed
      const width = track.scrollWidth / 2; // because duplicated
      if (-tx >= width) tx += width;
      track.style.transform = `translateX(${tx}px)`;
      (track as any)._tx = tx;
      (track as any)._raf = requestAnimationFrame(step);
    };
    // cancel previous
    if ((track as any)._raf) cancelAnimationFrame((track as any)._raf);
    (track as any)._raf = requestAnimationFrame(step);
  };
  
  // Mobile native scroll handler - ensure animation is stopped
  const handleMobileScroll = (container: HTMLDivElement) => {
    if (!isMobile) return;
    
    const track = container.querySelector('.project-track') as HTMLDivElement | null;
    if (track) {
      // Force stop any animation on mobile
      (track as any).isPaused = true;
      if ((track as any)._raf) {
        cancelAnimationFrame((track as any)._raf);
        (track as any)._raf = null;
      }
      // Reset transform on mobile - use native scroll only
      track.style.transform = 'none';
      (track as any)._tx = 0;
    }
    
    // Optional: Use native scroll position for infinite loop effect
    // Commented out to prevent any interference with native scroll
    // const scrollLeft = container.scrollLeft;
    // const maxScroll = container.scrollWidth - container.clientWidth;
  };

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
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Projects</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover our innovative MERN stack projects and solutions that showcase our technical expertise and creativity.
          </p>
        </div>

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

        {/* Projects Auto-Scroll Marquee */}
        {!loading && projects.length > 0 && (
          <>
            {!showAll && (
            <div 
              className="project-marquee mb-16"
              onScroll={(e) => {
                if (isMobile) {
                  handleMobileScroll(e.currentTarget);
                }
              }}
              onTouchStart={(e) => {
                // On mobile touch, ensure animation is stopped
                if (isMobile) {
                  const container = e.currentTarget as HTMLDivElement;
                  const track = container.querySelector('.project-track') as HTMLDivElement | null;
                  if (track) {
                    (track as any).isPaused = true;
                    if ((track as any)._raf) {
                      cancelAnimationFrame((track as any)._raf);
                      (track as any)._raf = null;
                    }
                    track.style.transform = 'none';
                    (track as any)._tx = 0;
                  }
                }
              }}
              onTouchMove={(e) => {
                // On mobile touch move, keep animation stopped
                if (isMobile) {
                  const container = e.currentTarget as HTMLDivElement;
                  const track = container.querySelector('.project-track') as HTMLDivElement | null;
                  if (track) {
                    (track as any).isPaused = true;
                    if ((track as any)._raf) {
                      cancelAnimationFrame((track as any)._raf);
                      (track as any)._raf = null;
                    }
                  }
                }
              }}
              onMouseDown={(e) => {
                // Desktop only - skip on mobile
                if (isMobile) return;
              const container = e.currentTarget as HTMLDivElement;
              const track = container.querySelector('.project-track') as HTMLDivElement | null;
              if (!track) return;

              // Pause animation while dragging
              (track as any).isPaused = true;
              container.classList.add('dragging');

              const startX = e.pageX; const startTx = getTx(track);
              const onMove = (ev: MouseEvent) => {
                const currentTx = startTx + (ev.pageX - startX);
                track.style.transform = `translateX(${currentTx}px)`;
                (track as any)._tx = currentTx;
              };
              const onUp = () => {
                container.classList.remove('dragging');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                // Keep paused when mouse remains over container; resume on mouseleave
                (track as any)._tx = getTx(track);
                (track as any).isPaused = true;
              };
              document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
            }} onMouseEnter={(e) => {
              // Desktop only
              if (isMobile) return;
              const container = e.currentTarget as HTMLDivElement;
              const track = container.querySelector('.project-track') as HTMLDivElement | null;
              if (track) {
                (track as any).isPaused = true;
              }
            }} onMouseLeave={(e) => {
              // Desktop only
              if (isMobile) return;
              const container = e.currentTarget as HTMLDivElement;
              const track = container.querySelector('.project-track') as HTMLDivElement | null;
              if (track) {
                (track as any).isPaused = false;
                if (!(track as any)._raf) {
                  autoAnimate(track, 1.5);
                }
              }
            }}>
              <div 
                className="project-track" 
                ref={(el) => { 
                  if (el) {
                    // Cancel any existing animation first
                    if ((el as any)._raf) {
                      cancelAnimationFrame((el as any)._raf);
                      (el as any)._raf = null;
                    }
                    
                    if (!isMobile) {
                      // Desktop: Start auto-animation
                      setTimeout(() => autoAnimate(el, 1.5), 0);
                    } else {
                      // Mobile: Stop all animations and use native scroll
                      (el as any).isPaused = true;
                      (el as any)._tx = 0;
                      el.style.transform = 'translateX(0px)';
                      
                      // Ensure native scroll works
                      const container = el.parentElement;
                      if (container) {
                        container.scrollLeft = 0;
                      }
                    }
                  }
                }}
                style={isMobile ? {
                  // Mobile: Use flex layout for native scroll, NO transform
                  display: 'flex',
                  gap: '1.5rem',
                  width: 'max-content',
                  transform: 'none',
                  willChange: 'auto'
                } : {
                  // Desktop: Transform-based animation
                  touchAction: 'pan-x',
                  WebkitOverflowScrolling: 'touch',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
              {(projects.length >= 4 ? [...projects, ...projects] : projects).map((project, idx) => (
                <div 
                  key={`${project.id}-${idx}`}
                  className={`project-card project-neon relative group rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}
                >
                  {/* Project Thumbnail */}
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => openYouTube(project.videoUrl)}>
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className={`text-xl font-bold mb-3 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {project.title}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {project.description}
                    </p>
                  
                    {/* View Code Button */}
                    <button 
                      onClick={() => openGitHub(project.githubUrl)} 
                    className="w-full preview-btn rounded-lg mt-auto"
                      aria-label={`View code for ${project.title}`}
                    >
                      View Code
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
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
                    aria-label="Back to scrolling marquee"
                    title="Back to scrolling marquee"
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
