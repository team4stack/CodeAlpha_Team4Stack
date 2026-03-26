export type OAuthProvider = 'google' | 'github';

export const buildBackendOAuthRedirectUrl = (provider: OAuthProvider): string => {
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || globalThis.window.location.origin;
  const currentPath = globalThis.window.location.pathname;
  const finalRedirectTo = `${redirectUrl}${currentPath}`;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return `${apiUrl}/auth/oauth/redirect?provider=${provider}&redirect_to=${encodeURIComponent(finalRedirectTo)}`;
};
