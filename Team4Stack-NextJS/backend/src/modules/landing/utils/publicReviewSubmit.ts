function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export type ParsedPublicReview = {
  name: string;
  address: string;
  rating: number;
  comment: string;
};

export type ParsePublicReviewResult =
  | { ok: true; value: ParsedPublicReview }
  | { ok: false; statusCode: number; error: string };

/**
 * Validates body for anonymous / public landing review submission (always moderated as pending server-side).
 */
export function parsePublicLandingReviewBody(body: unknown): ParsePublicReviewResult {
  const raw = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

  const name = normalizeText(raw.name);
  const address = normalizeText(raw.address);
  const comment = normalizeText(raw.comment);
  const ratingRaw = raw.rating;
  const rating =
    typeof ratingRaw === 'number' && Number.isFinite(ratingRaw)
      ? ratingRaw
      : Number.parseInt(String(ratingRaw ?? ''), 10);

  if (!name || name.length < 2 || name.length > 120) {
    return { ok: false, statusCode: 400, error: 'Name must be between 2 and 120 characters' };
  }
  if (!address || address.length < 2 || address.length > 200) {
    return { ok: false, statusCode: 400, error: 'Location must be between 2 and 200 characters' };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, statusCode: 400, error: 'Rating must be between 1 and 5' };
  }
  if (!comment || comment.length < 10 || comment.length > 2000) {
    return { ok: false, statusCode: 400, error: 'Review text must be between 10 and 2000 characters' };
  }

  return { ok: true, value: { name, address, rating, comment } };
}
