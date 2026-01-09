'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase/client';
import emailjs from '@emailjs/browser';



interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, refresh } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: 'public' as 'public' | 'private',
    browserNotifications: false,
    cookieConsent: true,
    analyticsOptIn: true
  });
  const [stackStoreSettings, setStackStoreSettings] = useState({
    enabled: true,
    autoRenewSubscriptions: false,
    purchaseHistoryVisible: true,
    downloadPreferences: 'auto' as 'auto' | 'manual',
    licenseManagement: 'automatic' as 'automatic' | 'manual',
    preferredPaymentMethod: 'card' as 'card' | 'paypal' | 'crypto'
  });
  const [websiteSettings, setWebsiteSettings] = useState({
    language: 'en' as 'en' | 'ur' | 'ar',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY' as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD',
    currency: 'USD' as 'USD' | 'PKR' | 'EUR',
    twoFactorAuth: false,
    sessionTimeout: 30 // minutes
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'stackstore' | 'website'>('profile');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteVerificationCode, setDeleteVerificationCode] = useState('');
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user settings from database
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user || !isOpen) return;

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('user_settings')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          // No sensitive info in logs
          return;
        }

        if (userData?.user_settings) {
          const savedSettings = userData.user_settings;

          // Load preferences
          if (savedSettings.preferences) {
            setSettings({
              emailNotifications: savedSettings.preferences.emailNotifications ?? true,
              profileVisibility: savedSettings.preferences.profileVisibility || 'public',
              browserNotifications: savedSettings.preferences.browserNotifications ?? false,
              cookieConsent: savedSettings.preferences.cookieConsent ?? true,
              analyticsOptIn: savedSettings.preferences.analyticsOptIn ?? true
            });
          }

          // Load stack store settings
          if (savedSettings.stackStore) {
            setStackStoreSettings({
              enabled: savedSettings.stackStore.enabled ?? true,
              autoRenewSubscriptions: savedSettings.stackStore.autoRenewSubscriptions ?? false,
              purchaseHistoryVisible: savedSettings.stackStore.purchaseHistoryVisible ?? true,
              downloadPreferences: savedSettings.stackStore.downloadPreferences || 'auto',
              licenseManagement: savedSettings.stackStore.licenseManagement || 'automatic',
              preferredPaymentMethod: savedSettings.stackStore.preferredPaymentMethod || 'card'
            });
          }

          // Load website settings
          if (savedSettings.website) {
            setWebsiteSettings({
              language: savedSettings.website.language || 'en',
              timezone: savedSettings.website.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              dateFormat: savedSettings.website.dateFormat || 'MM/DD/YYYY',
              currency: savedSettings.website.currency || 'USD',
              twoFactorAuth: savedSettings.website.twoFactorAuth ?? false,
              sessionTimeout: savedSettings.website.sessionTimeout || 30
            });
          }
        }
      } catch (error) {
        // No sensitive info in logs
      }
    };

    loadUserSettings();
  }, [user, isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || ''
      });
      // Only reset delete-related states if we're not in the middle of delete flow
      // Check if we're not currently verifying (to avoid resetting during delete process)
      if (!isVerifyingDelete && !deleteConfirm) {
      setMessage(null);
        setDeleteConfirm(false);
        setDeleteText('');
        setDeletePassword('');
        setDeleteVerificationCode('');
        setIsVerifyingDelete(false);
      }
    }
  }, [user, isOpen]);


  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Validate email format
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        setLoading(false);
        return;
      }

      // Check if email is already taken by another user
      if (formData.email && formData.email !== user.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email)
          .neq('id', user.id)
          .maybeSingle();

        if (existingUser) {
          setMessage({ type: 'error', text: 'Email already taken. Please use another email.' });
          setLoading(false);
          return;
        }
      }

      // Check if username is already taken by another user
      if (formData.username && formData.username !== user.username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', formData.username)
          .neq('id', user.id)
          .maybeSingle();

        if (existingUser) {
          setMessage({ type: 'error', text: 'Username already taken. Please choose another.' });
          setLoading(false);
          return;
        }
      }

      // Validate username format
      if (formData.username && !/^[a-z0-9_]+$/.test(formData.username.toLowerCase())) {
        setMessage({ type: 'error', text: 'Username can only contain lowercase letters, numbers, and underscores.' });
        setLoading(false);
        return;
      }

      const updateData: any = {};
      if (formData.name !== user.name) updateData.name = formData.name || null;
      if (formData.email !== user.email) updateData.email = formData.email || null;
      if (formData.username !== user.username) updateData.username = formData.username.toLowerCase() || null;

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save.' });
        setLoading(false);
        return;
      }

      // Update user profile - only saves the URL string, not the image
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        // If direct update fails, try using auth.uid() check
        // No sensitive info in logs
        setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please check your permissions.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Wait a bit for database to commit, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await refresh();
        // Update form data with fresh user data
        if (user) {
          const { data: freshProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (freshProfile) {
            setFormData({
              name: freshProfile.name || '',
              email: freshProfile.email || '',
              username: freshProfile.username || ''
            });
          }
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendDeleteVerificationEmail = async (otpCode: string, userEmail: string): Promise<boolean> => {
    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey || 
          serviceId === 'your_service_id' || 
          templateId === 'your_template_id' || 
          publicKey === 'your_public_key' ||
          serviceId.trim() === '' || 
          templateId.trim() === '' || 
          publicKey.trim() === '') {
        // No sensitive info in logs
        alert('EmailJS not configured. Please check your configuration.');
        return true;
      }

      // Initialize EmailJS with public key
      try {
        emailjs.init(publicKey.trim());
      } catch (initError) {
        // No sensitive info in logs
      }

      const templateParams: Record<string, string> = {
        'to_email': userEmail,
        'to_name': user?.name || userEmail.split('@')[0],
        'verification_code': otpCode,
        'code': otpCode,
        'otp': otpCode,
        'verification_code_6': otpCode,
        'user_email': userEmail,
        'user_name': user?.name || userEmail.split('@')[0],
        'email': userEmail,
        'name': user?.name || userEmail.split('@')[0],
        'from_name': 'Team4Stack',
        'subject': 'Team4Stack - Account Deletion Verification Code',
        'message': `Your account deletion verification code is: ${otpCode}. This code expires in 10 minutes.`
      };

      const response = await emailjs.send(serviceId.trim(), templateId.trim(), templateParams, publicKey.trim());
      
      if (response && response.status === 200) {
        return true;
      }
      
      return false;
    } catch (error: any) {
      // No sensitive info in logs
      return false;
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      // Clear previous errors
      setCurrentPasswordError(null);
      
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: passwordData.currentPassword
      });

      if (signInError) {
        setCurrentPasswordError('Current password is incorrect. Please try again.');
        setPasswordLoading(false);
        return;
      }

      // Current password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message || 'Failed to update password.' });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPasswordError(null);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save user settings to database
  const saveUserSettings = async (settingsType: 'preferences' | 'stackStore' | 'website') => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Get current user settings from database
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('user_settings')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // No sensitive info in logs
        setMessage({ type: 'error', text: 'Failed to load current settings.' });
        setLoading(false);
        return;
      }

      // Merge new settings with existing settings
      const currentSettings = userData?.user_settings || {};
      let updatedSettings = { ...currentSettings };

      if (settingsType === 'preferences') {
        updatedSettings.preferences = {
          emailNotifications: settings.emailNotifications,
          profileVisibility: settings.profileVisibility,
          browserNotifications: settings.browserNotifications,
          cookieConsent: settings.cookieConsent,
          analyticsOptIn: settings.analyticsOptIn
        };
      } else if (settingsType === 'stackStore') {
        updatedSettings.stackStore = {
          enabled: stackStoreSettings.enabled,
          autoRenewSubscriptions: stackStoreSettings.autoRenewSubscriptions,
          purchaseHistoryVisible: stackStoreSettings.purchaseHistoryVisible,
          downloadPreferences: stackStoreSettings.downloadPreferences,
          licenseManagement: stackStoreSettings.licenseManagement,
          preferredPaymentMethod: stackStoreSettings.preferredPaymentMethod
        };
      } else if (settingsType === 'website') {
        updatedSettings.website = {
          language: websiteSettings.language,
          timezone: websiteSettings.timezone,
          dateFormat: websiteSettings.dateFormat,
          currency: websiteSettings.currency,
          twoFactorAuth: websiteSettings.twoFactorAuth,
          sessionTimeout: websiteSettings.sessionTimeout
        };
      }

      // Update database
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_settings: updatedSettings })
        .eq('id', user.id);

      if (updateError) {
        // No sensitive info in logs
        setMessage({ type: 'error', text: updateError.message || 'Failed to save settings.' });
      } else {
        const typeNames = {
          preferences: 'Preferences',
          stackStore: 'Stack Store settings',
          website: 'Website settings'
        };
        setMessage({ type: 'success', text: `${typeNames[settingsType]} saved successfully!` });
      }
    } catch (error: any) {
      // No sensitive info in logs
      setMessage({ type: 'error', text: error.message || 'Failed to save settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Step 1: Check if user typed DELETE
    if (!isVerifyingDelete && deleteText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion.' });
      return;
    }

    // Step 2: If not verifying, check password and send verification code
    if (!isVerifyingDelete) {
      if (!deletePassword) {
        setMessage({ type: 'error', text: 'Please enter your password to confirm account deletion.' });
        return;
      }

      // Verify password
      setDeleteLoading(true);
      setMessage(null);

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email || '',
          password: deletePassword
        });

        if (signInError) {
          setMessage({ type: 'error', text: 'Incorrect password. Please try again.' });
          setDeleteLoading(false);
          return;
        }

        // Password is correct, generate and send verification code
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        try {
          await supabase
            .from('site_settings')
            .upsert({
              key: `delete_otp_${user.email?.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              value: JSON.stringify({
                code: otpCode,
                email: user.email?.toLowerCase(),
                expiresAt: expiresAt.toISOString(),
                userId: user.id
              })
            }, { onConflict: 'key' });
        } catch (e) {
          localStorage.setItem(`delete_otp_${user.email}`, JSON.stringify({
            code: otpCode,
            email: user.email?.toLowerCase(),
            expiresAt: expiresAt.toISOString(),
            userId: user.id
          }));
        }

        // Send verification email
        const emailSent = await sendDeleteVerificationEmail(otpCode, user.email || '');

        if (emailSent) {
          // Switch to verification screen immediately
          // Clear all fields first
          setDeleteText('');
          setDeletePassword('');
          setMessage(null);
          
          // IMPORTANT: Keep deleteConfirm as true AND set isVerifyingDelete to true
          // This ensures the conditional rendering shows the verification screen
          setDeleteConfirm(true); // Keep this true
          setIsVerifyingDelete(true); // Set this to true
        } else {
          // No sensitive info in logs
          setMessage({ type: 'error', text: 'Failed to send verification code. Please try again.' });
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to verify password.' });
      } finally {
        setDeleteLoading(false);
      }
      return;
    }

    // Step 3: Verify code and delete account
    if (isVerifyingDelete) {
      if (!deleteVerificationCode || deleteVerificationCode.length !== 6) {
        setMessage({ type: 'error', text: 'Please enter a valid 6-digit verification code.' });
        return;
      }

      setDeleteLoading(true);
      setMessage(null);

      try {
        // Retrieve OTP
        let otpData: any = null;
        const storageKey = `delete_otp_${user.email?.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        try {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', storageKey)
            .single();

          if (data?.value) {
            otpData = JSON.parse(data.value);
          }
        } catch (e) {
          const stored = localStorage.getItem(`delete_otp_${user.email}`);
          if (stored) {
            otpData = JSON.parse(stored);
          }
        }

        if (!otpData) {
          setMessage({ type: 'error', text: 'Verification code expired or invalid. Please start over.' });
          setDeleteLoading(false);
          return;
        }

        // Check if code matches
        if (otpData.code !== deleteVerificationCode) {
          setMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
          setDeleteLoading(false);
          return;
        }

        // Check if code expired
        const expiresAt = new Date(otpData.expiresAt);
        if (new Date() > expiresAt) {
          setMessage({ type: 'error', text: 'Verification code has expired. Please request a new one.' });
          setDeleteLoading(false);
          return;
        }

        // Verify email matches
        if (otpData.email?.toLowerCase() !== user.email?.toLowerCase()) {
          setMessage({ type: 'error', text: 'Email mismatch. Please start over.' });
          setDeleteLoading(false);
          return;
        }

        // All checks passed, save deleted account data first
        // Get full user data before deletion
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // Get auth user data for creation timestamp
        const { data: authUser } = await supabase.auth.getUser();
        const createdAt = authUser?.user?.created_at || new Date().toISOString();
        const deletedAt = new Date().toISOString();

        // Save deleted account data to deleted_accounts table
        if (userData) {
          const deletedAccountData = {
            original_user_id: user.id,
            email: user.email?.toLowerCase() || '',
            name: userData.name || user.name || '',
            username: userData.username || user.username || '',
            original_data: JSON.stringify(userData), // Save all original data as JSON
            account_created_at: createdAt,
            account_deleted_at: deletedAt,
            deleted_by: 'user', // 'user' or 'admin'
            reason: 'User requested account deletion'
          };

          // Try to insert into deleted_accounts table
          const { error: saveError } = await supabase
            .from('deleted_accounts')
            .insert(deletedAccountData);

          if (saveError) {
            // No sensitive info in logs
            // Continue with deletion even if save fails
          }
        }

        // Delete user profile from users table
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (deleteError) {
          setMessage({ type: 'error', text: deleteError.message || 'Failed to delete account.' });
          setDeleteLoading(false);
          return;
        }

        // Clean up OTP
        try {
          await supabase.from('site_settings').delete().eq('key', storageKey);
        } catch {}
        localStorage.removeItem(`delete_otp_${user.email}`);

        // Sign out user
        await supabase.auth.signOut();
        
        setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
        setDeleteLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
        onWheel={(e) => {
          // Prevent scroll propagation to body
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Prevent touch scroll propagation
          e.stopPropagation();
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => {
            // Stop wheel event from propagating to body
            e.stopPropagation();
            const target = e.currentTarget;
            const { scrollTop, scrollHeight, clientHeight } = target;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            
            // Prevent scroll if at boundaries
            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              e.preventDefault();
            }
          }}
          onTouchStart={(e) => {
            // Prevent touch events from propagating
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Allow touch scroll within modal
            e.stopPropagation();
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 pr-10">Settings</h2>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[60px] ${
                activeTab === 'profile'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[70px] ${
                activeTab === 'security'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[85px] ${
                activeTab === 'preferences'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Preferences
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stackstore')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[90px] ${
                activeTab === 'stackstore'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Stack Store
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('website')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[70px] ${
                activeTab === 'website'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Website
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can change your email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="username"
                pattern="[a-z0-9_]+"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only lowercase letters, numbers, and underscores allowed
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-3 sm:pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base font-medium"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 sm:py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-300 dark:active:bg-gray-600 transition-colors touch-manipulation text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {message && message.type === 'success' && (
                    <div className="p-3 rounded-md text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                      {message.text}
                    </div>
                  )}
                  {message && message.type === 'error' && (
                    <div className="p-3 rounded-md text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                      {message.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
              </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className={`w-full px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation ${
                          currentPasswordError 
                            ? 'border-red-500 dark:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value });
                          // Clear error when user starts typing
                          if (currentPasswordError) {
                            setCurrentPasswordError(null);
                          }
                        }}
                        placeholder="Enter current password"
                      />
                  <button
                    type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {currentPasswordError && (
                      <p className="mt-1 text-sm text-red-500">{currentPasswordError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="w-full px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min 6 characters)"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation ${
                          passwordData.confirmPassword && passwordData.newPassword && passwordData.confirmPassword !== passwordData.newPassword
                            ? 'border-red-500 dark:border-red-500'
                            : passwordData.confirmPassword && passwordData.newPassword && passwordData.confirmPassword === passwordData.newPassword
                            ? 'border-green-500 dark:border-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                      <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword && passwordData.confirmPassword === passwordData.newPassword && (
                      <p className="mt-1 text-sm text-green-500">Passwords match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base font-medium"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Account Deletion */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                {!deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirm(true);
                      setIsVerifyingDelete(false);
                      setDeleteText('');
                      setDeletePassword('');
                      setDeleteVerificationCode('');
                      setMessage(null);
                    }}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                ) : !isVerifyingDelete ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm:
                    </p>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-red-300 dark:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Enter Your Password
                      </label>
                      <div className="relative">
                        <input
                          type={showDeletePassword ? "text" : "password"}
                          className="w-full px-3 py-2 pr-10 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-red-300 dark:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                          aria-label={showDeletePassword ? "Hide password" : "Show password"}
                        >
                          {showDeletePassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                    )}
                  </button>
              </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || deleteText !== 'DELETE' || !deletePassword}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading ? 'Sending Code...' : 'Continue'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirm(false);
                          setDeleteText('');
                          setDeletePassword('');
                          setDeleteVerificationCode('');
                          setIsVerifyingDelete(false);
                          setMessage(null);
                        }}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Verification Code Screen - This shows when isVerifyingDelete is true
                  <div className="space-y-4" key="verification-screen">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          Verification Code Sent!
                        </p>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Check your email at <span className="font-bold">{user?.email}</span> and enter the 6-digit code below
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                      <label className="block text-base font-bold text-gray-800 dark:text-gray-200 mb-3 text-center">
                        Enter Verification Code
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-red-400 dark:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 focus:border-red-500 text-center text-4xl tracking-[0.3em] font-mono font-bold shadow-lg"
                        value={deleteVerificationCode}
                        onChange={(e) => setDeleteVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                      />
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                        ⏱️ Code expires in 10 minutes
                      </p>
                      {message && message.type === 'error' && (
                        <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-600 dark:text-red-400 text-center">{message.text}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || deleteVerificationCode.length !== 6}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVerifyingDelete(false);
                          setDeleteVerificationCode('');
                          setMessage(null);
                        }}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Back
                      </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Receive email updates about your account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Profile Visibility */}
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Profile Visibility</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Control who can see your profile information
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={settings.profileVisibility === 'public'}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value as 'public' | 'private' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public - Anyone can view your profile</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={settings.profileVisibility === 'private'}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value as 'public' | 'private' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Private - Only you can view your profile</span>
                  </label>
                </div>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Browser Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Receive browser push notifications
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.browserNotifications && 'Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          setSettings({ ...settings, browserNotifications: true });
                        }
                      });
                    } else {
                      setSettings({ ...settings, browserNotifications: !settings.browserNotifications });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.browserNotifications ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Cookie Consent */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Cookie Consent</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Allow cookies for better experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, cookieConsent: !settings.cookieConsent })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.cookieConsent ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.cookieConsent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Analytics Opt-in */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Help us improve by sharing usage data
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, analyticsOptIn: !settings.analyticsOptIn })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    settings.analyticsOptIn ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.analyticsOptIn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => saveUserSettings('preferences')}
                disabled={loading}
                className="w-full px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors touch-manipulation text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
              </div>
            )}

          {/* Stack Store Tab */}
          {activeTab === 'stackstore' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Stack Store</span> is coming soon! Configure your preferences now.
                </p>
              </div>

              {/* Stack Store Access */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable Stack Store</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Access to Stack Store marketplace
                  </p>
                </div>
              <button
                  type="button"
                  onClick={() => setStackStoreSettings({ ...stackStoreSettings, enabled: !stackStoreSettings.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    stackStoreSettings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      stackStoreSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-renew Subscriptions */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto-renew Subscriptions</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Automatically renew active subscriptions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStackStoreSettings({ ...stackStoreSettings, autoRenewSubscriptions: !stackStoreSettings.autoRenewSubscriptions })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    stackStoreSettings.autoRenewSubscriptions ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      stackStoreSettings.autoRenewSubscriptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Purchase History Visibility */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Public Purchase History</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Show your purchases on your profile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStackStoreSettings({ ...stackStoreSettings, purchaseHistoryVisible: !stackStoreSettings.purchaseHistoryVisible })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    stackStoreSettings.purchaseHistoryVisible ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      stackStoreSettings.purchaseHistoryVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Download Preferences */}
              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Download Preferences</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  How should downloads be handled?
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="download"
                      value="auto"
                      checked={stackStoreSettings.downloadPreferences === 'auto'}
                      onChange={(e) => setStackStoreSettings({ ...stackStoreSettings, downloadPreferences: e.target.value as 'auto' | 'manual' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-download after purchase</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="download"
                      value="manual"
                      checked={stackStoreSettings.downloadPreferences === 'manual'}
                      onChange={(e) => setStackStoreSettings({ ...stackStoreSettings, downloadPreferences: e.target.value as 'auto' | 'manual' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manual download (ask each time)</span>
                  </label>
                </div>
              </div>

              {/* License Management */}
              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">License Management</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  How should licenses be managed?
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="license"
                      value="automatic"
                      checked={stackStoreSettings.licenseManagement === 'automatic'}
                      onChange={(e) => setStackStoreSettings({ ...stackStoreSettings, licenseManagement: e.target.value as 'automatic' | 'manual' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Automatic activation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="license"
                      value="manual"
                      checked={stackStoreSettings.licenseManagement === 'manual'}
                      onChange={(e) => setStackStoreSettings({ ...stackStoreSettings, licenseManagement: e.target.value as 'automatic' | 'manual' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manual activation (use license keys)</span>
                  </label>
                </div>
              </div>

              {/* Preferred Payment Method */}
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preferred Payment Method</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Default payment method for purchases
                </p>
                <select
                  value={stackStoreSettings.preferredPaymentMethod}
                  onChange={(e) => setStackStoreSettings({ ...stackStoreSettings, preferredPaymentMethod: e.target.value as 'card' | 'paypal' | 'crypto' })}
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => saveUserSettings('stackStore')}
                disabled={loading}
                className="w-full px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors touch-manipulation text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Stack Store Settings'}
              </button>
            </div>
          )}

          {/* Website Tab */}
          {activeTab === 'website' && (
            <div className="space-y-6">
              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={websiteSettings.language}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, language: e.target.value as 'en' | 'ur' | 'ar' })}
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="en">English</option>
                  <option value="ur">اردو (Urdu)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={websiteSettings.timezone}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="MM/DD/YYYY"
                      checked={websiteSettings.dateFormat === 'MM/DD/YYYY'}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">MM/DD/YYYY (US Format)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="DD/MM/YYYY"
                      checked={websiteSettings.dateFormat === 'DD/MM/YYYY'}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">DD/MM/YYYY (European Format)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFormat"
                      value="YYYY-MM-DD"
                      checked={websiteSettings.dateFormat === 'YYYY-MM-DD'}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, dateFormat: e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">YYYY-MM-DD (ISO Format)</span>
                  </label>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={websiteSettings.currency}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, currency: e.target.value as 'USD' | 'PKR' | 'EUR' })}
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
              <button
                type="button"
                  onClick={() => setWebsiteSettings({ ...websiteSettings, twoFactorAuth: !websiteSettings.twoFactorAuth })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    websiteSettings.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
              </button>
            </div>

              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={websiteSettings.sessionTimeout}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically log out after inactivity (5-120 minutes)
                </p>
              </div>

              {/* Data Export */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Data Management</h3>
                  <button
                    type="button"
                    onClick={async () => {
                      // Export user data as JSON
                      const userData = {
                        profile: user,
                        settings: settings,
                        stackStoreSettings: stackStoreSettings,
                        websiteSettings: websiteSettings,
                        exportDate: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `user-data-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setMessage({ type: 'success', text: 'Data exported successfully!' });
                    }}
                    className="w-full px-4 py-3 sm:py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-300 dark:active:bg-gray-600 transition-colors touch-manipulation text-sm sm:text-base font-medium"
                  >
                    Export My Data
                  </button>
              </div>

              <button
                type="button"
                onClick={() => saveUserSettings('website')}
                disabled={loading}
                className="w-full px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors touch-manipulation text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Website Settings'}
              </button>
            </div>
          )}

          {/* Global Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSettingsModal;

