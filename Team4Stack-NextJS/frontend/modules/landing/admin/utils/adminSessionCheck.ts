/** When true, `checkAdminByEmail` likely failed for infra — not because the user lost admin rights. */
export function isTransientAdminDirectoryError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes('timed out') ||
    m.includes('timeout') ||
    m.includes('server error') ||
    m.includes('try again later') ||
    m.includes('not reachable') ||
    m.includes('unable to reach') ||
    m.includes('unable to connect') ||
    m.includes('connection refused') ||
    m.includes('failed to fetch') ||
    m.includes('network') ||
    m.includes('load failed') ||
    m.includes('econnrefused') ||
    m.includes('err_network') ||
    m.includes('too many requests') ||
    m.includes('rate limit') ||
    m.includes('503') ||
    m.includes('502') ||
    m.includes('504') ||
    m.includes('request failed after retries') ||
    m.includes('api server not reachable')
  );
}
