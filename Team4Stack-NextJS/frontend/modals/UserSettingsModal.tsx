'use client'

import React, { useRef, useState, useEffect } from 'react';
import type { Area } from 'react-easy-crop';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { persistClientAuthSessionFromSignInData } from '@/lib/auth/persistClientAuthSession';
import { usersApi, landingApi, coursesApi } from '@/lib/api';
import emailjs from '@emailjs/browser';
import ProfileImageCropDialog from './user-settings/ProfileImageCropDialog';
import { getCroppedImageBlob } from './user-settings/imageCropUtils';



interface UserSettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  asPage?: boolean;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, asPage = false }) => {
  const { user, refresh, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isVisible = asPage || isOpen;
  const handleClose = () => {
    onClose?.();
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [usernameValidation, setUsernameValidation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null);
  const [cropApplying, setCropApplying] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
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
    emailNotifications: true
  });
  const [courseSettings, setCourseSettings] = useState({
    emailReminders: true,
    quizAndCertificateEmails: true,
    admissionStatusEmails: true,
    progressOnProfile: false,
    defaultCoursesView: 'catalog' as 'catalog' | 'my',
    autoplayNextLesson: false,
    showCompletedLessons: true,
    compactCourseList: false
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'courses'>('profile');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteVerificationCode, setDeleteVerificationCode] = useState('');
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const normalizedUsername = formData.username.trim().toLowerCase();
  const passwordHasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
  const passwordHasNumber = /\d/.test(passwordData.newPassword);
  const passwordHasSpecial = /[^a-zA-Z0-9]/.test(passwordData.newPassword);
  const passwordStrong = passwordData.newPassword.length >= 8 && passwordHasLetter && passwordHasNumber && passwordHasSpecial;

  // Load user settings from database
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user || !isVisible) return;

      try {
        const result = await usersApi.getUserById(user.id);
        
        if (result.error || !result.data) {
          return;
        }

        const userData = result.data as any;
        if (userData?.user_settings) {
          const savedSettings = userData.user_settings;

          // Load preferences
          if (savedSettings.preferences) {
            setSettings({
              emailNotifications: savedSettings.preferences.emailNotifications ?? true
            });
          }

          if (savedSettings.courses) {
            const c = savedSettings.courses
            setCourseSettings({
              emailReminders: c.emailReminders ?? true,
              quizAndCertificateEmails: c.quizAndCertificateEmails ?? true,
              admissionStatusEmails: c.admissionStatusEmails ?? true,
              progressOnProfile: c.progressOnProfile ?? false,
              defaultCoursesView: c.defaultCoursesView === 'my' ? 'my' : 'catalog',
              autoplayNextLesson: c.autoplayNextLesson ?? false,
              showCompletedLessons: c.showCompletedLessons ?? true,
              compactCourseList: c.compactCourseList ?? false
            });
          }
        }
      } catch (error) {
        // No sensitive info in logs
      }
    };

    loadUserSettings();
  }, [user, isVisible]);

  useEffect(() => {
    if (!isVisible || !user) return;

    if (!normalizedUsername) {
      setUsernameValidation({ status: 'idle', message: '' });
      return;
    }

    if (!/^[a-z0-9]+$/.test(normalizedUsername)) {
      setUsernameValidation({
        status: 'invalid',
        message: 'Only lowercase letters and numbers are allowed (no special characters).'
      });
      return;
    }

    if (!/[a-z]/.test(normalizedUsername) || !/[0-9]/.test(normalizedUsername)) {
      setUsernameValidation({
        status: 'invalid',
        message: 'Username must include at least one letter and one number.'
      });
      return;
    }

    if ((user.username || '').toLowerCase() === normalizedUsername) {
      setUsernameValidation({
        status: 'valid',
        message: 'Current username is valid.'
      });
      return;
    }

    setUsernameValidation({ status: 'checking', message: 'Checking availability...' });
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await usersApi.checkUsernameAvailability(normalizedUsername);
        const resultData = result.data as { available?: boolean } | undefined;
        if (cancelled) return;

        if (result.error) {
          setUsernameValidation({ status: 'invalid', message: 'Unable to verify username right now.' });
          return;
        }

        if (resultData?.available === true) {
          setUsernameValidation({ status: 'valid', message: 'Username is available.' });
          return;
        }

        setUsernameValidation({ status: 'invalid', message: 'Username is already taken.' });
      } catch {
        if (!cancelled) {
          setUsernameValidation({ status: 'invalid', message: 'Unable to verify username right now.' });
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isVisible, normalizedUsername, user]);

  useEffect(() => {
    if (user && isVisible) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || ''
      });
      setProfileImagePreview(user.avatar_url || '');
      setProfileImageFile(null);
      setCropImageSrc('');
      setIsCropDialogOpen(false);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setCropAreaPixels(null);
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
  }, [user, isVisible]);


  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible && !asPage) {
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
  }, [isVisible, asPage]);

  const uploadProfileImageToCloudinary = async (file: File): Promise<string> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Invalid image data'));
      };
      reader.onerror = () => reject(new Error('Unable to read selected image'));
      reader.readAsDataURL(file);
    });

    const uploadResult = await coursesApi.uploadImageToCloudinary(dataUrl, 'team4stack/profile-avatars');
    const uploadData = uploadResult.data as { secure_url?: string } | undefined;
    if (uploadResult.error || !uploadData?.secure_url) {
      throw new Error(uploadResult.error || 'Failed to upload profile image.');
    }

    return uploadData.secure_url;
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setMessage({ type: 'error', text: 'Please choose a valid image file.' });
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Image size should be less than 3MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setMessage({ type: 'error', text: 'Unable to open image for cropping.' });
        return;
      }
      setCropImageSrc(reader.result);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setCropAreaPixels(null);
      setIsCropDialogOpen(true);
      setMessage(null);
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Unable to read selected image.' });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCroppedImage = async () => {
    if (!cropImageSrc || !cropAreaPixels) return;
    setCropApplying(true);
    try {
      const croppedBlob = await getCroppedImageBlob(cropImageSrc, cropAreaPixels);
      const croppedFile = new File([croppedBlob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const localPreviewUrl = URL.createObjectURL(croppedBlob);
      setProfileImageFile(croppedFile);
      setProfileImagePreview(localPreviewUrl);
      setIsCropDialogOpen(false);
      setCropImageSrc('');
      if (profileImageInputRef.current) profileImageInputRef.current.value = '';
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to crop image.' });
    } finally {
      setCropApplying(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropDialogOpen(false);
    setCropImageSrc('');
    setCropAreaPixels(null);
    setCropZoom(1);
    setCropPosition({ x: 0, y: 0 });
    if (profileImageInputRef.current) profileImageInputRef.current.value = '';
  };

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
        const emailCheck = await usersApi.getUserByEmail(formData.email);
        if (emailCheck.success && emailCheck.data && (emailCheck.data as any).id !== user.id) {
          setMessage({ type: 'error', text: 'Email already taken. Please use another email.' });
          setLoading(false);
          return;
        }
      }

      // Check if username is already taken by another user
      if (formData.username && formData.username !== user.username) {
        const usernameCheck = await usersApi.getUserByUsername(formData.username);
        if (usernameCheck.success && usernameCheck.data && (usernameCheck.data as any).id !== user.id) {
          setMessage({ type: 'error', text: 'Username already taken. Please choose another.' });
          setLoading(false);
          return;
        }
      }

      // Validate username format
      if (formData.username && !/^[a-z0-9]+$/.test(formData.username.toLowerCase())) {
        setMessage({ type: 'error', text: 'Username can only contain lowercase letters and numbers.' });
        setLoading(false);
        return;
      }

      if (formData.username && (!/[a-z]/.test(formData.username) || !/[0-9]/.test(formData.username))) {
        setMessage({ type: 'error', text: 'Username must include at least one letter and one number.' });
        setLoading(false);
        return;
      }

      if (formData.username && usernameValidation.status !== 'valid') {
        setMessage({ type: 'error', text: 'Please choose a valid and unique username.' });
        setLoading(false);
        return;
      }

      const updateData: any = {};
      if (formData.name !== user.name) updateData.name = formData.name || null;
      if (formData.email !== user.email) updateData.email = formData.email || null;
      if (formData.username !== user.username) updateData.username = formData.username.toLowerCase() || null;
      if (profileImageFile) {
        setImageUploading(true);
        try {
          const avatarUrl = await uploadProfileImageToCloudinary(profileImageFile);
          if (avatarUrl && avatarUrl !== user.avatar_url) {
            updateData.avatar_url = avatarUrl;
          }
        } finally {
          setImageUploading(false);
        }
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save.' });
        setLoading(false);
        return;
      }

      // Update user profile via API
      const updateResult = await usersApi.updateUser(user.id, updateData);

      if (updateResult.error) {
        setMessage({ type: 'error', text: updateResult.error || 'Failed to update profile. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Wait a bit for database to commit, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await refresh();
        // Update form data with fresh user data
        if (user) {
          const freshResult = await usersApi.getUserById(user.id);
          if (freshResult.success && freshResult.data) {
            const freshProfile = freshResult.data as any;
            setFormData({
              name: freshProfile.name || '',
              email: freshProfile.email || '',
              username: freshProfile.username || ''
            });
            setProfileImagePreview(freshProfile.avatar_url || '');
            setProfileImageFile(null);
          }
        }
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setImageUploading(false);
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

      if (!passwordStrong) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters and include letters, numbers, and special characters.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      setCurrentPasswordError(null);

      const { authApi } = await import('@/lib/api');
      const verify = await authApi.signIn(
        (user.email || '').toLowerCase().trim(),
        passwordData.currentPassword
      );

      if (!verify.success || verify.error) {
        setCurrentPasswordError('Current password is incorrect. Please try again.');
        setPasswordLoading(false);
        return;
      }

      const session = (verify.data as any)?.session;
      if (!session?.access_token || !session?.refresh_token) {
        setMessage({ type: 'error', text: 'Could not verify session. Please try again.' });
        setPasswordLoading(false);
        return;
      }

      const updated = await authApi.updatePassword(
        passwordData.newPassword,
        session.access_token,
        session.refresh_token
      );

      if (!updated.success || updated.error) {
        setMessage({
          type: 'error',
          text: updated.error || 'Failed to update password.',
        });
        setPasswordLoading(false);
        return;
      }

      const fresh = await authApi.signIn(
        (user.email || '').toLowerCase().trim(),
        passwordData.newPassword
      );
      if (!fresh.success || !fresh.data) {
        setMessage({
          type: 'success',
          text: 'Password updated. Please sign in again with your new password.',
        });
        setPasswordLoading(false);
        return;
      }

      const stored = persistClientAuthSessionFromSignInData(fresh.data as any);
      if (!stored.ok) {
        setMessage({ type: 'error', text: stored.error || 'Failed to save new session.' });
        setPasswordLoading(false);
        return;
      }

      window.dispatchEvent(new Event('auth_session_updated'));
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPasswordError(null);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      await refresh();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save user settings to database
  const saveUserSettings = async (settingsType: 'preferences' | 'courses') => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Get current user settings from database via API
      const result = await usersApi.getUserById(user.id);
      
      if (result.error || !result.data) {
        setMessage({ type: 'error', text: 'Failed to load current settings.' });
        setLoading(false);
        return;
      }

      const userData = result.data as any;
      // Merge new settings with existing settings
      const currentSettings = userData?.user_settings || {};
      let updatedSettings = { ...currentSettings };

      if (settingsType === 'preferences') {
        updatedSettings.preferences = {
          emailNotifications: settings.emailNotifications
        };
      } else if (settingsType === 'courses') {
        updatedSettings.courses = {
          emailReminders: courseSettings.emailReminders,
          quizAndCertificateEmails: courseSettings.quizAndCertificateEmails,
          admissionStatusEmails: courseSettings.admissionStatusEmails,
          progressOnProfile: courseSettings.progressOnProfile,
          defaultCoursesView: courseSettings.defaultCoursesView,
          autoplayNextLesson: courseSettings.autoplayNextLesson,
          showCompletedLessons: courseSettings.showCompletedLessons,
          compactCourseList: courseSettings.compactCourseList
        };
      }

      // Update database via API
      const updateResult = await usersApi.updateUser(user.id, { user_settings: updatedSettings });

      if (updateResult.error) {
        setMessage({ type: 'error', text: updateResult.error || 'Failed to save settings.' });
      } else {
        const typeNames = {
          preferences: 'Preferences',
          courses: 'Courses settings'
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
        const { authApi } = await import('@/lib/api');
        const pwdCheck = await authApi.signIn(
          (user.email || '').toLowerCase().trim(),
          deletePassword
        );
        if (!pwdCheck.success || pwdCheck.error) {
          setMessage({ type: 'error', text: 'Incorrect password. Please try again.' });
          setDeleteLoading(false);
          return;
        }

        // Password is correct, generate and send verification code
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        const otpKey = `delete_otp_${user.email?.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        try {
          const { landingApi } = await import('@/lib/api');
          await landingApi.upsertSiteSetting(
            otpKey,
            JSON.stringify({
              code: otpCode,
              email: user.email?.toLowerCase(),
              expiresAt: expiresAt.toISOString(),
              userId: user.id,
            })
          );
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
          const { landingApi } = await import('@/lib/api');
          const res = await landingApi.getSiteSettings([storageKey]);
          const rows = (res.data as any[]) || [];
          const row = rows.find((r: any) => r.key === storageKey);
          if (row?.value) {
            otpData = JSON.parse(row.value);
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
        // Get full user data before deletion via API
        const userResult = await usersApi.getUserById(user.id);
        const userData = userResult.success ? (userResult.data as any) : null;

        const createdAt =
          (userData && (userData as any).created_at) || new Date().toISOString();
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

          // Try to insert into deleted_accounts table via API (if endpoint exists)
          // Note: This might need a new API endpoint for deleted_accounts
          // For now, we'll skip this and let backend handle it if needed
          // TODO: Create API endpoint for deleted_accounts if needed
        }

        // Delete user profile via API (using superadmin endpoint if available)
        // Note: User self-deletion might need a separate endpoint
        // For now, we'll use the superadmin endpoint
        const deleteResult = await usersApi.updateUser(user.id, { is_deleted: true });
        
        // If update doesn't work, we might need a delete endpoint
        // For now, sign out the user
        if (deleteResult.error) {
          setMessage({ type: 'error', text: deleteResult.error || 'Failed to delete account. Please contact support.' });
          setDeleteLoading(false);
          return;
        }

        // Clean up OTP via API
        try {
          await landingApi.deleteSiteSettings([storageKey]);
        } catch {}
        localStorage.removeItem(`delete_otp_${user.email}`);

        await signOut();
        
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

  if (!isVisible) return null;

  return (
    <>
      {!asPage && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
      )}
      <div 
        className={
          asPage
            ? `min-h-screen pt-20 md:pt-28 pb-10 px-4 ${isDarkMode ? 'bg-gradient-to-b from-black via-gray-900 to-black' : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'}`
            : 'fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4'
        }
        onWheel={asPage ? undefined : (e) => e.stopPropagation()}
        onTouchMove={asPage ? undefined : (e) => e.stopPropagation()}
      >
        <div 
          className={
            asPage
              ? 'max-w-5xl w-full mx-auto p-0 relative overflow-visible'
              : 'bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar'
          }
          style={asPage ? undefined : {
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
          onClick={asPage ? undefined : (e) => e.stopPropagation()}
          onWheel={asPage ? undefined : (e) => {
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
          onTouchStart={asPage ? undefined : (e) => e.stopPropagation()}
          onTouchMove={asPage ? undefined : (e) => e.stopPropagation()}
        >
          {!asPage && (
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {asPage && (
            <div className="mb-6 max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/90">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                Manage your profile, security, course preferences, and website options from one complete page.
              </p>
            </div>
          )}

          {!asPage && (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 pr-10">Settings</h2>
          )}

          {/* Tabs */}
          <div
            className={
              asPage
                ? 'max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4'
                : 'flex gap-1 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto custom-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6'
            }
          >
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[60px] ${
                asPage
                  ? activeTab === 'profile'
                    ? 'rounded-lg bg-purple-600 text-white'
                    : 'rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  : activeTab === 'profile'
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
                asPage
                  ? activeTab === 'security'
                    ? 'rounded-lg bg-purple-600 text-white'
                    : 'rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  : activeTab === 'security'
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
                asPage
                  ? activeTab === 'preferences'
                    ? 'rounded-lg bg-purple-600 text-white'
                    : 'rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  : activeTab === 'preferences'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Preferences
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation min-w-[72px] ${
                asPage
                  ? activeTab === 'courses'
                    ? 'rounded-lg bg-purple-600 text-white'
                    : 'rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  : activeTab === 'courses'
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
              }`}
            >
              Courses
            </button>
          </div>

          <div className={asPage ? 'max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800' : ''}>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex flex-col items-center text-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-400/60 bg-gray-100 dark:bg-gray-700">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 1116 0" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={profileImageInputRef}
                  id="profileAvatarInput"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
                <label
                  htmlFor="profileAvatarInput"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Change Profile Picture
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WebP up to 3MB</p>
              </div>
            </div>
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
              <div className="relative">
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation ${
                    usernameValidation.status === 'valid'
                      ? 'border-emerald-500'
                      : usernameValidation.status === 'invalid'
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                  placeholder="username123"
                  pattern="[a-z0-9]+"
                />
                {usernameValidation.status === 'checking' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">...</span>
                )}
                {usernameValidation.status === 'valid' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden>
                    ✓
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                usernameValidation.status === 'invalid'
                  ? 'text-red-500'
                  : usernameValidation.status === 'valid'
                    ? 'text-emerald-500'
                    : 'text-gray-500 dark:text-gray-400'
              }`}>
                {usernameValidation.message || 'Use lowercase letters and numbers; include at least one letter and one number.'}
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
                disabled={loading || imageUploading}
                className="flex-1 px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base font-medium"
              >
                {loading || imageUploading ? 'Saving...' : 'Save Changes'}
              </button>
              {!asPage && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 sm:py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-300 dark:active:bg-gray-600 transition-colors touch-manipulation text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
              )}
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
                        placeholder="Enter new password (min 8 chars)"
                        minLength={8}
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
                      {passwordData.newPassword.length > 0 && passwordStrong && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden>
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className={passwordHasLetter ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}>
                        {passwordHasLetter ? '✓' : '•'} Contains letters
                      </p>
                      <p className={passwordHasNumber ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}>
                        {passwordHasNumber ? '✓' : '•'} Contains numbers
                      </p>
                      <p className={passwordHasSpecial ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}>
                        {passwordHasSpecial ? '✓' : '•'} Contains special character
                      </p>
                      <p className={passwordData.newPassword.length >= 8 ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '•'} Minimum 8 characters
                      </p>
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
                        minLength={8}
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

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Control how <span className="font-semibold text-cyan-600 dark:text-cyan-400">Courses</span> behave for you — emails, progress visibility, and the learning experience.
                </p>
                <a
                  href="/courses"
                  className="mt-2 inline-block text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Go to Courses →
                </a>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Course &amp; deadline emails</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Reminders for new content, due dates, and announcements
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseSettings({ ...courseSettings, emailReminders: !courseSettings.emailReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.emailReminders ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.emailReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Quiz &amp; certificate emails</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Results, passes, and completion certificates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCourseSettings({ ...courseSettings, quizAndCertificateEmails: !courseSettings.quizAndCertificateEmails })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.quizAndCertificateEmails ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.quizAndCertificateEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Admission &amp; enrollment updates</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Status changes on applications and enrollments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCourseSettings({ ...courseSettings, admissionStatusEmails: !courseSettings.admissionStatusEmails })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.admissionStatusEmails ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.admissionStatusEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Show course progress on profile</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Let others see enrolled courses and completion (when the site supports it)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseSettings({ ...courseSettings, progressOnProfile: !courseSettings.progressOnProfile })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.progressOnProfile ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.progressOnProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">Default courses view</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">When you open Courses, start on:</p>
                <select
                  value={courseSettings.defaultCoursesView}
                  onChange={(e) =>
                    setCourseSettings({
                      ...courseSettings,
                      defaultCoursesView: e.target.value as 'catalog' | 'my'
                    })
                  }
                  className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="catalog">All courses (catalog)</option>
                  <option value="my">My enrollments</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Autoplay next lesson</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    After a lesson ends, go to the next one automatically
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCourseSettings({ ...courseSettings, autoplayNextLesson: !courseSettings.autoplayNextLesson })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.autoplayNextLesson ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.autoplayNextLesson ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Show completed lessons</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Keep finished lessons visible in the outline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCourseSettings({ ...courseSettings, showCompletedLessons: !courseSettings.showCompletedLessons })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.showCompletedLessons ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.showCompletedLessons ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Compact course list</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Denser rows when browsing many courses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCourseSettings({ ...courseSettings, compactCourseList: !courseSettings.compactCourseList })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    courseSettings.compactCourseList ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      courseSettings.compactCourseList ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => saveUserSettings('courses')}
                disabled={loading}
                className="w-full px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-colors touch-manipulation text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save courses settings'}
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
      </div>
      <ProfileImageCropDialog
        isOpen={isCropDialogOpen}
        imageSrc={cropImageSrc}
        crop={cropPosition}
        zoom={cropZoom}
        onCropChange={setCropPosition}
        onZoomChange={setCropZoom}
        onCropComplete={(_, croppedPixels) => setCropAreaPixels(croppedPixels)}
        onCancel={handleCancelCrop}
        onConfirm={handleApplyCroppedImage}
        confirming={cropApplying}
      />
    </>
  );
};

export default UserSettingsModal;

