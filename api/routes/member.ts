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
import { claimQuestReward, getDailyQuestsForChild } from '../services/gamification/quests.js'
import { getFamilyLeaderboard } from '../services/gamification/familyLeaderboard.js'
import { getFamilyQuestStatus } from '../services/gamification/familyQuest.js'
import { logSessionEvent } from '../services/sessionEvents.js'
import {
  getOrCreateReferralCode,
  recordReferralUse,
} from '../services/referrals.js'
import { enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'
import { sendPublicError, sendValidationError } from '../lib/publicError.js'

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
      sendValidationError(res, error)
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
    sendPublicError(res, error)
  }
})

router.get('/gamification', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const data = await getGamificationSummary(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Get gamification summary error:', error)
    sendPublicError(res, error)
  }
})

// "Misi Hari Ini" — ensures today's quest instances exist, then returns
// them for the daily-quest panel (garden top card + first dashboard card).
router.get('/quests', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const data = await getDailyQuestsForChild(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Get daily quests error:', error)
    sendPublicError(res, error)
  }
})

const questIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
}).unknown(true)

// Claim ritual (P2.2): the ONLY place quest rewards move balances. Ownership
// is derived from the instance's child inside the service (the child must
// belong to the authenticated parent); double-taps return alreadyClaimed.
router.post(
  '/quests/:id/claim',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = questIdParamSchema.validate(req.params)
      if (error) {
        sendValidationError(res, error)
        return
      }
      const data = await claimQuestReward(req.user.id, value.id)
      res.json({ success: true, data })
    } catch (claimError: unknown) {
      console.error('Quest claim error:', claimError)
      sendPublicError(res, claimError)
    }
  },
)

// ── Family surfaces (P2.3) — ACCOUNT-scoped: parent auth only, no childId.
// Both are account-private by construction (only the authenticated parent's
// own children appear), which is what keeps them COPPA-safe.

// "Papan Keluarga" — this account's children ranked by this WIB week's XP.
router.get(
  '/family/leaderboard',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await getFamilyLeaderboard(req.user.id)
      res.json({ success: true, data })
    } catch (leaderboardError: unknown) {
      console.error('Get family leaderboard error:', leaderboardError)
      sendPublicError(res, leaderboardError)
    }
  },
)

// "Misi Keluarga" — this week's co-op quest. Lazily creates the quest for
// >= 2-children accounts and settles completion + payout when due.
router.get(
  '/family/quest',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await getFamilyQuestStatus(req.user.id)
      res.json({ success: true, data })
    } catch (questError: unknown) {
      console.error('Get family quest error:', questError)
      sendPublicError(res, questError)
    }
  },
)

router.get('/progress', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const data = await getMemberProgress(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (error: unknown) {
    console.error('Get progress error:', error)
    sendPublicError(res, error)
  }
})

router.get(
  '/watched-video-ids',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childIdQuerySchema.validate(req.query)

      if (error) {
        sendValidationError(res, error)
        return
      }

      const videoIds = await getWatchedVideoIds(req.user.id, value.childId)
      res.json({ success: true, data: { videoIds } })
    } catch (watchedError: unknown) {
      console.error('Get watched video ids error:', watchedError)
      sendPublicError(res, watchedError)
    }
  },
)

router.get('/badges', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childIdQuerySchema.validate(req.query)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const families = await getMemberBadges(req.user.id, value.childId)
    res.json({ success: true, data: { families } })
  } catch (error: unknown) {
    console.error('Get badges error:', error)
    sendPublicError(res, error)
  }
})

router.get(
  '/video-scores',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = videoScoreLookupSchema.validate(req.query)

      if (error) {
        sendValidationError(res, error)
        return
      }

      const data = await getMemberVideoScore(req.user.id, value.childId, value.videoId)
      res.json({ success: true, data })
    } catch (lookupError: unknown) {
      console.error('Get video score error:', lookupError)
      sendPublicError(res, lookupError)
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
        sendValidationError(res, error)
        return
      }
      const data = await getMemberAchievements(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (achError: unknown) {
      console.error('Get achievements error:', achError)
      sendPublicError(res, achError)
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
        sendValidationError(res, error)
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
      sendPublicError(res, eventError)
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
      res.status(500).json({ success: false, error: 'Gagal membuat kode referral. Coba lagi.' })
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
        sendValidationError(res, error)
        return
      }
      const data = await useStreakRecoveryForChild(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (recoveryError: unknown) {
      console.error('Streak recovery error:', recoveryError)
      sendPublicError(res, recoveryError)
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
        sendValidationError(res, error)
        return
      }
      const data = await claimLoginBonusForChild(req.user.id, value.childId)
      res.json({ success: true, data })
    } catch (bonusError: unknown) {
      console.error('Login bonus claim error:', bonusError)
      sendPublicError(res, bonusError)
    }
  },
)

export default router
