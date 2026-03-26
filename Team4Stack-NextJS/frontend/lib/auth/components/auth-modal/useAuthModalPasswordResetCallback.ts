import { useEffect } from 'react';

interface UseAuthModalPasswordResetCallbackArgs {
  isOpen: boolean;
  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
  setIsForgotPassword: (value: boolean) => void;
  setIsResettingPassword: (value: boolean) => void;
}

export const useAuthModalPasswordResetCallback = ({
  isOpen,
  setError,
  setSuccess,
  setIsForgotPassword,
  setIsResettingPassword
}: UseAuthModalPasswordResetCallbackArgs) => {
  useEffect(() => {
    const handlePasswordReset = async () => {
      let hash = window.location.hash;

      if (hash.includes('#type=') && hash.includes('#access_token=')) {
        hash = hash.substring(1).replaceAll('#', '&');
      }

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type !== 'recovery' || !accessToken) return;

      try {
        const { authApi } = await import('@/lib/api');
        const verifyResult = await authApi.getSession(accessToken, refreshToken || '');

        if (verifyResult.error || !verifyResult.success) {
          setError('Invalid or expired reset link. Please request a new password reset link.');
          return;
        }

        try {
          localStorage.setItem(
            'password_reset_tokens',
            JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
          );
        } catch {
          // continue when local storage write fails
        }

        setIsForgotPassword(false);
        setIsResettingPassword(true);
        setError(null);
        setSuccess('Please enter your new password');
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        setError('Failed to process reset link. Please request a new password reset link.');
      }
    };

    handlePasswordReset();
  }, [isOpen, setError, setSuccess, setIsForgotPassword, setIsResettingPassword]);
};

