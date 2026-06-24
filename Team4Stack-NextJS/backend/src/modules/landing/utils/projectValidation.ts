type ValidationResult =
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; statusCode: number; error: string };

const URL_PATTERN = /^https?:\/\/.+/i;

function trimString(value: unknown): string {
  return String(value ?? '').trim();
}

function isHttpUrl(value: string): boolean {
  return URL_PATTERN.test(value);
}

export function validateProjectWrite(
  body: unknown,
  mode: 'create' | 'update'
): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, statusCode: 400, error: 'Invalid project payload' };
  }

  const raw = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (raw.title !== undefined) patch.title = trimString(raw.title);
  if (raw.description !== undefined) patch.description = trimString(raw.description) || null;
  if (raw.video_id !== undefined) patch.video_id = trimString(raw.video_id) || null;
  if (raw.github_url !== undefined) patch.github_url = trimString(raw.github_url) || null;
  if (raw.image_url !== undefined) patch.image_url = trimString(raw.image_url) || null;
  if (raw.order_index !== undefined) patch.order_index = raw.order_index;

  const title = trimString(patch.title ?? raw.title);
  const imageUrl = trimString(patch.image_url ?? (mode === 'create' ? raw.image_url : undefined));
  const githubUrl = trimString(patch.github_url ?? (mode === 'create' ? raw.github_url : undefined));
  const videoId = trimString(patch.video_id ?? (mode === 'create' ? raw.video_id : undefined));

  if (mode === 'create') {
    if (!title) {
      return { ok: false, statusCode: 400, error: 'Project title is required' };
    }
    if (!imageUrl) {
      return { ok: false, statusCode: 400, error: 'Project thumbnail image URL is required' };
    }
    if (!isHttpUrl(imageUrl)) {
      return { ok: false, statusCode: 400, error: 'Project image URL must start with http:// or https://' };
    }
    if (!githubUrl) {
      return { ok: false, statusCode: 400, error: 'GitHub URL is required' };
    }
    if (!isHttpUrl(githubUrl)) {
      return { ok: false, statusCode: 400, error: 'GitHub URL must start with http:// or https://' };
    }
    if (!videoId) {
      return { ok: false, statusCode: 400, error: 'YouTube video ID or URL is required' };
    }
  } else {
    if (patch.title !== undefined && !title) {
      return { ok: false, statusCode: 400, error: 'Project title cannot be empty' };
    }
    if (patch.image_url !== undefined) {
      if (!imageUrl) {
        return { ok: false, statusCode: 400, error: 'Project thumbnail image URL cannot be empty' };
      }
      if (!isHttpUrl(imageUrl)) {
        return { ok: false, statusCode: 400, error: 'Project image URL must start with http:// or https://' };
      }
    }
    if (patch.github_url !== undefined && githubUrl && !isHttpUrl(githubUrl)) {
      return { ok: false, statusCode: 400, error: 'GitHub URL must start with http:// or https://' };
    }
  }

  return { ok: true, patch };
}
