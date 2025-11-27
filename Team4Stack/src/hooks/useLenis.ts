import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const useLenis = (enabled: boolean = true) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768);

    const lenis = new Lenis({
      smoothWheel: true,
      // Optimize lerp for better performance (lower = smoother but more CPU intensive)
      lerp: isMobile ? 0.08 : 0.1, // Slightly faster on mobile for better responsiveness
      wheelMultiplier: isMobile ? 1.0 : 0.8, // Better wheel sensitivity
      touchMultiplier: isMobile ? 2.0 : 1.5, // Better touch scrolling on mobile
      gestureOrientation: 'vertical',
      duration: isMobile ? 1.0 : 1.2, // Faster on mobile
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
      // Performance optimizations
      smoothTouch: true, // Enable smooth touch scrolling
      touchInertiaMultiplier: 30, // Better momentum scrolling
      // Reduce work on low-end devices
      autoResize: true,
    });
    lenisRef.current = lenis;

    // Optimized RAF loop with performance monitoring
    let rafId = 0;
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const raf = (time: number) => {
      // Throttle to maintain 60fps
      const delta = time - lastTime;
      if (delta >= frameInterval) {
        lenis.raf(time);
        lastTime = time - (delta % frameInterval);
      }
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Handle resize for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        lenis.resize();
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => lenis.resize(), 100);
    }, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
};

export default useLenis;


