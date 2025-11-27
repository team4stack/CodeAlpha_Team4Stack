import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MainLayout from '../layout/MainLayout';
import './SectionPage.css';

const CookiesPolicyPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <MainLayout>
      <div className={`section-page ${isDarkMode ? 'dark' : ''}`}>
        <div className="section-container">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Cookies Policy</h1>
          <div className="section-content">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
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
            
            <h2>Types of Cookies We Use</h2>
            <h3>Essential Cookies</h3>
            <p>These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you make, such as setting your privacy preferences or filling in forms.</p>
            
            <h3>Performance Cookies</h3>
            <p>These cookies help us understand and analyze the key performance indexes of the website, such as page load times and error rates.</p>
            
            <h3>Functionality Cookies</h3>
            <p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we use.</p>
            
            <h3>Targeting Cookies</h3>
            <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements.</p>
            
            <h2>Managing Cookies</h2>
            <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your device and you can set most browsers to prevent them from being placed.</p>
            
            <h2>Changes to This Cookies Policy</h2>
            <p>We may update our Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CookiesPolicyPage;

