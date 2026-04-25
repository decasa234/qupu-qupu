import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { getMemberBadges, getMemberProgress, submitVideoScore } from '../services/member.js'

const router = Router()

const scoreSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  videoId: Joi.string().uuid().required(),
  correctAnswers: Joi.number().integer().min(0).required(),
})

const childIdQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
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

export default router
