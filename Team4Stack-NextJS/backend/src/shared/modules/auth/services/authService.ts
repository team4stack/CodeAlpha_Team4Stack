import { supabaseAdmin, supabase } from '../../../../config/supabase';
import userService from '../../users/services/userService';

export interface SignInResult {
  user: any;
  session: any;
  error?: string;
}

export interface SignUpResult {
  user: any;
  session: any;
  error?: string;
}

export class AuthService {
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      // Use Supabase auth to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message || 'Invalid email or password.',
        };
      }

      if (!data.user || !data.session) {
        return {
          user: null,
          session: null,
          error: 'Failed to sign in. Please try again.',
        };
      }

      // Check if user is blocked
      const userRecord = await userService.getUserByEmail(email.toLowerCase().trim());
      if (userRecord && userRecord.is_blocked === true) {
        // Sign out the user if they're blocked
        await supabase.auth.signOut();
        return {
          user: null,
          session: null,
          error: 'Your account has been suspended. Please contact support.',
        };
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || 'An error occurred during sign in.',
      };
    }
  }

  async signUp(email: string, password: string, username?: string, name?: string): Promise<SignUpResult> {
    try {
      // Use Supabase auth to sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        options: {
          data: {
            username: username?.toLowerCase().trim(),
            name: name || username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message || 'Failed to create account. Please try again.',
        };
      }

      if (!data.user) {
        return {
          user: null,
          session: null,
          error: 'Failed to create account. Please try again.',
        };
      }

      // Create user record in users table if it doesn't exist
      try {
        const existingUser = await userService.getUserByEmail(email.toLowerCase().trim());
        if (!existingUser) {
          await userService.upsertUser({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            username: username?.toLowerCase().trim(),
            name: name || username || email.split('@')[0],
          });
        }
      } catch (userError) {
        // Log error but don't fail signup - user is created in auth.users
        console.error('Error creating user record:', userError);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || 'An error occurred during sign up.',
      };
    }
  }

  async resetPassword(email: string, redirectUrl: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: error.message || 'Failed to send password reset email.' };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during password reset.' };
    }
  }

  async updatePassword(newPassword: string, accessToken?: string, refreshToken?: string): Promise<{ error?: string }> {
    try {
      // If tokens are provided, set the session first
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          return { error: 'Invalid or expired reset link. Please request a new password reset link.' };
        }
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (error) {
        return { error: error.message || 'Failed to update password.' };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during password update.' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message || 'Failed to sign out.' };
      }
      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during sign out.' };
    }
  }

  async getSession(accessToken?: string, refreshToken?: string): Promise<{ session: any; user: any; error?: string }> {
    try {
      // If tokens are provided, verify the session
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          return { session: null, user: null, error: error.message || 'Invalid session.' };
        }

        if (!data.session || !data.user) {
          return { session: null, user: null, error: 'Session or user not found.' };
        }

        // Get user profile from users table
        let userProfile = null;
        try {
          userProfile = await userService.getUserById(data.user.id);
        } catch (profileError) {
          // If profile doesn't exist, that's okay - we'll return user data without profile
          // Frontend will create profile if needed
          if (process.env.NODE_ENV === 'development') {
            console.log('User profile not found for user:', data.user.id, '- will be created by frontend');
          }
        }

        // Return user data with profile (profile can be null if doesn't exist)
        return { 
          session: data.session, 
          user: {
            ...data.user,
            profile: userProfile
          }
        };
      }

      // If no tokens provided, return error (frontend should provide tokens)
      return { session: null, user: null, error: 'Access token and refresh token are required.' };
    } catch (error: any) {
      return { session: null, user: null, error: error.message || 'An error occurred while getting session.' };
    }
  }

  async initiateOAuth(provider: 'google' | 'github', redirectTo: string): Promise<{ url: string; error?: string }> {
    try {
      // Generate OAuth URL using Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });

      if (error) {
        return { url: '', error: error.message || 'Failed to initiate OAuth login.' };
      }

      if (!data.url) {
        return { url: '', error: 'Failed to generate OAuth URL.' };
      }

      return { url: data.url };
    } catch (error: any) {
      return { url: '', error: error.message || 'An error occurred during OAuth initiation.' };
    }
  }

  async handleOAuthCallback(accessToken: string, refreshToken: string, expiresIn?: number): Promise<{ user: any; session: any; error?: string }> {
    try {
      // Set session using tokens from OAuth callback
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message || 'Invalid OAuth session.',
        };
      }

      if (!data.user || !data.session) {
        return {
          user: null,
          session: null,
          error: 'Failed to create session from OAuth callback.',
        };
      }

      // Check if user is blocked
      const userRecord = await userService.getUserByEmail(data.user.email?.toLowerCase().trim() || '');
      if (userRecord && userRecord.is_blocked === true) {
        await supabase.auth.signOut();
        return {
          user: null,
          session: null,
          error: 'Your account has been suspended. Please contact support.',
        };
      }

      // Create or update user profile if it doesn't exist
      try {
        const existingUser = await userService.getUserById(data.user.id);
        if (!existingUser) {
          // Create user profile from OAuth data
          await userService.upsertUser({
            id: data.user.id,
            email: data.user.email?.toLowerCase().trim() || '',
            name: data.user.user_metadata?.name || 
                  data.user.user_metadata?.full_name || 
                  data.user.email?.split('@')[0] || 'User',
            username: data.user.user_metadata?.username || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          });
        }
      } catch (userError) {
        // Log error but don't fail OAuth - user is created in auth.users
        if (process.env.NODE_ENV === 'development') {
          console.error('Error creating/updating user profile from OAuth:', userError);
        }
      }

      // Get user profile
      let userProfile = null;
      try {
        userProfile = await userService.getUserById(data.user.id);
      } catch (profileError) {
        // Profile might not exist yet, that's okay
      }

      return {
        user: {
          ...data.user,
          profile: userProfile,
        },
        session: data.session,
      };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || 'An error occurred during OAuth callback processing.',
      };
    }
  }
}

export default new AuthService();
