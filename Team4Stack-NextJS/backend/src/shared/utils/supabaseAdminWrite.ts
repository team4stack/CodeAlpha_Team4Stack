import { supabaseAdmin } from '../../config/supabase';

export type HttpStatusError = Error & { status?: number };

export function notFoundError(message: string): HttpStatusError {
  const e = new Error(message) as HttpStatusError;
  e.status = 404;
  return e;
}

export function badRequestError(message: string): HttpStatusError {
  const e = new Error(message) as HttpStatusError;
  e.status = 400;
  return e;
}

export function pickAllowedKeys(body: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const raw = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const k of keys) {
    if (raw[k] !== undefined) patch[k] = raw[k];
  }
  return patch;
}

export function shouldRetryUpdateWithoutUpdatedAt(err: { message?: string; code?: string } | null | undefined): boolean {
  if (!err) return false;
  const m = String(err.message || '').toLowerCase();
  return m.includes('updated_at') || err.code === 'PGRST204';
}

/**
 * Update row by id with optional updated_at; retry without timestamp if column missing.
 * Empty patch returns existing row or 404.
 */
export async function updateByIdWithTimestampRetry(
  table: string,
  id: number | string,
  patch: Record<string, unknown>,
  options: { notFoundMessage?: string; idColumn?: string } = {}
): Promise<Record<string, unknown>> {
  const idColumn = options.idColumn ?? 'id';
  const notFoundMessage = options.notFoundMessage ?? 'Record not found';

  if (Object.keys(patch).length === 0) {
    const { data, error } = await supabaseAdmin.from(table).select('*').eq(idColumn, id).maybeSingle();
    if (error) throw error;
    if (!data) throw notFoundError(notFoundMessage);
    return data as Record<string, unknown>;
  }

  const stamp = new Date().toISOString();
  let { data, error } = await supabaseAdmin
    .from(table)
    .update({ ...patch, updated_at: stamp })
    .eq(idColumn, id)
    .select()
    .maybeSingle();

  if (error && shouldRetryUpdateWithoutUpdatedAt(error)) {
    ({ data, error } = await supabaseAdmin
      .from(table)
      .update(patch)
      .eq(idColumn, id)
      .select()
      .maybeSingle());
  }

  if (error) throw error;
  if (!data) throw notFoundError(notFoundMessage);
  return data as Record<string, unknown>;
}
