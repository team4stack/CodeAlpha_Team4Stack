export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseMs = 300): Promise<T> {
  let attempt = 0
  let lastErr: any
  while (attempt <= retries) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt === retries) break
      const delay = baseMs * Math.pow(2, attempt)
      await new Promise(res => setTimeout(res, delay))
      attempt++
    }
  }
  throw lastErr
}


