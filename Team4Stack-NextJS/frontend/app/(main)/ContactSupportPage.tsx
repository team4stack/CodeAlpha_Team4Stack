'use client'

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { landingApi } from '@/lib/api';
import './SectionPage.css';

type CloudinaryUploadResponse = {
  secure_url?: string;
};

const ContactSupportPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    relatedTo: 'site',
    reason: 'technical_issue',
    name: '',
    email: '',
    subject: '',
    message: '',
    screenshotUrl: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const screenshotPreview = useMemo(() => formData.screenshotUrl, [formData.screenshotUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      reason: e.target.value
    }));
  };

  const handleRelatedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      relatedTo: e.target.value === 'course' ? 'course' : 'site'
    }));
  };

  const toDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Failed to read selected screenshot'));
      reader.readAsDataURL(file);
    });

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed for screenshot upload.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Screenshot must be 2MB or smaller.');
      e.target.value = '';
      return;
    }

    setError('');
    setUploadingScreenshot(true);
    try {
      const fileDataUrl = await toDataUrl(file);
      if (!fileDataUrl) throw new Error('Failed to prepare screenshot');

      const uploadResult = await landingApi.uploadSupportScreenshot(fileDataUrl);
      const uploadData =
        uploadResult.data && typeof uploadResult.data === 'object'
          ? (uploadResult.data as CloudinaryUploadResponse)
          : null;

      const uploadedUrl = uploadData?.secure_url;
      if (!uploadResult.success || !uploadedUrl) {
        throw new Error(uploadResult.error || 'Could not upload screenshot');
      }

      setFormData((prevState) => ({
        ...prevState,
        screenshotUrl: uploadedUrl
      }));
    } catch (uploadError: unknown) {
      const message = uploadError instanceof Error ? uploadError.message : 'Screenshot upload failed';
      setError(message);
      setFormData((prevState) => ({ ...prevState, screenshotUrl: '' }));
    } finally {
      setUploadingScreenshot(false);
      e.target.value = '';
    }
  };

  const handleRemoveScreenshot = () => {
    setFormData((prevState) => ({ ...prevState, screenshotUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const trimmedEmail = formData.email.trim();
      const trimmedSubject = formData.subject.trim();
      const trimmedMessage = formData.message.trim();

      const result = await landingApi.createSupportRequest({
        target_area: formData.relatedTo,
        reason: formData.reason,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
        screenshot_url: formData.screenshotUrl || null
      });

      if (!result.success) {
        throw new Error(result.error || 'Could not send your message');
      }

      setIsSubmitted(true);
      setFormData({
        relatedTo: 'site',
        reason: 'technical_issue',
        name: '',
        email: '',
        subject: '',
        message: '',
        screenshotUrl: ''
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to send your request';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`section-page ${isDarkMode ? 'dark' : ''}`}>
        <div className="section-container">
          <Link href="/" className="back-link">← Back to Home</Link>
          <h1>Contact Support</h1>
          <div className="section-content">
            <p>Need help from our team? Share your issue with clear details and we will follow up quickly.</p>
            
            <h2>Before You Submit</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Include exact details</h3>
                <p>Add the exact page/feature and what happened.</p>
              </div>
              <div className="contact-item">
                <h3>Add expected result</h3>
                <p>Tell us what you expected to happen and what happened instead.</p>
              </div>
              <div className="contact-item">
                <h3>Optional screenshot</h3>
                <p>Attach an image if needed. It is securely uploaded to Cloudinary.</p>
              </div>
            </div>
            
            <h2>Contact Our Team</h2>
            <p>If you can, first check the <Link href="/help">Help Center</Link>. If the issue remains, send this form.</p>
            <p>
              You can also follow our official WhatsApp channel for updates:{' '}
              <a
                href="https://whatsapp.com/channel/0029VbCMGxCG3R3iZT4d0W2X"
                target="_blank"
                rel="noopener noreferrer"
                className="help-link"
              >
                Team4Stack WhatsApp Channel
              </a>
              .
            </p>
            
            {isSubmitted ? (
              <div className="success-message">
                <p>Thank you! Your message has been sent successfully. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label htmlFor="relatedTo">Related To</label>
                    <select
                      id="relatedTo"
                      name="relatedTo"
                      value={formData.relatedTo}
                      onChange={handleRelatedToChange}
                      required
                    >
                      <option value="site">Normal Site</option>
                      <option value="course">Course</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Issue Type</label>
                    <select id="reason" name="reason" value={formData.reason} onChange={handleReasonChange} required>
                      <option value="technical_issue">Technical Issue</option>
                      <option value="account_access">Account Access</option>
                      <option value="billing_question">Billing Question</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="general_inquiry">General Inquiry</option>
                    </select>
                  </div>

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

                  <div className="form-group contact-form-span-2">
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

                  <div className="form-group contact-form-span-2">
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

                  <div className="form-group contact-form-span-2">
                    <label htmlFor="screenshot">Screenshot (Optional)</label>
                    <input
                      type="file"
                      id="screenshot"
                      name="screenshot"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      disabled={uploadingScreenshot || submitting}
                    />
                    <p className="field-help-text">PNG/JPG/WebP up to 2MB.</p>
                    {uploadingScreenshot ? (
                      <p className="field-help-text">Uploading screenshot...</p>
                    ) : null}
                    {screenshotPreview ? (
                      <div className="support-screenshot-preview">
                        <img src={screenshotPreview} alt="Uploaded screenshot preview" />
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="remove-screenshot-btn"
                          disabled={submitting}
                        >
                          Remove screenshot
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {error ? <p className="form-error-message">{error}</p> : null}
                <button type="submit" className="submit-btn" disabled={submitting || uploadingScreenshot}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
    </div>
  );
};

export default ContactSupportPage;

