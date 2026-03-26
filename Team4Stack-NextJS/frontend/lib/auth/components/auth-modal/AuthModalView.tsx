import React from 'react';
import type { OAuthProvider } from '@/lib/auth/components/auth-modal/oauthRedirect';

interface AuthModalViewProps {
  isOpen: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  recaptchaRef: React.RefObject<HTMLDivElement | null>;
  isSignUp: boolean;
  isForgotPassword: boolean;
  isVerifying: boolean;
  isResettingPassword: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmNewPassword: string;
  showNewPassword: boolean;
  showConfirmNewPassword: boolean;
  username: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  recaptchaToken: string | null;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  setIsVerifying: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setIsResettingPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setIsForgotPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfirmNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setRecaptchaToken: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSignUp: React.Dispatch<React.SetStateAction<boolean>>;
  signInOAuth: (provider: OAuthProvider) => Promise<void>;
  verifyEmailCode: () => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  updatePassword: () => Promise<void>;
  resetPassword: () => Promise<void>;
  signUpEmail: () => Promise<void>;
  signInEmail: () => Promise<void>;
}

const AuthModalView: React.FC<AuthModalViewProps> = ({
  isOpen,
  onClose,
  panelRef,
  recaptchaRef,
  isSignUp,
  isForgotPassword,
  isVerifying,
  isResettingPassword,
  loading,
  error,
  success,
  email,
  verificationCode,
  newPassword,
  confirmNewPassword,
  showNewPassword,
  showConfirmNewPassword,
  username,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  recaptchaToken,
  setEmail,
  setVerificationCode,
  setIsVerifying,
  setError,
  setSuccess,
  setIsResettingPassword,
  setIsForgotPassword,
  setNewPassword,
  setConfirmNewPassword,
  setShowNewPassword,
  setShowConfirmNewPassword,
  setUsername,
  setPassword,
  setConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  setRecaptchaToken,
  setIsSignUp,
  signInOAuth,
  verifyEmailCode,
  resendVerificationCode,
  updatePassword,
  resetPassword,
  signUpEmail,
  signInEmail
}) => {
  return (
    <>
      <div className={`fixed inset-0 z-[9998] transition ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ background: 'rgba(0,0,0,0.6)' }} />
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} overflow-y-auto p-4`}>
        <div ref={panelRef} className="w-full max-w-md my-auto rounded-2xl border border-white/10 bg-[#0c1224]/95 text-white backdrop-blur-xl p-6 shadow-[0_40px_120px_rgba(56,189,248,0.25)] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 border border-white/30 hover:border-white/50 transition-all cursor-pointer z-[100] shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            aria-label="Close"
            type="button"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center mb-4">
            <div className="text-xs px-2 py-1 inline-block rounded-md bg-white/10">Welcome</div>
            <h3 className="mt-2 text-2xl font-bold">
              {isVerifying ? 'Verify Email' : isResettingPassword ? 'Reset Password' : isForgotPassword ? 'Forgot Password' : isSignUp ? 'Sign Up' : 'Sign In'}
            </h3>
          </div>
          {!isForgotPassword && !isVerifying && !isResettingPassword && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => signInOAuth('google')}
                disabled={loading}
                className="rounded-lg px-3 py-2 bg-white/10 border border-white/15 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Google'}
              </button>
              <button
                onClick={() => signInOAuth('github')}
                disabled={loading}
                className="rounded-lg px-3 py-2 bg-white/10 border border-white/15 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'GitHub'}
              </button>
            </div>
          )}
          {!isForgotPassword && !isVerifying && !isResettingPassword && <div className="my-4 h-px bg-white/10" />}
          <div className="space-y-2">
            {isVerifying ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter the 6-digit verification code sent to <span className="font-semibold">{email}</span></p>
                <p className="text-xs text-white/50 mb-3">Code expires in 10 minutes</p>
                <input
                  placeholder="Enter 6-digit code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button
                  onClick={verifyEmailCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <div className="w-full text-center mt-2">
                  <span className="text-sm text-white/60">Didn't receive code? </span>
                  <span
                    onClick={resendVerificationCode}
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Resend
                  </span>
                </div>
                <div className="w-full text-center mt-2">
                  <span
                    onClick={() => {
                      setIsVerifying(false);
                      setVerificationCode('');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign Up
                  </span>
                </div>
              </>
            ) : isResettingPassword ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter your new password below.</p>
                <div className="relative">
                  <input
                    placeholder="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (confirmNewPassword && e.target.value !== confirmNewPassword) {
                        setError('Passwords do not match');
                      } else if (confirmNewPassword && e.target.value === confirmNewPassword) {
                        setError(null);
                      }
                    }}
                    className="w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 focus:outline-none"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                <div className="relative">
                  <input
                    placeholder="Confirm New Password"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (newPassword && e.target.value !== newPassword) {
                        setError('Passwords do not match');
                      } else if (newPassword && e.target.value === newPassword) {
                        setError(null);
                      }
                    }}
                    className={`w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      confirmNewPassword && newPassword && confirmNewPassword !== newPassword
                        ? 'border-red-500'
                        : confirmNewPassword && newPassword && confirmNewPassword === newPassword
                        ? 'border-green-500'
                        : 'border-white/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmNewPassword ? (
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
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button
                  onClick={updatePassword}
                  disabled={loading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <div className="w-full text-center mt-2">
                  <span
                    onClick={() => {
                      setIsResettingPassword(false);
                      setIsForgotPassword(false);
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign In
                  </span>
                </div>
              </>
            ) : isForgotPassword ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter your email address and we'll send you a password reset link.</p>
                <input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div className="w-full text-center mt-2">
                  <span
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign In
                  </span>
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <input
                    placeholder="Username (required)"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={20}
                    required
                  />
                )}
                <input
                  placeholder={isSignUp ? 'Email' : 'Email or Username'}
                  type={isSignUp ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="relative overflow-hidden auth-password-field">
                  <input
                    placeholder={isSignUp ? 'New Password' : 'Password'}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (isSignUp && confirmPassword && e.target.value !== confirmPassword) {
                        setError('Passwords do not match');
                      } else if (isSignUp && confirmPassword && e.target.value === confirmPassword) {
                        setError(null);
                      }
                    }}
                    className="w-full rounded-lg px-3 py-2 pr-12 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white/85 focus:outline-none z-10 h-8 w-8 p-0 rounded-md bg-white/5 backdrop-blur-[2px] transition-colors btn-no-liquid flex items-center justify-center leading-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
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
                {!isSignUp && (
                  <div className="w-full flex justify-center mt-[2px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setPassword('');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer btn-no-liquid"
                    >
                      Forgot?
                    </button>
                  </div>
                )}
                {isSignUp && (
                  <div className="relative">
                    <input
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (password && e.target.value !== password) {
                          setError('Passwords do not match');
                        } else if (password && e.target.value === password) {
                          setError(null);
                        }
                      }}
                      className={`w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        confirmPassword && password && confirmPassword !== password
                          ? 'border-red-500'
                          : confirmPassword && password && confirmPassword === password
                          ? 'border-green-500'
                          : 'border-white/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 h-8 w-8 p-0 rounded-md bg-white/5 backdrop-blur-[2px] transition-colors btn-no-liquid flex items-center justify-center leading-none hover:bg-white/10"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                )}

                {!isSignUp && (
                  <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
                    <div
                      id="auth-recaptcha-container"
                      ref={recaptchaRef}
                    />
                    {!recaptchaToken && (
                      <p className="mt-2 text-red-400 text-xs">Please complete the reCAPTCHA verification</p>
                    )}
                  </div>
                )}

                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                {isSignUp ? (
                  <>
                    <button
                      onClick={signUpEmail}
                      disabled={loading}
                      className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                    >
                      {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                    <div className="w-full text-center mt-2">
                      <span className="text-sm text-white/60">Already have an account? </span>
                      <span
                        onClick={() => {
                          setIsSignUp(false);
                          setUsername('');
                          setPassword('');
                          setConfirmPassword('');
                          setError(null);
                          setSuccess(null);
                          if (window.grecaptcha?.reset) {
                            try {
                              window.grecaptcha.reset();
                              setRecaptchaToken(null);
                            } catch {
                              // ignore reset failures
                            }
                          }
                        }}
                        className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                      >
                        Sign In
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={signInEmail}
                      disabled={loading || !recaptchaToken}
                      className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <div className="w-full text-center mt-2">
                      <span className="text-sm text-white/60">Don't have an account? </span>
                      <span
                        onClick={() => {
                          setIsSignUp(true);
                          setError(null);
                          setSuccess(null);
                          setRecaptchaToken(null);
                        }}
                        className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                      >
                        Sign Up
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModalView;

