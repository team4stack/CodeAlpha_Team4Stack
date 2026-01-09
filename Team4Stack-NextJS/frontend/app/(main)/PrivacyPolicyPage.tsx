'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import MainLayout from '@/app/(main)/layout';
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
            
            <h2>Introduction</h2>
            <p>At Team4Stack, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or use our services.</p>
            
            <h2>Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>Personal identification information (Name, email address, phone number, etc.)</li>
              <li>Usage data (IP address, browser type, pages visited, time spent, etc.)</li>
              <li>Cookies and tracking technologies</li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>We use the collected information for various purposes:</p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
            
            <h2>Data Protection</h2>
            <p>We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.</p>
            
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
            </ul>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          </div>
        </div>
    </div>
  );
};

export default PrivacyPolicyPage;

