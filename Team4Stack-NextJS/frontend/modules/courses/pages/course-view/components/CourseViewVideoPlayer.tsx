import React from 'react';
import type { Video } from '../types';
import { convertToEmbedUrl } from '../youtubeVideoUrlHelpers';

interface CourseViewVideoPlayerProps {
  isDarkMode: boolean;
  selectedVideo: Video;
  iframeError: boolean;
  youtubeApiPlayerAvailable: boolean;
  /** True after waiting for IFrame API exceeded parent timeout (plain iframe fallback). */
  youtubeApiTimedOut: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onIframeLoaded: () => void;
  onIframeError: () => void;
  onRetryIframe: () => void;
  onVideoEnded: (videoId: number) => void;
}

const CourseViewVideoPlayer: React.FC<CourseViewVideoPlayerProps> = ({
  isDarkMode,
  selectedVideo,
  iframeError,
  youtubeApiPlayerAvailable,
  youtubeApiTimedOut,
  iframeRef,
  videoRef,
  onIframeLoaded,
  onIframeError,
  onRetryIframe,
  onVideoEnded
}) => {
  if (!selectedVideo.video_url) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
        <span className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-100'
        }`}>
          Video Player
        </span>
        <span className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-300'
        }`}>
          No video URL provided
        </span>
      </div>
    );
  }

  const isYouTube = selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be');

  if (!isYouTube) {
    return (
      <video
        ref={videoRef}
        src={selectedVideo.video_url}
        controls
        className="w-full h-full"
        onEnded={() => onVideoEnded(selectedVideo.id)}
      />
    );
  }

  const embedUrl = convertToEmbedUrl(selectedVideo.video_url);
  if (!embedUrl) {
    const isPlaylist = selectedVideo.video_url.includes('playlist?list=') || selectedVideo.video_url.includes('/playlist');
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
        <span className={`text-4xl mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>⚠️</span>
        <span className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-100'}`}>
          {isPlaylist ? 'Playlist URL Not Supported' : 'Invalid Video URL'}
        </span>
        <span className={`text-sm text-center px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}>
          {isPlaylist
            ? 'Playlist URLs cannot be embedded. Please use an individual video URL instead (e.g., https://youtube.com/watch?v=VIDEO_ID).'
            : 'The video URL provided is not valid. Please contact the administrator.'}
        </span>
      </div>
    );
  }

  if (iframeError) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900">
        <span className={`text-4xl mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>⚠️</span>
        <span className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-100'}`}>
          Unable to Load Video
        </span>
        <span className={`text-sm text-center px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`}>
          YouTube temporarily blocked embed playback on your network (429 Too Many Requests).
          Wait a little, then retry. If it continues, use a different network.
        </span>
        <button
          type="button"
          onClick={() => {
            onRetryIframe();
          }}
          className="mt-4 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const showIframeFallback = !youtubeApiPlayerAvailable && youtubeApiTimedOut;
  const waitingForYtApi = !youtubeApiPlayerAvailable && !youtubeApiTimedOut;

  return (
    <>
      {waitingForYtApi ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/95 px-4">
          <div
            className="mb-3 size-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400"
            aria-hidden
          />
          <p className={`text-sm text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
            Loading video player…
          </p>
          <p className={`mt-1 text-xs text-center max-w-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            If this takes too long, playback will open in the standard embed (progress may be estimated).
          </p>
        </div>
      ) : null}
      <div
        id={`youtube-player-${selectedVideo.id}`}
        className={`w-full h-full absolute inset-0 ${youtubeApiPlayerAvailable ? '' : 'hidden'}`}
      />
      {showIframeFallback ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={selectedVideo.title}
          className="w-full h-full absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={onIframeLoaded}
          onError={onIframeError}
        />
      ) : null}
    </>
  );
};

export default CourseViewVideoPlayer;
