'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import MainLayout from '@/app/(main)/layout';
import './SectionPage.css';

const ContactSupportPage: React.FC = () => {
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
          <h1>Contact Support</h1>
          <div className="section-content">
            <p>Our support team is here to help you with any questions or issues you may have.</p>
            
            <h2>Support Channels</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Email Support</h3>
                <p><strong>General Inquiries:</strong> info@team4stack.com</p>
                <p><strong>Technical Support:</strong> support@team4stack.com</p>
                <p><strong>Billing Questions:</strong> billing@team4stack.com</p>
                <p>Response time: Within 24 hours</p>
              </div>
              
              <div className="contact-item">
                <h3>Phone Support</h3>
                <p><strong>Customer Service:</strong> +1 (555) 123-4567</p>
                <p><strong>Technical Support:</strong> +1 (555) 123-4568</p>
                <p>Hours: Monday-Friday, 9AM-6PM EST</p>
              </div>
              
              <div className="contact-item">
                <h3>Live Chat</h3>
                <p>Available directly on our website during business hours</p>
                <p>Hours: Monday-Friday, 9AM-6PM EST</p>
              </div>
            </div>
            
            <h2>Support Hours</h2>
            <ul>
              <li>Monday-Friday: 9:00 AM - 6:00 PM EST</li>
              <li>Saturday: 10:00 AM - 4:00 PM EST</li>
              <li>Sunday: Closed</li>
              <li>Holidays: Closed</li>
            </ul>
            
            <h2>Frequently Asked Questions</h2>
            <p>Before contacting support, you might find answers to your questions in our <Link href="/help">Help Center</Link>.</p>
            
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and our support team will get back to you as soon as possible.</p>
            
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
            
            <h2>Feedback</h2>
            <p>We value your feedback and suggestions. Please send them to feedback@team4stack.com</p>
          </div>
        </div>
    </div>
  );
};

export default ContactSupportPage;

