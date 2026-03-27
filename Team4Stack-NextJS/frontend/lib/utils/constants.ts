// Team4Stack Constants
// This file centralizes all sensitive and frequently used constants

// Contact Information
export const CONTACT_PHONE_NUMBERS = {
  primary: process.env.NEXT_PUBLIC_PRIMARY_PHONE || '+923405499734',
  teamMembers: [
    process.env.NEXT_PUBLIC_TEAM_MEMBER_1_PHONE || '+923405499734', // Muhammad Sami Ullah
    process.env.NEXT_PUBLIC_TEAM_MEMBER_2_PHONE || '+923126430166', // Muhammad Hasnain
    process.env.NEXT_PUBLIC_TEAM_MEMBER_3_PHONE || '+923293948099', // Fiaz Ahmad
    process.env.NEXT_PUBLIC_TEAM_MEMBER_4_PHONE || '+923097376067'  // M. Aftab Akram
  ]
} as const;

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'team4stack@gmail.com';

// Payment Info (shown on admission form)
export const PAYMENT_INFO = {
  method: process.env.NEXT_PUBLIC_PAYMENT_METHOD || 'JazzCash',
  number: process.env.NEXT_PUBLIC_PAYMENT_NUMBER || '+92 308 3266634'
} as const;

// reCAPTCHA
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lc2F-8pAAAAA'; // Replace with your actual site key from Google reCAPTCHA admin console

// External Links
export const FIVERR_PROFILE_URL = process.env.NEXT_PUBLIC_FIVERR_PROFILE_URL || 'https://www.fiverr.com/s/GzqRwwz';

// Utility function to get WhatsApp URL
export const getWhatsAppUrl = (phoneNumber: string, message: string = ''): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
};

// Utility function to get mailto URL
export const getMailToUrl = (email: string, subject: string = '', body: string = ''): string => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
};
