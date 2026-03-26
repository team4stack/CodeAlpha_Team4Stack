export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  return null;
};

export const convertToEmbedUrl = (url: string): string | null => {
  const makeEmbedUrl = (videoId: string) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  if (!url || typeof url !== 'string' || url.trim().length === 0) return null;

  if (url.includes('playlist?list=') || url.includes('/playlist')) {
    return null;
  }

  if (
    url === 'https://www.youtube.com/' ||
    url === 'https://youtube.com/' ||
    url === 'http://www.youtube.com/' ||
    url === 'http://youtube.com/'
  ) {
    return null;
  }

  if (url.includes('/embed/')) {
    const videoId = url.split('/embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
    if (videoId && videoId.length > 0 && videoId.length <= 11) {
      return makeEmbedUrl(videoId);
    }
  }

  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts.length > 1) {
      const videoId = parts[1]?.split('?')[0]?.split('&')[0]?.split('/')[0]?.split('#')[0];
      if (videoId && videoId.length > 0 && videoId.length <= 11) {
        return makeEmbedUrl(videoId);
      }
    }
  }

  if (url.includes('watch?v=')) {
    const parts = url.split('watch?v=');
    if (parts.length > 1) {
      const videoId = parts[1]?.split('&')[0]?.split('#')[0]?.split(' ')[0];
      if (videoId && videoId.length > 0 && videoId.length <= 11) {
        return makeEmbedUrl(videoId);
      }
    }
  }

  if (url.includes('youtube.com/v/')) {
    const parts = url.split('youtube.com/v/');
    if (parts.length > 1) {
      const videoId = parts[1]?.split('?')[0]?.split('&')[0]?.split('#')[0];
      if (videoId && videoId.length > 0 && videoId.length <= 11) {
        return makeEmbedUrl(videoId);
      }
    }
  }

  return null;
};
