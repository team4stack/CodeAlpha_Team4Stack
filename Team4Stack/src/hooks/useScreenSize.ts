import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

// Tailwind CSS breakpoints
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Custom hook to detect and track screen size
 * Automatically updates when window is resized
 * 
 * @returns ScreenSize object with width, height, device type, and breakpoint
 * 
 * @example
 * const { isMobile, breakpoint, width } = useScreenSize();
 * if (isMobile) {
 *   // Mobile-specific code
 * }
 */
export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // Initialize with current window size
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;
    
    return {
      width,
      height,
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      breakpoint: getBreakpoint(width),
    };
  });

  useEffect(() => {
    // Function to update screen size
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        breakpoint: getBreakpoint(width),
      });
    };

    // Update on mount
    updateScreenSize();

    // Add resize event listener with debounce for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 150); // Debounce 150ms
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateScreenSize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

/**
 * Get current breakpoint based on width
 */
const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Hook to check if screen matches a specific breakpoint or larger
 * 
 * @param minBreakpoint - Minimum breakpoint to check
 * @returns boolean indicating if screen is at least the specified breakpoint
 * 
 * @example
 * const isLargeScreen = useBreakpoint('lg'); // true if width >= 1024px
 */
export const useBreakpoint = (minBreakpoint: Breakpoint): boolean => {
  const { width } = useScreenSize();
  return width >= breakpoints[minBreakpoint];
};

/**
 * Hook to check if screen is mobile (less than md breakpoint)
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useScreenSize();
  return isMobile;
};

/**
 * Hook to check if screen is tablet (md to lg breakpoint)
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useScreenSize();
  return isTablet;
};

/**
 * Hook to check if screen is desktop (lg breakpoint or larger)
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useScreenSize();
  return isDesktop;
};

