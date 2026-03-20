'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import CookiePreferencesPanel from '@/components/cookies/CookiePreferencesPanel';
// Layout is already applied in app/(main)/layout.tsx
import './SectionPage.css';

const CookiesPolicyPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Set date only on client side to avoid hydration mismatch
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className={`section-page ${isDarkMode ? 'dark' : ''}`}>
        <div className="section-container">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>Cookies Policy</h1>
          <div className="section-content">
            <p>Last updated: {lastUpdated || 'Loading...'}</p>
            
            <h2>What Are Cookies</h2>
            <p>Cookies are small text files that are stored on your device when you visit websites. They help websites remember your preferences and improve your browsing experience.</p>
            
            <h2>How We Use Cookies</h2>
            <p>Team4Stack uses cookies to:</p>
            <ul>
              <li>Ensure the website functions properly</li>
              <li>Analyze how visitors use our website</li>
              <li>Remember your preferences and settings</li>
              <li>Improve website performance and user experience</li>
            </ul>
            
            <h2>Types of storage we use</h2>
            <h3>Necessary</h3>
            <p>
              Needed for basic operation: for example your cookie choice itself is stored in <code>localStorage</code> under{' '}
              <code>t4s_cookie_consent_v1</code>. Signed-in sessions are kept in <code>localStorage</code> as{' '}
              <code>auth_session</code> so you can use courses and your account while browsing.
            </p>

            <h3>Functional (optional — with your consent)</h3>
            <p>
              If you choose <strong>Accept all</strong>, we keep what is needed on this device for a smoother return visit: stable
              sign-in, your account email (and display name when the app has it), and related session data. A first-party{' '}
              <code>auth_session</code> cookie may be used together with <code>localStorage</code>. We may also prefetch main pages
              and briefly cache public content responses in memory or <code>sessionStorage</code> so repeat views feel snappier (short
              expiry). Admin areas may use <code>sessionStorage</code> for <code>admin_session</code> while the dashboard tab is open.
            </p>

            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Purpose</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">t4s_cookie_consent_v1</td>
                    <td className="py-2 pr-4">localStorage</td>
                    <td className="py-2 pr-4">Stores your cookie preference</td>
                    <td className="py-2">Until you clear site data</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">auth_session</td>
                    <td className="py-2 pr-4">localStorage + optional cookie</td>
                    <td className="py-2 pr-4">Keeps you signed in (tokens)</td>
                    <td className="py-2">Per session / expiry from provider</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">t4s_signin_identity_v1</td>
                    <td className="py-2 pr-4">localStorage</td>
                    <td className="py-2 pr-4">Account email and name for sign-in UX when you chose Accept all</td>
                    <td className="py-2">Until you clear data or choose stricter cookies</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">t4s_remember_email</td>
                    <td className="py-2 pr-4">localStorage</td>
                    <td className="py-2 pr-4">Legacy key kept in sync with email for compatibility</td>
                    <td className="py-2">Same as above</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">t4s_perf_v1_*</td>
                    <td className="py-2 pr-4">sessionStorage</td>
                    <td className="py-2 pr-4">Short-lived cache of public API responses when you chose Accept all</td>
                    <td className="py-2">Minutes / until tab closes</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 pr-4 font-mono text-xs">admin_session</td>
                    <td className="py-2 pr-4">sessionStorage</td>
                    <td className="py-2 pr-4">Admin dashboard session</td>
                    <td className="py-2">Tab session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Third parties</h3>
            <p>
              Features such as Google reCAPTCHA on sign-in, social or OAuth sign-in, or analytics tools may set their own cookies or
              storage. See their respective policies for details.
            </p>

            <CookiePreferencesPanel />

            <h2>Managing cookies</h2>
            <p>
              Use the choices above or your browser settings to clear cookies and site data. If you choose &quot;Necessary only&quot;,
              we remove the optional <code>auth_session</code> cookie; your session may still exist in <code>localStorage</code> until
              you sign out or clear data.
            </p>
            
            <h2>Changes to This Cookies Policy</h2>
            <p>We may update our Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </div>
        </div>
    </div>
  );
};

export default CookiesPolicyPage;

