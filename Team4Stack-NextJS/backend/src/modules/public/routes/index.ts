import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * Server-side YouTube Data API proxy — use `YOUTUBE_API_KEY` (never expose to the browser).
 * GET /api/public/youtube/video?videoId=...
 */
router.get('/youtube/video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = (req.query.videoId || req.query.id) as string | undefined;
    const videoId = typeof raw === 'string' ? raw.trim() : '';
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      res.status(400).json({ success: false, error: 'Invalid or missing videoId' });
      return;
    }

    const key = process.env.YOUTUBE_API_KEY?.trim();
    if (!key) {
      res.status(503).json({
        success: false,
        error: 'YouTube API is not configured on the server'
      });
      return;
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('id', videoId);
    url.searchParams.set('key', key);

    const r = await fetch(url.toString());
    const json = (await r.json()) as unknown;
    res.status(r.ok ? 200 : r.status).json(json);
  } catch (err) {
    next(err);
  }
});

export default router;
