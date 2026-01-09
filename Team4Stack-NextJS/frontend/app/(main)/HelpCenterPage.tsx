'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import MainLayout from '@/app/(main)/layout';
import './SectionPage.css';

const HelpCenterPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className={`section-page ${isDarkMode ? 'dark' : ''}`}>
        <div className="section-container">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>Help Center</h1>
          <div className="section-content">
            <p>Find answers to common questions and get help with using Team4Stack services.</p>
            
            <h2>Getting Started</h2>
            <div className="help-category">
              <h3>Account Setup</h3>
              <ul>
                <li><a href="#" className="help-link">Creating your account</a></li>
                <li><a href="#" className="help-link">Verifying your email</a></li>
                <li><a href="#" className="help-link">Setting up your profile</a></li>
              </ul>
            </div>
            
            <div className="help-category">
              <h3>Basic Features</h3>
              <ul>
                <li><a href="#" className="help-link">Navigating the dashboard</a></li>
                <li><a href="#" className="help-link">Managing your projects</a></li>
                <li><a href="#" className="help-link">Collaborating with team members</a></li>
              </ul>
            </div>
            
            <h2>Popular Topics</h2>
            <div className="help-category">
              <h3>Billing & Payments</h3>
              <ul>
                <li><a href="#" className="help-link">Updating payment methods</a></li>
                <li><a href="#" className="help-link">Understanding your invoice</a></li>
                <li><a href="#" className="help-link">Canceling your subscription</a></li>
              </ul>
            </div>
            
            <div className="help-category">
              <h3>Troubleshooting</h3>
              <ul>
                <li><a href="#" className="help-link">Login issues</a></li>
                <li><a href="#" className="help-link">Performance problems</a></li>
                <li><a href="#" className="help-link">Error messages</a></li>
              </ul>
            </div>
            
            <h2>Contact Our Team</h2>
            <p>Can't find what you're looking for? Send us a message and our support team will get back to you.</p>
            
            {isSubmitted ? (
              <div className="success-message">
                <p>Thank you! Your message has been sent successfully. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            )}
          </div>
        </div>
    </div>
  );
};

export default HelpCenterPage;

