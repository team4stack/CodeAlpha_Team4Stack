/**
 * Load .env before any other app imports (see server.ts import order).
 * Resolves backend/.env from this file location so it works when cwd is backend/ or repo root.
 */
import path from 'node:path';
import dotenv from 'dotenv';

const backendEnv = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: backendEnv });

// Fallbacks if the file was moved or cwd-based layout
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
}
