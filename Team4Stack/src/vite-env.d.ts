/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_PRIMARY_PHONE: string;
  readonly VITE_TEAM_MEMBER_1_PHONE: string;
  readonly VITE_TEAM_MEMBER_2_PHONE: string;
  readonly VITE_TEAM_MEMBER_3_PHONE: string;
  readonly VITE_TEAM_MEMBER_4_PHONE: string;
  readonly VITE_FIVERR_PROFILE_URL: string;
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ALLOWED_ADMIN_EMAILS?: string; // Comma-separated admin emails for security
  readonly VITE_SITE_URL?: string; // Production site URL for OAuth redirects
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}