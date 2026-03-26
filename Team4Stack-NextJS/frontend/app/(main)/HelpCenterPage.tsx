'use client'

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import './SectionPage.css';

const HelpCenterPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`section-page ${isDarkMode ? 'dark' : ''}`}>
        <div className="section-container">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>Help Center</h1>
          <div className="section-content">
            <p>Start here with the most important steps to use Team4Stack smoothly from day one.</p>
            
            <h2>Getting Started</h2>
            <div className="help-key-steps">
              <article className="help-key-step">
                <h3>Step 1: Create your account correctly</h3>
                <ul>
                  <li>Use an active email address that you check daily.</li>
                  <li>Choose a secure password and keep it private.</li>
                  <li>Complete profile basics (name and username) before applying.</li>
                </ul>
              </article>

              <article className="help-key-step">
                <h3>Step 2: Explore courses and choose the right one</h3>
                <ul>
                  <li>Read course details and make sure it matches your goal.</li>
                  <li>Check prerequisites before submitting the application.</li>
                  <li>Prepare required data and payment proof in advance.</li>
                </ul>
              </article>

              <article className="help-key-step">
                <h3>Step 3: Submit a complete application</h3>
                <ul>
                  <li>Enter accurate CNIC/B-Form and contact information.</li>
                  <li>Attach clear screenshot evidence where needed.</li>
                  <li>Review every field once before final submit.</li>
                </ul>
              </article>
            </div>

            <h2>Need More Help?</h2>
            <div className="help-category">
              <h3>Contact Our Team</h3>
              <p>If your issue is still unresolved, contact support with complete details and an optional screenshot.</p>
              <Link href="/contact" className="help-link">Go to Contact Support</Link>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HelpCenterPage;

