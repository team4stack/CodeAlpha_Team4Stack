import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { google } from 'googleapis';

const router = Router();

function logDriveUploadError(context: string, err: unknown): void {
  try {
    const e = err as any;
    const status = e?.code || e?.response?.status;
    const message =
      typeof e?.message === 'string'
        ? e.message
        : typeof e?.response?.data?.error?.message === 'string'
          ? e.response.data.error.message
          : 'Unknown error';
    const reason =
      e?.response?.data?.error?.errors?.[0]?.reason ||
      e?.errors?.[0]?.reason ||
      undefined;

    // Server-side log only; never return these details to the client.
    // Helps diagnose: permissions, shared drives, invalid parent folder, scopes, etc.
    console.error(`[google-drive-upload] ${context}`, {
      status,
      reason,
      message
    });
  } catch {
    console.error(`[google-drive-upload] ${context}: failed to log error`);
  }
}

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

    // Keys restricted to "HTTP referrers" need a Referer on the request *to* googleapis.com.
    // Prefer YOUTUBE_API_REFERER; else FRONTEND_URL / CORS_ORIGIN (e.g. http://localhost:3000).
    const refererRaw =
      process.env.YOUTUBE_API_REFERER?.trim() ||
      process.env.FRONTEND_URL?.trim() ||
      process.env.CORS_ORIGIN?.trim() ||
      '';
    let referer = '';
    if (refererRaw) {
      referer = refererRaw.endsWith('/') ? refererRaw : `${refererRaw}/`;
    }

    const r = await fetch(url.toString(), {
      headers: referer
        ? {
            Referer: referer,
          }
        : undefined,
    });
    const json = (await r.json()) as Record<string, unknown>;

    if (!r.ok) {
      // 403: key often restricted to "HTTP referrers" — server-side fetch has no Referer; Google rejects it.
      if (r.status === 403) {
        warnYoutube403Once();
      }
      res.status(r.status).json(json);
      return;
    }

    res.status(200).json(json);
  } catch (err) {
    next(err);
  }
});

/**
 * Server-side Cloudinary image upload proxy.
 * POST /api/public/uploads/cloudinary
 * body: { fileDataUrl: string; folder?: string }
 */
router.post('/uploads/cloudinary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileDataUrl = typeof req.body?.fileDataUrl === 'string' ? req.body.fileDataUrl.trim() : '';
    const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder.trim() : '';
    const allowedFolders = new Set([
      'team4stack/profile-avatars',
      'team4stack/admission-screenshots',
      'team4stack/support-screenshots'
    ]);
    const folder = requestedFolder || 'team4stack/admission-screenshots';

    if (!fileDataUrl?.startsWith('data:image/')) {
      res.status(400).json({ success: false, error: 'Invalid image payload' });
      return;
    }

    if (!allowedFolders.has(folder)) {
      res.status(400).json({
        success: false,
        error: 'Invalid upload folder. Use profile-avatars, admission-screenshots, or support-screenshots.'
      });
      return;
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim() || '';
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
    let apiKey = process.env.CLOUDINARY_API_KEY?.trim() || '';
    let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || '';

    // If CLOUDINARY_URL is present, treat it as authoritative to avoid mismatched creds
    // between CLOUDINARY_URL and CLOUDINARY_* vars (which breaks signatures).
    if (cloudinaryUrl.startsWith('cloudinary://')) {
      try {
        const parsed = new URL(cloudinaryUrl);
        cloudName = parsed.hostname;
        apiKey = decodeURIComponent(parsed.username || '');
        apiSecret = decodeURIComponent(parsed.password || '');
      } catch {
        // ignore malformed CLOUDINARY_URL
      }
    }

    if (!cloudName || !apiKey || !apiSecret) {
      res.status(503).json({ success: false, error: 'Cloudinary is not configured on the server' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    let publicIdPrefix = 'payment';
    if (folder.endsWith('profile-avatars')) {
      publicIdPrefix = 'profile';
    } else if (folder.endsWith('support-screenshots')) {
      publicIdPrefix = 'support';
    }
    const publicId = `${publicIdPrefix}_${Date.now()}`;
    const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');

    const body = new URLSearchParams();
    body.set('file', fileDataUrl);
    body.set('api_key', apiKey);
    body.set('timestamp', timestamp);
    body.set('folder', folder);
    body.set('public_id', publicId);
    body.set('signature', signature);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const json = (await cloudinaryResponse.json()) as { secure_url?: string; error?: { message?: string } };
    if (!cloudinaryResponse.ok || !json.secure_url) {
      res.status(502).json({
        success: false,
        error: json.error?.message || 'Failed to upload image to Cloudinary'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        secure_url: json.secure_url,
        folder
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Google Drive upload gateway webhook (Option B).
 *
 * POST /api/public/uploads/google-drive-webhook
 * headers: Authorization: Bearer <GOOGLE_DRIVE_UPLOAD_WEBHOOK_TOKEN>
 * body: { fileDataUrl: string; folder: string; fileName?: string }
 *
 * This endpoint exists so the main upload route can fallback to it when direct Drive upload
 * fails (permissions/folderId/service-account issues).
 */
router.post('/uploads/google-drive-webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expectedToken = process.env.GOOGLE_DRIVE_UPLOAD_WEBHOOK_TOKEN?.trim() || '';
    if (!expectedToken) {
      res.status(503).json({
        success: false,
        error: 'Upload gateway token is not configured on the server'
      });
      return;
    }

    const authHeader = String(req.headers.authorization || '');
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const providedToken = tokenMatch?.[1]?.trim() || '';

    if (!providedToken) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const safeCompare = (a: string, b: string): boolean => {
      // timingSafeEqual requires equal length buffers.
      const aBuf = Buffer.from(a, 'utf8');
      const bBuf = Buffer.from(b, 'utf8');
      if (aBuf.length !== bBuf.length) return false;
      return crypto.timingSafeEqual(aBuf, bBuf);
    };

    if (!safeCompare(providedToken, expectedToken)) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const fileDataUrl = typeof req.body?.fileDataUrl === 'string' ? req.body.fileDataUrl.trim() : '';
    const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder.trim() : '';
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName.trim() : '';

    const allowedFolders = new Set([
      'team4stack/course-assignment-templates',
      'team4stack/course-assignment-submissions'
    ]);
    const folder = requestedFolder || 'team4stack/course-assignment-submissions';
    if (!allowedFolders.has(folder)) {
      res.status(400).json({
        success: false,
        error: 'Invalid upload folder. Use course-assignment-templates or course-assignment-submissions.'
      });
      return;
    }

    const allowedMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mime = fileDataUrl.split(';')[0].replace('data:', '').trim();
    if (!fileDataUrl.startsWith('data:') || !allowedMime.includes(mime)) {
      res.status(400).json({ success: false, error: 'Only PDF, DOC, or DOCX files are allowed' });
      return;
    }

    const drive = getGoogleDriveClient();
    if (!drive) {
      res.status(503).json({
        success: false,
        error: 'Google Drive is not configured on the server'
      });
      return;
    }

    const folderId = await resolveGoogleDriveFolderId(folder, drive);
    if (!folderId) {
      res.status(503).json({
        success: false,
        error: 'Google Drive folder is not configured yet'
      });
      return;
    }

    let buffer: Buffer | undefined;
    let mimeType: string | undefined;
    try {
      const parsed = parseDataUrlPayload(fileDataUrl);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
    } catch {
      res.status(400).json({ success: false, error: 'Invalid file payload' });
      return;
    }
    if (!buffer || !mimeType) {
      res.status(400).json({ success: false, error: 'Invalid file payload' });
      return;
    }

    const safeFileName = sanitizeFileName(fileName || 'assignment_file');
    let createResponse: any;
    try {
      createResponse = await drive.files.create({
        supportsAllDrives: true,
        requestBody: {
          name: safeFileName,
          parents: [folderId]
        },
        media: {
          mimeType,
          body: Readable.from(buffer)
        },
        fields: 'id, webViewLink, webContentLink, size'
      });
    } catch (err) {
      logDriveUploadError('files.create failed', err);
      throw err;
    }

    const fileId = createResponse.data.id || '';
    if (!fileId) {
      res.status(500).json({ success: false, error: 'Failed to upload file' });
      return;
    }

    // Make file downloadable with link for students/admin.
    try {
      await drive.permissions.create({
        fileId,
        supportsAllDrives: true,
        requestBody: { type: 'anyone', role: 'reader' }
      });
    } catch (err) {
      logDriveUploadError('permissions.create failed', err);
      throw err;
    }

    const viewLink =
      createResponse.data.webViewLink ||
      createResponse.data.webContentLink ||
      `https://drive.google.com/file/d/${fileId}/view?usp=drive_link`;

    res.status(200).json({
      secure_url: viewLink,
      bytes: Number(createResponse.data.size || buffer.length || 0)
    });
  } catch (err) {
    // Never leak internal error details to the client.
    logDriveUploadError('webhook route failed', err);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

/**
 * Server-side Cloudinary file upload proxy (pdf/doc/docx).
 * POST /api/public/uploads/cloudinary-file
 * body: { fileDataUrl: string; folder?: string; fileName?: string }
 */
router.post('/uploads/cloudinary-file', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileDataUrl = typeof req.body?.fileDataUrl === 'string' ? req.body.fileDataUrl.trim() : '';
    const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder.trim() : '';
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName.trim() : '';
    const allowedFolders = new Set([
      'team4stack/course-assignment-templates',
      'team4stack/course-assignment-submissions'
    ]);
    const folder = requestedFolder || 'team4stack/course-assignment-submissions';

    const allowedMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mime = fileDataUrl.split(';')[0].replace('data:', '').trim();
    if (!fileDataUrl.startsWith('data:') || !allowedMime.includes(mime)) {
      res.status(400).json({ success: false, error: 'Only PDF, DOC, or DOCX files are allowed' });
      return;
    }
    if (!allowedFolders.has(folder)) {
      res.status(400).json({
        success: false,
        error: 'Invalid upload folder. Use course-assignment-templates or course-assignment-submissions.'
      });
      return;
    }

    const storageProvider = (process.env.COURSE_FILES_STORAGE_PROVIDER || 'cloudinary').trim().toLowerCase();
    if (storageProvider === 'google_drive') {
      const uploaded = await uploadRawFileToGoogleDriveGateway({
        fileDataUrl,
        fileName: fileName || 'assignment_file',
        folder
      });
      if (!uploaded.secure_url) {
        res.status(503).json({
          success: false,
          error:
            'Google Drive storage is enabled but upload gateway is not configured yet. Add GOOGLE_DRIVE_UPLOAD_WEBHOOK_URL and GOOGLE_DRIVE_UPLOAD_WEBHOOK_TOKEN.'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          secure_url: uploaded.secure_url,
          folder,
          bytes: uploaded.bytes || 0,
          provider: 'google_drive'
        }
      });
      return;
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim() || '';
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
    let apiKey = process.env.CLOUDINARY_API_KEY?.trim() || '';
    let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || '';
    // If CLOUDINARY_URL is present, treat it as authoritative to avoid mismatched creds
    // between CLOUDINARY_URL and CLOUDINARY_* vars (which breaks signatures).
    if (cloudinaryUrl.startsWith('cloudinary://')) {
      try {
        const parsed = new URL(cloudinaryUrl);
        cloudName = parsed.hostname;
        apiKey = decodeURIComponent(parsed.username || '');
        apiSecret = decodeURIComponent(parsed.password || '');
      } catch {
        /* ignore malformed cloudinary url */
      }
    }
    if (!cloudName || !apiKey || !apiSecret) {
      res.status(503).json({ success: false, error: 'Cloudinary is not configured on the server' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') : 'assignment_file';
    const publicId = `${Date.now()}_${safeName.replace(/\.[^.]+$/, '')}`;
    // For /raw/upload endpoint, Cloudinary already knows resource_type=raw from the URL.
    // Including resource_type in the signature can cause "Invalid Signature" because Cloudinary
    // doesn't always include it in its own signing string for this endpoint.
    const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');

    const body = new URLSearchParams();
    body.set('file', fileDataUrl);
    body.set('api_key', apiKey);
    body.set('timestamp', timestamp);
    body.set('folder', folder);
    body.set('public_id', publicId);
    body.set('signature', signature);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const json = (await cloudinaryResponse.json()) as {
      secure_url?: string;
      bytes?: number;
      error?: { message?: string };
    };
    if (!cloudinaryResponse.ok || !json.secure_url) {
      res.status(502).json({ success: false, error: json.error?.message || 'Failed to upload file to Cloudinary' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        secure_url: json.secure_url,
        folder,
        bytes: json.bytes || 0,
        provider: 'cloudinary'
      }
    });
  } catch (err) {
    next(err);
  }
});

/** Avoid spamming the terminal when many project cards fetch in parallel */
let lastYoutube403LogMs = 0;
function warnYoutube403Once(): void {
  const now = Date.now();
  if (now - lastYoutube403LogMs < 60_000) return;
  lastYoutube403LogMs = now;
  console.warn(
    '[youtube-proxy] Google returned 403 — If your key uses HTTP referrer restrictions, whitelist your frontend URL ' +
      '(e.g. http://localhost:3000/*). This server sends Referer from FRONTEND_URL / CORS_ORIGIN or YOUTUBE_API_REFERER. ' +
      'Or use key restrictions: None (dev) or IP addresses (prod). Enable YouTube Data API v3. See backend/.env.example.'
  );
}

async function uploadRawFileToGoogleDriveGateway(args: {
  fileDataUrl: string;
  fileName: string;
  folder: string;
}): Promise<{ secure_url?: string; bytes?: number }> {
  try {
    const drive = getGoogleDriveClient();
    if (!drive) return {};

    const folderId = await resolveGoogleDriveFolderId(args.folder, drive);
    if (!folderId) return {};

    const { mimeType, buffer } = parseDataUrlPayload(args.fileDataUrl);
    if (!buffer || !mimeType) return {};

    const safeFileName = sanitizeFileName(args.fileName || 'assignment_file');
    const createResponse = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: safeFileName,
        parents: [folderId]
      },
      media: {
        mimeType,
        body: Readable.from(buffer)
      },
      fields: 'id, webViewLink, webContentLink, size'
    });

    const fileId = createResponse.data.id || '';
    if (!fileId) return {};

    // Make file downloadable with link for students/admin
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: { type: 'anyone', role: 'reader' }
    });

    const viewLink =
      createResponse.data.webViewLink ||
      createResponse.data.webContentLink ||
      `https://drive.google.com/file/d/${fileId}/view?usp=drive_link`;

    return {
      secure_url: viewLink,
      bytes: Number(createResponse.data.size || buffer.length || 0)
    };
  } catch {
    // Fallback to webhook gateway if direct Drive upload is not configured.
  }

  const webhookUrl = process.env.GOOGLE_DRIVE_UPLOAD_WEBHOOK_URL?.trim() || '';
  if (!webhookUrl) return {};
  const webhookToken = process.env.GOOGLE_DRIVE_UPLOAD_WEBHOOK_TOKEN?.trim() || '';
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {})
    },
    body: JSON.stringify({
      fileDataUrl: args.fileDataUrl,
      fileName: args.fileName,
      folder: args.folder
    })
  });
  if (!response.ok) {
    return {};
  }
  const json = (await response.json()) as { secure_url?: string; bytes?: number };
  return { secure_url: json.secure_url, bytes: json.bytes || 0 };
}

function getGoogleDriveClient() {
  const keyFile = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE?.trim() || '';
  const credentialsJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim() || '';

  if (!keyFile && !credentialsJson) return null;

  let credentials: Record<string, unknown> | undefined;
  if (credentialsJson) {
    try {
      credentials = JSON.parse(credentialsJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  const auth = new google.auth.GoogleAuth({
    ...(keyFile ? { keyFile } : {}),
    ...(credentials ? { credentials } : {}),
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  return google.drive({ version: 'v3', auth });
}

async function resolveGoogleDriveFolderId(
  folder: string,
  drive: ReturnType<typeof google.drive>
): Promise<string> {
  const templatesId =
    process.env.GOOGLE_DRIVE_ASSIGNMENT_ADMIN_FOLDER_ID?.trim() ||
    process.env.GOOGLE_DRIVE_ASSIGNMENT_TEMPLATES_FOLDER_ID?.trim() ||
    '';
  const submissionsId =
    process.env.GOOGLE_DRIVE_ASSIGNMENT_STUDENT_FOLDER_ID?.trim() ||
    process.env.GOOGLE_DRIVE_ASSIGNMENT_SUBMISSIONS_FOLDER_ID?.trim() ||
    '';
  const rootId = process.env.GOOGLE_DRIVE_ASSIGNMENTS_ROOT_FOLDER_ID?.trim() || '';

  const wantsAdmin = folder.endsWith('course-assignment-templates');
  const wantsStudent = folder.endsWith('course-assignment-submissions');

  if (wantsAdmin && templatesId) return templatesId;
  if (wantsStudent && submissionsId) return submissionsId;

  if (rootId) {
    const childName = wantsAdmin ? 'admin' : wantsStudent ? 'student' : '';
    if (childName) {
      try {
        const list = await drive.files.list({
          q: `'${rootId}' in parents and trashed=false and mimeType='application/vnd.google-apps.folder' and name='${childName}'`,
          fields: 'files(id,name)',
          pageSize: 1
        });
        const foundId = list.data.files?.[0]?.id || '';
        if (foundId) return foundId;
      } catch {
        /* fallback to root */
      }
    }
  }

  return rootId;
}

function parseDataUrlPayload(fileDataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = fileDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL payload');
  }
  const mimeType = match[1];
  const base64Payload = match[2];
  const buffer = Buffer.from(base64Payload, 'base64');
  return { mimeType, buffer };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export default router;
