import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../utils/supabaseClient';
import { useAuth } from '../../../../auth';
import HeroDesktop from './HeroDesktop';
// Mobile component commented out temporarily
// import HeroMobile from './HeroMobile';

const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [prefersReducedMotionState, setPrefersReducedMotionState] = useState(false);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [texts, setTexts] = useState<string[]>([
    'Ai-Innovation',
    'MERN Solutions',
    'Code Phantom',
    'Digital Innovation',
    'Full-Stack Power'
  ]);
  const [bulletPoints, setBulletPoints] = useState<string[]>([
    '09+ Awesome Demos',
    'Modern & Clean Design',
    'Fully Responsive Design'
  ]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'matchMedia' in window) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotionState(!!mq.matches);
      }
    } catch {}
  }, []);

  // Load dynamic counters, animated texts, and bullet points from site_settings
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const loadCounts = async () => {
      try {
        const [proj, serv, cour, settings] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase
            .from('site_settings')
            .select('key,value')
            .in('key', ['hero_projects_count', 'hero_services_count', 'hero_courses_count', 'hero_animated_texts', 'hero_bullet_points'])
        ]);
        const projCount = proj.count ?? 0;
        const servCount = serv.count ?? 0;
        const courCount = cour.count ?? 0;
        const map: Record<string, string> = {};
        (settings.data || []).forEach((r: any) => {
          map[r.key] = r.value;
        });
        setProjectsCount(Number.isFinite(parseInt(map['hero_projects_count'])) ? parseInt(map['hero_projects_count']) : projCount);
        setServicesCount(Number.isFinite(parseInt(map['hero_services_count'])) ? parseInt(map['hero_services_count']) : servCount);
        setCoursesCount(Number.isFinite(parseInt(map['hero_courses_count'])) ? parseInt(map['hero_courses_count']) : courCount);
        
        // Load animated texts
        if (map['hero_animated_texts']) {
          try {
            const parsed = JSON.parse(map['hero_animated_texts']);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTexts(parsed);
            }
          } catch {}
        }
        
        // Load bullet points
        if (map['hero_bullet_points']) {
          try {
            const parsed = JSON.parse(map['hero_bullet_points']);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBulletPoints(parsed);
            }
          } catch {}
        }
      } catch {
        // fallback to defaults already set
      }
    };
    loadCounts();
    // realtime updates for counts and content
    channel = supabase
      .channel('hero_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => loadCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => loadCounts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        const k = (payload.new as any)?.key as string | undefined;
        if (!k || !k.startsWith('hero_')) return;
        loadCounts();
      })
      .subscribe();
    return () => {
      try { channel && supabase.removeChannel(channel); } catch {}
    };
  }, []);

  // Handle mouse events for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                if (prefersReducedMotionState) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                setTilt({ rx: -(dy * 6), ry: dx * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Always render desktop version since mobile is commented out
  return (
    <HeroDesktop
      currentText={currentText}
      texts={texts}
      bulletPoints={bulletPoints}
      projectsCount={projectsCount}
      servicesCount={servicesCount}
      coursesCount={coursesCount}
      tilt={tilt}
      prefersReducedMotionState={prefersReducedMotionState}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Hero;