'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import './SectionPage.css';

const PrivacyPolicyPage: React.FC = () => {
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
          <h1>Privacy Policy</h1>
          <div className="section-content">
            <p>Last updated: {lastUpdated || 'Loading...'}</p>

            <p>
              Team4Stack values user trust. This policy explains what data is collected to run the platform,
              why it is used, and how we protect it.
            </p>

            <h2>What We Collect</h2>
            <ul>
              <li>Basic account details (for example name, email, username, and profile image if you upload one)</li>
              <li>Course and application information you submit on the platform</li>
              <li>Support messages and optional screenshots you upload for issue resolution</li>
              <li>Technical logs needed for performance, security, and error monitoring</li>
            </ul>

            <h2>How We Use Data</h2>
            <ul>
              <li>To create and secure your account</li>
              <li>To process course applications and provide course access</li>
              <li>To respond to support requests and improve service quality</li>
              <li>To detect abuse, protect platform security, and maintain reliability</li>
            </ul>

            <h2>How We Protect Data</h2>
            <p>
              We apply role-based access controls, backend validations, and secure storage practices.
              Access to administrative actions is restricted by authorization rules.
            </p>

            <h2>Data Sharing</h2>
            <p>
              We do not share personal data for unrelated marketing. Data is shared only when required to
              operate the service, comply with legal obligations, or protect platform security.
            </p>

            <h2>Your Controls</h2>
            <ul>
              <li>You can request updates to incorrect account details</li>
              <li>You can contact us for data-related questions or deletion requests where applicable</li>
              <li>You can manage cookie choices from the cookies section</li>
            </ul>

            <h2>Policy Updates</h2>
            <p>
              We may update this policy as features evolve. Material changes will be reflected on this page.
            </p>

            <p className="legal-note">
              Questions about privacy? Visit <Link href="/contact">Contact Support</Link>.
            </p>
          </div>
        </div>
    </div>
  );
};

export default PrivacyPolicyPage;

