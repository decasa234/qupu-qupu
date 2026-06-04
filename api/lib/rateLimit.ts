import { query } from '../db.js'

export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

export interface RateLimitOptions {
  max: number
  windowSeconds: number
}

interface RateLimitRow {
  count: number
  window_started_at: string
}

/**
 * Atomic fixed-window rate limiter backed by Postgres.
 *
 * Increments the counter for (key, route); resets the window when the stored
 * window_started_at is older than `windowSeconds`. Throws RateLimitError once
 * the window's count exceeds `max`.
 *
 * `key` is any opaque string — a user id (admin routes) or an IP/email/pending
 * derived key (auth + analytics). Living in Postgres (instead of an in-process
 * Map) makes the limit honest across all Vercel serverless instances.
 */
export async function enforceRateLimit(
  key: string,
  route: string,
  options: RateLimitOptions = { max: 30, windowSeconds: 60 },
): Promise<{ count: number; remaining: number }> {
  const interval = `${options.windowSeconds} seconds`
  const rows = await query<RateLimitRow>(
    `
      INSERT INTO request_rate_limits (limit_key, route, window_started_at, count)
      VALUES ($1, $2, NOW(), 1)
      ON CONFLICT (limit_key, route)
      DO UPDATE SET
        count = CASE
          WHEN request_rate_limits.window_started_at < NOW() - $3::interval
          THEN 1
          ELSE request_rate_limits.count + 1
        END,
        window_started_at = CASE
          WHEN request_rate_limits.window_started_at < NOW() - $3::interval
          THEN NOW()
          ELSE request_rate_limits.window_started_at
        END
      RETURNING count, window_started_at
    `,
    [key, route, interval],
  )

  const row = rows[0]
  if (!row) {
    throw new Error('Rate limit query returned no row')
  }

  if (row.count > options.max) {
    const windowStart = new Date(row.window_started_at).getTime()
    const windowEnd = windowStart + options.windowSeconds * 1000
    const retryAfter = Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000))
    throw new RateLimitError(retryAfter)
  }

  return { count: row.count, remaining: Math.max(0, options.max - row.count) }
}
