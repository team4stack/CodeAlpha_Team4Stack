import { useEffect, useState } from 'react';

export const useYouTubeIframeApiReady = () => {
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);

  useEffect(() => {
    if ((window as any).YT?.Player) {
      setYoutubeApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      setYoutubeApiReady(true);
    };

    return () => {
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady;
      }
    };
  }, []);

  return youtubeApiReady;
};
