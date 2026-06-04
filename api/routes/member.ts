import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import {
  claimLoginBonusForChild,
  getMemberAchievements,
  getMemberBadges,
  getMemberProgress,
  getMemberVideoScore,
  getWatchedVideoIds,
  submitVideoScore,
  useStreakRecoveryForChild,
} from '../services/member.js'
import { getGamificationSummary } from '../services/gamification/summary.js'
import { logSessionEvent } from '../services/sessionEvents.js'
import {
  getOrCreateReferralCode,
  recordReferralUse,
} from '../services/referrals.js'
import { enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'

const router = Router()

// Maps a thrown service error to an HTTP status. Ownership failures
// ('Child not found') are 404 everywhere; everything else is a 400.
function statusForError(message: string): number {
  return message === 'Child not found' ? 404 : 400
}

const scoreSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  videoId: Joi.string().uuid().required(),
  correctAnswers: Joi.number().integer().min(0).required(),
})

const childIdQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

const videoScoreLookupSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  videoId: Joi.string().uuid().required(),
}).unknown(true)

router.post('/video-scores', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = scoreSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const result = await submitVideoScore({
      userId: req.user.id,
      childId: value.childId,
      videoId: value.videoId,
      correctAnswers: value.correctAnswers,
    })

    res.status(201).json({ success: true, data: result })
  } catch (error: unknown) {
    console.error('Submit video score error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to save score',
    })
  }
})

router.get('/gamification', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const data = await getGamificationSummary(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Get gamification summary error:', error)
    const message = error instanceof Error ? error.message : 'Unable to load gamification'
    res.status(statusForError(message)).json({ success: false, error: message })
  }
})

router.get('/progress', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const data = await getMemberProgress(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Get progress error:', error)
    const message = error instanceof Error ? error.message : 'Unable to load progress'
    res.status(statusForError(message)).json({ success: false, error: message })
  }
})

router.get(
  '/watched-video-ids',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childIdQuerySchema.validate(req.query)

      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }

      const videoIds = await getWatchedVideoIds(req.user.id, value.childId)
      res.json({ success: true, data: { videoIds } })
    } catch (watchedError: unknown) {
      console.error('Get watched video ids error:', watchedError)
      const message =
        watchedError instanceof Error ? watchedError.message : 'Unable to load watched videos'
      const status = message === 'Child not found' ? 404 : 400
      res.status(status).json({ success: false, error: message })
    }
  },
)

router.get('/badges', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const families = await getMemberBadges(req.user.id, value.childId)
    res.json({ success: true, data: { families } })
  } catch (error: unknown) {
    console.error('Get badges error:', error)
    const message = error instanceof Error ? error.message : 'Unable to load badges'
    res.status(statusForError(message)).json({ success: false, error: message })
  }
})

router.get(
  '/video-scores',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = videoScoreLookupSchema.validate(req.query)

      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }

      const data = await getMemberVideoScore(req.user.id, value.childId, value.videoId)
      res.json({ success: true, data })
    } catch (lookupError: unknown) {
      console.error('Get video score error:', lookupError)
      const message = lookupError instanceof Error ? lookupError.message : 'Unable to load score'
      res.status(statusForError(message)).json({ success: false, error: message })
    }
  },
)

router.get(
  '/achievements',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childIdQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const data = await getMemberAchievements(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (achError: unknown) {
      console.error('Get achievements error:', achError)
      const message =
        achError instanceof Error ? achError.message : 'Unable to load achievements'
      const status = message === 'Child not found' ? 404 : 400
      res.status(status).json({ success: false, error: message })
    }
  },
)

const sessionEventSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  eventKind: Joi.string()
    .valid('video_open', 'video_close', 'quiz_start', 'quiz_submit', 'dashboard_open')
    .required(),
  videoId: Joi.string().uuid().allow(null).optional(),
  durationMs: Joi.number().integer().min(0).max(24 * 60 * 60 * 1000).optional(),
  metadata: Joi.object().unknown(true).optional(),
})

router.post(
  '/sessions/event',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = sessionEventSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      await logSessionEvent(req.user.id, value)
      // Always 204 on success — clients fire-and-forget; we don't echo back
      // anything they can act on.
      res.status(204).end()
    } catch (eventError: unknown) {
      // Session-event failures must NEVER bubble visibly to the kid's flow.
      // Log them, return success=false silently, and continue.
      console.error('Session event log error:', eventError)
      const message =
        eventError instanceof Error ? eventError.message : 'Unable to log session event'
      const status = message === 'Child not found' ? 404 : 400
      res.status(status).json({ success: false, error: message })
    }
  },
)

router.post(
  '/referrals/generate',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await getOrCreateReferralCode(req.user.id)
      res.json({ success: true, data: result })
    } catch (refError: unknown) {
      // Don't leak internal error detail (e.g. the retry-exhausted message).
      console.error('Generate referral code error:', refError)
      res.status(500).json({ success: false, error: 'Unable to generate code' })
    }
  },
)

const referralUseSchema = Joi.object({
  code: Joi.string().alphanum().min(4).max(20).required(),
})

router.post(
  '/referrals/use',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Rate-limit per user so a valid code cannot be probed in bulk.
      try {
        await enforceRateLimit(req.user.id, 'referrals:use', { max: 10, windowSeconds: 3600 })
      } catch (limitErr) {
        if (limitErr instanceof RateLimitError) {
          res.set('Retry-After', String(limitErr.retryAfterSeconds))
          res.status(429).json({ success: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.' })
          return
        }
        throw limitErr
      }

      const { error, value } = referralUseSchema.validate(req.body)
      if (error) {
        // Bad code shape is still "recorded:false" semantics — don't 400.
        res.json({ success: true, data: { recorded: false, reason: 'invalid_code' } })
        return
      }
      const outcome = await recordReferralUse(req.user.id, value.code)
      // Only surface whether it was recorded — never echo the referrer's
      // internal user id (it would turn a valid code into a UUID-disclosure oracle).
      res.json({ success: true, data: { recorded: outcome.recorded } })
    } catch (refError: unknown) {
      // Defensive: a referral failure must NEVER bubble visibly.
      console.error('Record referral use error:', refError)
      res.json({ success: true, data: { recorded: false, reason: 'invalid_code' } })
    }
  },
)

const recoverySchema = Joi.object({
  childId: Joi.string().uuid().required(),
})

router.post(
  '/streak-recovery',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = recoverySchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const data = await useStreakRecoveryForChild(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (recoveryError: unknown) {
      console.error('Streak recovery error:', recoveryError)
      const message =
        recoveryError instanceof Error ? recoveryError.message : 'Unable to recover streak'
      const status = message === 'Child not found' ? 404 : 400
      res.status(status).json({ success: false, error: message })
    }
  },
)

const loginBonusSchema = Joi.object({
  childId: Joi.string().uuid().required(),
})

router.post(
  '/login-bonus',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = loginBonusSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const data = await claimLoginBonusForChild(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (bonusError: unknown) {
      console.error('Login bonus claim error:', bonusError)
      const message =
        bonusError instanceof Error ? bonusError.message : 'Unable to claim login bonus'
      const status = message === 'Child not found' ? 404 : 400
      res.status(status).json({ success: false, error: message })
    }
  },
)

export default router
