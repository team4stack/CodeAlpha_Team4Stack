// YouTube API Utility
// This file contains functions to fetch YouTube video data

// Define TypeScript interfaces for YouTube API response
interface YouTubeVideoSnippet {
  title: string;
  description: string;
  thumbnails: {
    default: {
      url: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
    };
    high: {
      url: string;
      width: number;
      height: number;
    };
    standard?: {
      url: string;
      width: number;
      height: number;
    };
    maxres?: {
      url: string;
      width: number;
      height: number;
    };
  };
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeVideoSnippet;
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}

interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

type YoutubeApiErrorBody = YouTubeApiError['error'];

/** Log missing server key hint once per page load (many projects = many parallel fetches). */
let loggedYoutubeBackendConfigHint = false;

function fallbackProjectData(videoId: string, githubUrl: string, description: string): ProjectData {
  return {
    id: videoId,
    title: 'Project Title',
    description,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    homeThumbnailUrl: '',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    githubUrl,
  };
}

// Define the structure for our project data
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  /** Admin-provided cover image — used on home showcase only */
  homeThumbnailUrl: string;
  videoUrl: string;
  githubUrl: string;
  createdAt?: string;
}

const pickBestYouTubeThumbnail = (thumbnails: YouTubeVideoSnippet['thumbnails'], videoId: string): string => {
  // Prefer true 16:9 variants first to avoid letterboxed empty bands.
  return (
    thumbnails.maxres?.url ||
    thumbnails.medium?.url ||
    thumbnails.high?.url ||
    thumbnails.standard?.url ||
    thumbnails.default?.url ||
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  );
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isYouTubeApiErrorResponse(data: unknown): data is YouTubeApiError {
  if (!isRecord(data) || !('error' in data)) {
    return false;
  }
  const err = data.error;
  return typeof err === 'object' && err !== null && 'code' in err;
}

function isYouTubeApiSuccessResponse(data: unknown): data is YouTubeApiResponse {
  if (!isRecord(data) || !('items' in data)) {
    return false;
  }
  return Array.isArray(data.items);
}

function logDevYoutubeYtError(ytErr: YoutubeApiErrorBody): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  console.error(
    '[youtube] API error:',
    typeof ytErr.message === 'string' ? ytErr.message : JSON.stringify(ytErr, null, 2)
  );
}

function handleStringErrorField(
  msg: string,
  response: Response,
  videoId: string,
  githubUrl: string
): ProjectData {
  const isMissingKey =
    response.status === 503 ||
    msg.toLowerCase().includes('not configured') ||
    msg.toLowerCase().includes('youtube api');

  if (!isMissingKey) {
    return fallbackProjectData(videoId, githubUrl, msg);
  }

  if (process.env.NODE_ENV === 'development' && !loggedYoutubeBackendConfigHint) {
    loggedYoutubeBackendConfigHint = true;
    console.warn(
      '[youtube] Backend has no YOUTUBE_API_KEY — using thumbnail fallbacks. Add YOUTUBE_API_KEY to backend/.env and restart the API.'
    );
  }
  return fallbackProjectData(
    videoId,
    githubUrl,
    'Video details are temporarily unavailable. Please try again later.'
  );
}

function handleGoogleStyleErrorInBody(parsed: YouTubeApiError, videoId: string, githubUrl: string): ProjectData | null {
  const ytErr = parsed.error;
  logDevYoutubeYtError(ytErr);

  if (ytErr.code === 403) {
    return fallbackProjectData(
      videoId,
      githubUrl,
      'Unable to load project details right now. Please try again later.'
    );
  }

  if (ytErr.code === 400 && String(ytErr.message || '').includes('API key not valid')) {
    return fallbackProjectData(
      videoId,
      githubUrl,
      'Unable to load project details right now. Please try again later.'
    );
  }

  return null;
}

/** @returns ProjectData if handled; null if caller should throw generic error */
function tryProjectDataFromErrorJson(
  parsed: unknown,
  response: Response,
  videoId: string,
  githubUrl: string
): ProjectData | null {
  if (!isRecord(parsed) || !('error' in parsed)) {
    return null;
  }

  const errField = parsed.error;
  if (typeof errField === 'string') {
    return handleStringErrorField(errField, response, videoId, githubUrl);
  }

  if (isYouTubeApiErrorResponse(parsed)) {
    return handleGoogleStyleErrorInBody(parsed, videoId, githubUrl);
  }

  return null;
}

async function handleYoutubeProxyNotOk(
  response: Response,
  videoId: string,
  githubUrl: string
): Promise<ProjectData> {
  let errorText = '';
  try {
    errorText = await response.text();
  } catch (textError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to read error response as text:', textError);
    }
  }

  try {
    const parsed: unknown = JSON.parse(errorText);
    const handled = tryProjectDataFromErrorJson(parsed, response, videoId, githubUrl);
    if (handled) {
      return handled;
    }
  } catch (parseError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to parse YouTube API error response as JSON:', parseError);
    }
  }

  throw new Error(`YouTube API request failed with status ${response.status}: ${response.statusText}`);
}

function projectDataFromOkJson(data: unknown, videoId: string, githubUrl: string): ProjectData {
  if (isYouTubeApiErrorResponse(data)) {
    if (process.env.NODE_ENV === 'development') {
      const e = data.error;
      console.error(
        '[youtube] proxy error:',
        typeof e.message === 'string' ? e.message : JSON.stringify(e, null, 2)
      );
    }
    return {
      id: videoId,
      title: 'Project Title',
      description: 'Unable to load project details from YouTube. Ensure the backend has YOUTUBE_API_KEY set.',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    homeThumbnailUrl: '',
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      githubUrl,
    };
  }

  if (!isYouTubeApiSuccessResponse(data) || data.items.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('No video data found for ID:', videoId);
    }
    return {
      id: videoId,
      title: 'Project Title',
      description: 'No video data available for this project',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    homeThumbnailUrl: '',
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      githubUrl,
    };
  }

  const video = data.items[0];
  return {
    id: videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl: pickBestYouTubeThumbnail(video.snippet.thumbnails, videoId),
    homeThumbnailUrl: '',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    githubUrl,
  };
}

/**
 * Fetch YouTube video data using the YouTube Data API v3
 * @param videoId - The YouTube video ID
 * @returns Promise<ProjectData> - The project data
 */
export const fetchYouTubeVideoData = async (videoId: string, githubUrl: string): Promise<ProjectData> => {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const apiUrl = `${base}/public/youtube/video?videoId=${encodeURIComponent(videoId)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return await handleYoutubeProxyNotOk(response, videoId, githubUrl);
    }

    const data: unknown = await response.json();
    return projectDataFromOkJson(data, videoId, githubUrl);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching YouTube video data:', error);
    }
    return {
      id: videoId,
      title: 'Project Title',
      description: 'Unable to load project details right now. Please try again later.',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    homeThumbnailUrl: '',
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      githubUrl,
    };
  }
};

/**
 * Get YouTube thumbnail URL directly (for lazy loading)
 * @param videoId - The YouTube video ID
 * @returns string - The thumbnail URL
 */
export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};
