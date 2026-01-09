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

// Define the structure for our project data
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  githubUrl: string;
}

/**
 * Fetch YouTube video data using the YouTube Data API v3
 * @param videoId - The YouTube video ID
 * @returns Promise<ProjectData> - The project data
 */
export const fetchYouTubeVideoData = async (videoId: string, githubUrl: string): Promise<ProjectData> => {
  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('YouTube API key not found in environment variables');
      }
      // Return fallback data if API key is missing
      return {
        id: videoId,
        title: 'Project Title',
        description: 'Project data not available. If you are the site administrator, please configure the YouTube API key in environment variables.',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        githubUrl
      };
    }

    // Check API key format
    if (process.env.NODE_ENV === 'development' && (typeof apiKey !== 'string' || apiKey.length < 30)) {
      console.warn('YouTube API key format appears invalid');
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (textError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to read error response as text:', textError);
        }
      }
      
      // Try to parse JSON error response
      try {
        const errorData: YouTubeApiError = JSON.parse(errorText);
        
        if (errorData.error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('YouTube API Error Details:', errorData.error);
          }
          
          // Handle specific error cases
          if (errorData.error.code === 403) {
            return {
              id: videoId,
              title: 'Project Title',
              description: 'Unable to load project details. API key restrictions may be preventing access. Site administrator should check YouTube API configuration.',
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
              githubUrl
            };
          }
          
          // Handle API key invalid error
          if (errorData.error.code === 400 && errorData.error.message.includes('API key not valid')) {
            return {
              id: videoId,
              title: 'Project Title',
              description: 'API key is invalid. Please check the YouTube API key configuration.',
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
              githubUrl
            };
          }
        }
      } catch (parseError) {
        // If we can't parse the error, continue with generic error handling
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to parse YouTube API error response as JSON:', parseError);
        }
      }
      
      throw new Error(`YouTube API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data: YouTubeApiResponse = await response.json();

    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      
      return {
        id: videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        githubUrl
      };
    } else {
      // Fallback if no data returned
      if (import.meta.env.DEV) {
        console.warn('No video data found for ID:', videoId);
      }
      return {
        id: videoId,
        title: 'Project Title',
        description: 'No video data available for this project',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        githubUrl
      };
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching YouTube video data:', error);
    }
    // Return fallback data in case of error
    return {
      id: videoId,
      title: 'Project Title',
      description: 'Unable to load project details. This may be due to a temporary issue or missing configuration.',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      githubUrl
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