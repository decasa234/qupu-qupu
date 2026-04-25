import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { createVideo, deleteVideo, listAdminVideos, updateVideo } from '../services/videos.js'

const router = Router()

const badgeRuleSchema = Joi.object({
  tier: Joi.number().valid(1, 2, 3).required(),
  minCorrect: Joi.number().integer().min(0).required(),
  maxCorrect: Joi.number().integer().min(0).allow(null).required(),
})

const videoSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().allow('', null),
  youtubeUrl: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().allow('', null),
  subjectId: Joi.string().uuid().required(),
  ageGroupId: Joi.string().uuid().required(),
  badgeFamilyId: Joi.string().uuid().required(),
  numberOfQuestions: Joi.number().integer().min(1).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  description: Joi.string().allow('', null),
  isPublished: Joi.boolean().required(),
  isFeatured: Joi.boolean().required(),
  sortOrder: Joi.number().integer().min(0).required(),
  badgeRules: Joi.array().items(badgeRuleSchema).length(3).required(),
})

router.use(authenticateToken, requireAdmin)

router.get('/videos', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const videos = await listAdminVideos()
    res.json({ success: true, data: { videos } })
  } catch (error) {
    console.error('Admin list videos error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/videos', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = videoSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const video = await createVideo(value)
    res.status(201).json({ success: true, data: video })
  } catch (error: unknown) {
    console.error('Admin create video error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to create video',
    })
  }
})

router.put('/videos/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = videoSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const video = await updateVideo(req.params.id, value)

    if (!video) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    res.json({ success: true, data: video })
  } catch (error: unknown) {
    console.error('Admin update video error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update video',
    })
  }
})

router.delete('/videos/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteVideo(req.params.id)

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    res.json({ success: true, message: 'Video deleted' })
  } catch (error) {
    console.error('Admin delete video error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
