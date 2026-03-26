// Must run before any module that reads process.env (e.g. supabase.ts on import chain)
import './loadEnv';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import coursesRoutes from './modules/courses/routes';
import landingRoutes from './modules/landing/routes';
import stackstoreRoutes from './modules/stackstore/routes';
import teamRoutes from './modules/team/routes';
import superadminRoutes from './modules/superadmin/routes';
import usersRoutes from './shared/modules/users/routes';
import authRoutes from './shared/modules/auth/routes';
import publicRoutes from './modules/public/routes';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - More lenient in development, skip for localhost
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Very high limit in dev, normal in production
  message: 'Too many requests from this IP, please wait a moment and try again.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    if (req.path === '/health') return true;
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.socket.remoteAddress || '';
      if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
        return true;
      }
    }
    return false;
  },
  // Custom handler to provide better error messages
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests from this IP. Please wait a moment and try again.',
      retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
    });
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Team4Stack Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/public', publicRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/stackstore', stackstoreRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server] Error:', err);
  console.error('[Server] Error stack:', err.stack);
  if ((err as any).code) {
    console.error('[Server] Error code:', (err as any).code);
  }
  if ((err as any).details) {
    console.error('[Server] Error details:', (err as any).details);
  }
  if ((err as any).hint) {
    console.error('[Server] Error hint:', (err as any).hint);
  }

  const statusRaw = (err as any).status;
  const status =
    typeof statusRaw === 'number' && statusRaw >= 400 && statusRaw < 600 ? statusRaw : 500;

  if (status !== 500) {
    return res.status(status).json({
      success: false,
      error: err.message || 'Request failed'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && {
      code: (err as any).code,
      details: (err as any).details,
      hint: (err as any).hint
    })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[EADDRINUSE] Port ${PORT} is already in use — another process is listening (not a TypeScript bug).\n` +
        `  • Stop the other backend: close extra terminals, or Task Manager → end "Node.js"\n` +
        `  • Or find PID (PowerShell): Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess\n` +
        `  • Or use another port: set PORT=5001 in backend/.env and match NEXT_PUBLIC_API_URL on the frontend.\n`
    );
    process.exit(1);
  }
  throw err;
});

export default app;
