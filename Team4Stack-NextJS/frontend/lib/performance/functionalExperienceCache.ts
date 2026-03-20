import { canUseFunctionalCookies } from '@/lib/cookies/consent';

const SS_PREFIX = 't4s_perf_v1_';
const MAX_SESSION_STORAGE_ENTRY = 120_000;

type CachedEnvelope<T> = { exp: number; payload: T };

const memory = new Map<string, CachedEnvelope<unknown>>();

function storageKey(cacheKey: string): string {
  return `${SS_PREFIX}${cacheKey}`;
}

/** Drop all functional perf cache (memory + our sessionStorage keys). Call when user chooses necessary/reject. */
export function clearFunctionalPublicCaches(): void {
  memory.clear();
  if (typeof window === 'undefined') return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(SS_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * Short-lived cache for successful public GET responses when user chose Accept all.
 * Reduces repeat network work on navigation / re-mounts.
 */
export async function cachedPublicGet<T extends { success?: boolean }>(
  cacheKey: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!canUseFunctionalCookies()) {
    return fetcher();
  }

  const now = Date.now();
  const memHit = memory.get(cacheKey) as CachedEnvelope<T> | undefined;
  if (memHit && memHit.exp > now) {
    return memHit.payload;
  }

  try {
    const raw = sessionStorage.getItem(storageKey(cacheKey));
    if (raw) {
      const parsed = JSON.parse(raw) as CachedEnvelope<T>;
      if (parsed.exp > now && parsed.payload) {
        memory.set(cacheKey, parsed as CachedEnvelope<unknown>);
        return parsed.payload;
      }
    }
  } catch {
    // ignore
  }

  const fresh = await fetcher();
  const ok = fresh && typeof fresh === 'object' && (fresh as { success?: boolean }).success === true;
  if (!ok) {
    return fresh;
  }

  const exp = now + ttlMs;
  const env: CachedEnvelope<T> = { exp, payload: fresh };
  memory.set(cacheKey, env as CachedEnvelope<unknown>);

  try {
    const serialized = JSON.stringify(env);
    if (serialized.length <= MAX_SESSION_STORAGE_ENTRY) {
      sessionStorage.setItem(storageKey(cacheKey), serialized);
    }
  } catch {
    // quota / private mode
  }

  return fresh;
}
