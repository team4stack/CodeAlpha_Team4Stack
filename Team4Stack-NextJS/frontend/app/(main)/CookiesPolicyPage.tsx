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

            <p>
              This page explains how Team4Stack uses cookies and similar browser storage to keep the website working
              properly and improve user experience.
            </p>

            <h2>Why Cookies Are Used</h2>
            <ul>
              <li>To keep essential platform features working (for example sign-in and security checks)</li>
              <li>To remember your cookie preferences</li>
              <li>To improve performance and reliability for returning visits</li>
            </ul>

            <h2>Cookie Categories</h2>
            <h3>Necessary Cookies</h3>
            <p>
              These are required for core functionality and security. Without them, key parts of the platform may not work.
            </p>

            <h3>Optional/Functional Cookies</h3>
            <p>
              These help personalize experience and improve convenience. They are used only according to your consent choices.
            </p>

            <h3>Third-Party Services</h3>
            <p>
              Some integrated services (such as security or authentication providers) may set their own cookies.
              Their usage is governed by their own privacy terms.
            </p>

            <CookiePreferencesPanel />

            <h2>Managing Your Choices</h2>
            <p>
              You can update your cookie preferences at any time and you can also clear site data from browser settings.
            </p>

            <p className="legal-note">
              We keep cookie information transparent without exposing sensitive implementation details.
            </p>

            <h2>Policy Updates</h2>
            <p>
              This Cookies Policy may be updated when platform features or compliance requirements change.
            </p>
          </div>
        </div>
    </div>
  );
};

export default CookiesPolicyPage;

