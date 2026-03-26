import { useEffect, useState } from 'react';

/**
 * Loads https://www.youtube.com/iframe_api only when `enabled` is true (e.g. after user taps "Load Video").
 * Chains with any existing global callback so multiple callers do not break each other.
 */
export const useYouTubeIframeApiLazy = (enabled: boolean): boolean => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }

    if (typeof globalThis === 'undefined') return;

    const w = globalThis as typeof globalThis & {
      YT?: { Player?: unknown };
      onYouTubeIframeAPIReady?: () => void;
    };

    if (w.YT?.Player) {
      setReady(true);
      return;
    }

    const previous = w.onYouTubeIframeAPIReady;
    const chained = () => {
      setReady(true);
      if (typeof previous === 'function') {
        previous();
      }
    };
    w.onYouTubeIframeAPIReady = chained;

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);
    }

    return () => {
      if (w.onYouTubeIframeAPIReady === chained) {
        w.onYouTubeIframeAPIReady = previous;
      }
    };
  }, [enabled]);

  return ready;
};
