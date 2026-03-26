import { useEffect, useState } from 'react';

export const useDesktopViewportState = (desktopBreakpoint = 1024) => {
  const [isDesktopView, setIsDesktopView] = useState(true);

  useEffect(() => {
    const updateViewportMode = () => {
      setIsDesktopView(window.innerWidth >= desktopBreakpoint);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    return () => window.removeEventListener('resize', updateViewportMode);
  }, [desktopBreakpoint]);

  return isDesktopView;
};
