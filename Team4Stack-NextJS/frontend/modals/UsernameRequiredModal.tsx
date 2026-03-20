'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

interface UsernameRequiredModalProps {
  isOpen: boolean;
}

const UsernameRequiredModal: React.FC<UsernameRequiredModalProps> = ({ isOpen }) => {
  const { user, refresh } = useAuth();
  const { isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) {
      setError('Username is required');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      setError('Username must be 3-20 characters, lowercase letters, numbers, and underscores only');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const check = await usersApi.checkUsernameAvailability(username.toLowerCase());
      const available =
        check.success &&
        check.data &&
        typeof (check.data as any).available === 'boolean' &&
        (check.data as any).available === true;
      if (!available) {
        setError('Username already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      const updateResult = await usersApi.updateUser(user.id, {
        username: username.toLowerCase(),
      });

      if (updateResult.error) {
        setError(updateResult.error || 'Failed to set username. Please try again.');
      } else {
        await refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[10000] backdrop-blur-sm transition-opacity ${
          isDarkMode ? 'bg-black/80' : 'bg-black/50'
        }`}
        style={{ pointerEvents: 'auto' }}
      />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pt-20 md:pt-24">
        <div 
          className={`rounded-2xl border shadow-2xl max-w-md w-full p-6 relative ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Username Required
          </h2>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Please choose a username to continue. You can use this username or your email to sign in later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                }`}
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setUsername(value);
                  setError(null);
                }}
                placeholder="username"
                pattern="[a-z0-9_]+"
                maxLength={20}
                required
                autoFocus
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Only lowercase letters, numbers, and underscores allowed (3-20 characters)
              </p>
            </div>

            {error && (
              <div className={`p-3 rounded-md text-sm ${
                isDarkMode
                  ? 'bg-red-900/30 text-red-300'
                  : 'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="flex-1 px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting...' : 'Set Username'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UsernameRequiredModal;

