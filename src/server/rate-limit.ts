/**
 * Lightweight in-memory sliding-window rate limiter (per server instance).
 *
 * Intended for throttling public, unauthenticated read endpoints (e.g. the
 * status lookup) to deter bulk scraping without touching the database. For a
 * multi-instance deployment, back this with a shared store (Redis) instead.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * @param key       Identifier to bucket on (e.g. `status:<ip>`)
 * @param limit     Max allowed requests within the window
 * @param windowMs  Window length in milliseconds
 */
export function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic cleanup so the map can't grow unbounded from idle IPs.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
