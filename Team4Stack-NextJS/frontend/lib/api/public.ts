import { apiClient } from './client';

export type VisitorEventPayload = {
  visitorId: string;
  sessionId: string;
  consentLevel: 'functional';
  pagePath: string;
  pageUrl: string;
  pageTitle: string;
  referrer?: string;
  language?: string;
  languages?: string[];
  timezone?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  colorScheme?: 'light' | 'dark';
  cookieEnabled?: boolean;
  touchPoints?: number;
  hardwareConcurrency?: number;
  platform?: string;
};

export const publicApi = {
  trackVisitorEvent: async (payload: VisitorEventPayload) =>
    apiClient.post('/public/visitors/events', payload, {
      keepalive: true,
      cache: 'no-store',
    }),
};

export default publicApi;
