'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
// Layout is already applied in app/(main)/layout.tsx
import './SectionPage.css';

const TermsConditionsPage: React.FC = () => {
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
          <h1>Terms & Conditions</h1>
          <div className="section-content">
            <p>Last updated: {lastUpdated || 'Loading...'}</p>

            <p>
              These Terms govern your use of Team4Stack services, including course-related features and support channels.
            </p>

            <h2>Acceptance of Terms</h2>
            <p>
              By using this platform, you agree to these Terms and applicable policies. If you do not agree, please do not use the service.
            </p>

            <h2>Account and Access</h2>
            <ul>
              <li>Provide accurate information during signup and applications</li>
              <li>Keep your credentials secure and do not share account access</li>
              <li>You are responsible for activity performed through your account</li>
            </ul>

            <h2>Allowed Use</h2>
            <ul>
              <li>Use the platform lawfully and respectfully</li>
              <li>Do not attempt unauthorized access, scraping, or service disruption</li>
              <li>Do not upload harmful, misleading, or abusive content</li>
            </ul>

            <h2>Course and Application Rules</h2>
            <p>
              Course access, approvals, and account status are managed according to platform and admin rules.
              Misuse or false submissions may lead to restricted access.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              Platform content, branding, and learning materials are owned by Team4Stack or licensed partners
              and may not be copied or redistributed without permission.
            </p>

            <h2>Service Availability</h2>
            <p>
              We continuously improve the platform and may update features, content, or workflows.
              We try to minimize downtime but cannot guarantee uninterrupted availability at all times.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Team4Stack is not liable for indirect or consequential losses resulting from platform misuse,
              third-party outages, or circumstances outside reasonable control.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              Terms may be updated when legal or product requirements change. Updates are effective when posted on this page.
            </p>

            <p className="legal-note">
              For questions about these Terms, please <Link href="/contact">contact support</Link>.
            </p>
          </div>
        </div>
    </div>
  );
};

export default TermsConditionsPage;

