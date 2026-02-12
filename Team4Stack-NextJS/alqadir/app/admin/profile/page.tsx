'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProfile {
  id: number;
  email: string;
}

interface ContactSettings {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
}

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'contact'>('account');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Contact settings
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    whatsapp: '923001234567',
    phone: '+92 300 1234567',
    email: 'info@alqadir.com',
    address: 'Vehari, Pakistan'
  });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchContactSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProfile(data.admin);
        setEmail(data.admin.email);
      } else {
        setError('Failed to load profile');
      }
    } catch {
      setError('An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactSettings = async () => {
    try {
      const response = await fetch('/api/admin/contact-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setContactSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to load contact settings:', error);
    }
  };

  const handleSaveContactSettings = async () => {
    setSavingContact(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactSettings),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Contact settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update contact settings');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validate password if updating
    if (newPassword) {
      if (!currentPassword) {
        setError('Please enter current password to update password');
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match');
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setSaving(false);
        return;
      }
    }

    try {
      const updateData: { email?: string; password?: string; currentPassword?: string } = {};
      if (email !== profile?.email) {
        updateData.email = email;
      }
      if (newPassword) {
        updateData.password = newPassword;
        updateData.currentPassword = currentPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile updated successfully!');
        setProfile(data.admin);
        setEmail(data.admin.email);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#666' }}>Loading profile...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        input::placeholder {
          color: #999 !important;
          opacity: 1 !important;
        }
        input::-webkit-input-placeholder {
          color: #999 !important;
        }
        input::-moz-placeholder {
          color: #999 !important;
          opacity: 1 !important;
        }
        input:-ms-input-placeholder {
          color: #999 !important;
        }
      `}</style>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: 'calc(100vh - 90px)',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '700px',
        }}>
        {/* Page Title */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50', marginBottom: '8px' }}>
            Profile Settings
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Manage your admin account and contact information
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          backgroundColor: '#f8f9fa',
          padding: '6px',
          borderRadius: '12px',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'account' ? '#fff' : '#666',
              backgroundColor: activeTab === 'account' ? '#3498db' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Account Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'contact' ? '#fff' : '#666',
              backgroundColor: activeTab === 'contact' ? '#4CAF50' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Contact Information
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #c3e6cb',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #fecdd3',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Profile Form */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          padding: '32px',
        }}>
        
        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '10px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '15px',
                color: '#2c3e50',
                backgroundColor: '#fff',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3498db';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="admin@example.com"
            />
          </div>

          {/* Password Update Section */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #eee',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '12px',
            }}>
              Change Password
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '18px',
            }}>
              Leave blank if you don&apos;t want to change your password
            </p>

            {/* Current Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #eee',
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: saving ? '#95a5a6' : '#3498db',
                border: 'none',
                borderRadius: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: saving ? 'none' : '0 2px 8px rgba(52, 152, 219, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#2980b9';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#3498db';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Account Changes'}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#e74c3c',
                backgroundColor: 'transparent',
                border: '2px solid #e74c3c',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffebee';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </form>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '12px',
            }}>
              Contact Information
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '24px',
            }}>
              Update contact details that appear on the website (Footer, About Us page, WhatsApp button)
            </p>

            {/* WhatsApp Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                WhatsApp Number <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={contactSettings.whatsapp}
                onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })}
                placeholder="923001234567 (without + or spaces)"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                Format: 923001234567 (country code + number, no spaces or +)
              </p>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                Phone Number (Display)
              </label>
              <input
                type="text"
                value={contactSettings.phone}
                onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                placeholder="+92 300 1234567"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={contactSettings.email}
                onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                placeholder="info@alqadir.com"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px',
              }}>
                Address
              </label>
              <input
                type="text"
                value={contactSettings.address}
                onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                placeholder="Vehari, Pakistan"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '15px',
                  color: '#2c3e50',
                  backgroundColor: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Save Contact Settings Button */}
            <button
              type="button"
              onClick={handleSaveContactSettings}
              disabled={savingContact}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: savingContact ? '#95a5a6' : '#4CAF50',
                border: 'none',
                borderRadius: '10px',
                cursor: savingContact ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: savingContact ? 'none' : '0 2px 8px rgba(76, 175, 80, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!savingContact) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!savingContact) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {savingContact ? 'Saving...' : 'Save Contact Settings'}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
    </>
  );
}
