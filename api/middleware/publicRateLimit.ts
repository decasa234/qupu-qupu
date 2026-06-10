import { type Request, type Response, type NextFunction } from 'express'
import { clientIp, enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'

// Generous per-IP cap for unauthenticated read endpoints. 120/min is far
// above any legitimate browsing pattern (the SPA batches its public reads)
// but bounds scraping/abuse. Postgres-backed (api/lib/rateLimit.ts), so the
// limit is honest across all Vercel serverless instances.
const PUBLIC_LIMIT = { max: 120, windowSeconds: 60 }

/**
 * Per-IP rate limiter for public route groups.
 *
 * `routeGroup` is intentionally one coarse bucket per mount (e.g. 'public',
 * 'meta') — NOT per path — so the request_rate_limits table holds at most
 * one row per (ip, group) and growth stays bounded.
 *
 * Active in every environment (limits are generous enough for dev). Mirrors
 * the auth limiter's failure mode: a DB error propagates to the 500 handler,
 * which is moot because every public endpoint needs the DB anyway.
 */
export function publicRateLimit(routeGroup: string) {
  const route = `public:${routeGroup}`
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // clientIp prefers Vercel's unspoofable x-vercel-forwarded-for header.
      await enforceRateLimit(`ip:${clientIp(req)}`, route, PUBLIC_LIMIT)
      next()
    } catch (err) {
      if (err instanceof RateLimitError) {
        res.set('Retry-After', String(err.retryAfterSeconds))
        res.status(429).json({
          success: false,
          error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.',
        })
        return
      }
      next(err)
    }
  }
}
