import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export class AuthController {
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const result = await authService.signIn(email, password);

      if (result.error) {
        return res.status(401).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          session: result.session,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, username, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters',
        });
      }

      const result = await authService.signUp(email, password, username, name);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          session: result.session,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, redirectUrl } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const siteUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
      const finalRedirectUrl = redirectUrl || `${siteUrl}${req.body.pathname || ''}`;

      const result = await authService.resetPassword(email, finalRedirectUrl);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error: any) {
      next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword, accessToken, refreshToken } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password is required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters',
        });
      }

      const result = await authService.updatePassword(newPassword, accessToken, refreshToken);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.signOut();

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Signed out successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = req.body;

      if (!accessToken || !refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Access token and refresh token are required',
        });
      }

      const result = await authService.getSession(accessToken, refreshToken);

      if (result.error) {
        return res.status(401).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          session: result.session,
          user: result.user,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  initiateOAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider, redirectTo } = req.body;

      if (!provider || (provider !== 'google' && provider !== 'github')) {
        return res.status(400).json({
          success: false,
          error: 'Valid provider (google or github) is required',
        });
      }

      if (!redirectTo) {
        return res.status(400).json({
          success: false,
          error: 'Redirect URL is required',
        });
      }

      // Supabase redirects with tokens in hash (client-side only)
      // So we'll redirect to frontend, and frontend will send tokens to backend
      // But we still initiate OAuth from backend for security
      const result = await authService.initiateOAuth(provider as 'google' | 'github', redirectTo);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          url: result.url,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // OAuth redirect endpoint - masks Supabase URL by redirecting through backend
  // Frontend calls this endpoint, backend redirects to Supabase OAuth URL
  // This way user sees backend URL instead of Supabase URL in browser
  oauthRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = req.query.provider as string;
      const redirectTo = req.query.redirect_to as string || 
        process.env.FRONTEND_URL || 
        process.env.CORS_ORIGIN || 
        'http://localhost:3000';

      if (!provider || (provider !== 'google' && provider !== 'github')) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Error</title>
            <meta http-equiv="refresh" content="3;url=${redirectTo}">
          </head>
          <body>
            <p>Invalid OAuth provider. Redirecting...</p>
            <script>setTimeout(() => window.location.href = '${redirectTo}', 3000);</script>
          </body>
          </html>
        `);
      }

      // Get OAuth URL from Supabase
      const result = await authService.initiateOAuth(provider as 'google' | 'github', redirectTo);

      if (result.error) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Error</title>
            <meta http-equiv="refresh" content="3;url=${redirectTo}">
          </head>
          <body>
            <p>Failed to initiate authentication. Redirecting...</p>
            <script>setTimeout(() => window.location.href = '${redirectTo}', 3000);</script>
          </body>
          </html>
        `);
      }

      // Redirect to Supabase OAuth URL (user will see backend URL briefly, then Supabase)
      // To fully hide Supabase URL, we could use a loading page, but OAuth requires direct redirect
      res.redirect(result.url);
    } catch (error: any) {
      const redirectTo = req.query.redirect_to as string || 
        process.env.FRONTEND_URL || 
        process.env.CORS_ORIGIN || 
        'http://localhost:3000';
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta http-equiv="refresh" content="3;url=${redirectTo}">
        </head>
        <body>
          <p>An error occurred during authentication. Redirecting...</p>
          <script>setTimeout(() => window.location.href = '${redirectTo}', 3000);</script>
        </body>
        </html>
      `);
    }
  };

  // Note: This callback endpoint is kept for potential future use
  // Currently, Supabase redirects directly to frontend with tokens in hash
  // Frontend then calls /auth/session to verify tokens through backend
  oauthCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This endpoint is not currently used since Supabase redirects to frontend
      // But kept for potential server-side OAuth callback handling in future
      const redirectTo = req.query.redirect_to as string || 'http://localhost:3000';
      return res.redirect(`${redirectTo}?error=oauth_callback_not_implemented`);
    } catch (error: any) {
      const redirectTo = req.query.redirect_to as string || 'http://localhost:3000';
      return res.redirect(`${redirectTo}?error=oauth_callback_error`);
    }
  };
}

export default new AuthController();
