import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import {
  getMemberAchievements,
  getMemberBadges,
  getMemberProgress,
  getMemberVideoScore,
  submitVideoScore,
  useStreakRecoveryForChild,
} from '../services/member.js'
import { logSessionEvent } from '../services/sessionEvents.js'
import {
  getOrCreateReferralCode,
  recordReferralUse,
} from '../services/referrals.js'

const router = Router()

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
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load progress',
    })
  }
})

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
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load badges',
    })
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
      res.status(400).json({
        success: false,
        error: lookupError instanceof Error ? lookupError.message : 'Unable to load score',
      })
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
      console.error('Generate referral code error:', refError)
      res.status(500).json({
        success: false,
        error: refError instanceof Error ? refError.message : 'Unable to generate code',
      })
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
      const { error, value } = referralUseSchema.validate(req.body)
      if (error) {
        // Bad code shape is still "recorded:false" semantics — don't 400.
        res.json({ success: true, data: { recorded: false, reason: 'invalid_code' } })
        return
      }
      const outcome = await recordReferralUse(req.user.id, value.code)
      res.json({ success: true, data: outcome })
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

export default router
