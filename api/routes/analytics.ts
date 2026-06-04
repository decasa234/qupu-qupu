import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { verifyToken } from '../lib/jwt.js'
import { enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'
import { logEvent } from '../services/analytics.js'

const router = Router()

// Cap on serialized metadata size. This endpoint is unauthenticated, so bound
// what an anonymous caller can write into analytics_events.
const MAX_METADATA_BYTES = 4_000

const eventSchema = Joi.object({
  eventName: Joi.string().min(1).max(80).required(),
  sessionId: Joi.string().allow(null, '').max(80),
  path: Joi.string().allow(null, '').max(500),
  metadata: Joi.object().unknown(true).allow(null),
})

router.post('/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = eventSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    if (
      value.metadata &&
      JSON.stringify(value.metadata).length > MAX_METADATA_BYTES
    ) {
      res.status(400).json({ success: false, error: 'metadata too large' })
      return
    }

    // Rate-limit per client IP (endpoint is unauthenticated). Fail OPEN on a
    // limiter DB error — analytics is best-effort and must not block on infra.
    try {
      await enforceRateLimit(
        `analytics-ip:${req.ip ?? 'unknown'}`,
        'analytics:events',
        { max: 120, windowSeconds: 60 },
      )
    } catch (limitErr) {
      if (limitErr instanceof RateLimitError) {
        res.set('Retry-After', String(limitErr.retryAfterSeconds))
        res.status(429).json({ success: false, error: 'Too many requests' })
        return
      }
      console.error('Analytics rate-limit check failed (allowing):', limitErr)
    }

    let userId: string | null = null
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (token) {
      try {
        const decoded = verifyToken<{ id?: string }>(token)
        if (decoded?.id) userId = decoded.id
      } catch {
        // anonymous fallback
      }
    }

    await logEvent({
      eventName: value.eventName,
      sessionId: value.sessionId || null,
      userId,
      path: value.path || null,
      metadata: value.metadata ?? null,
    })

    res.status(204).send()
  } catch (logError) {
    console.error('Analytics log error:', logError)
    res.status(204).send()
  }
})

export default router
