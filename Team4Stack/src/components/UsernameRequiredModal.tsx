import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface UsernameRequiredModalProps {
  isOpen: boolean;
}

const UsernameRequiredModal: React.FC<UsernameRequiredModalProps> = ({ isOpen }) => {
  const { user, refresh } = useAuth();
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
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        setError('Username already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      // Update user profile with username
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: username.toLowerCase() })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message || 'Failed to set username. Please try again.');
      } else {
        // Refresh user data
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
        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm transition-opacity"
        style={{ pointerEvents: 'auto' }}
      />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full p-6 relative"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Username Required
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please choose a username to continue. You can use this username or your email to sign in later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only lowercase letters, numbers, and underscores allowed (3-20 characters)
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
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

