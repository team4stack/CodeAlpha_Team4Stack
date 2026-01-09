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
            
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using Team4Stack services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not access or use our services.</p>
            
            <h2>Services</h2>
            <p>Team4Stack provides web development and software solutions. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.</p>
            
            <h2>User Responsibilities</h2>
            <p>When using our services, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not attempt to interfere with the proper functioning of our services</li>
            </ul>
            
            <h2>Intellectual Property</h2>
            <p>All content, trademarks, and intellectual property on Team4Stack websites are owned by or licensed to Team4Stack. You may not use our intellectual property without express written permission.</p>
            
            <h2>Limitation of Liability</h2>
            <p>Team4Stack shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services.</p>
            
            <h2>Termination</h2>
            <p>We reserve the right to terminate or suspend your access to our services at any time, without notice, for conduct that we believe violates these terms or is harmful to other users.</p>
            
            <h2>Changes to Terms</h2>
            <p>We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new terms on this page and updating the "Last updated" date.</p>
            
            <h2>Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with applicable laws.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please <Link href="/contact">contact us</Link>.</p>
          </div>
        </div>
    </div>
  );
};

export default TermsConditionsPage;

