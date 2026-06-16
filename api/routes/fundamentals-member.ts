import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { getLesson, getOutline } from '../services/fundamentals/lessons.js'
import { markComplete } from '../services/fundamentals/progress.js'

const router = Router()

const childQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

const slugRule = Joi.string().pattern(/^[a-z0-9-]+$/)

const progressSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  lesson_slug: slugRule.required(),
  check_correct: Joi.number().integer().min(0).optional(),
  check_total: Joi.number().integer().min(0).optional(),
})

function sendError(res: Response, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : fallback
  const status =
    message === 'Child not found' || message === 'Lesson not found' ? 404 : 400
  res.status(status).json({ success: false, error: message })
}

router.get('/outline', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const outline = await getOutline(req.user.id, value.childId)
    res.json({ success: true, data: outline })
  } catch (error) {
    console.error('Fundamentals outline error:', error)
    sendError(res, error, 'Unable to load course')
  }
})

router.get('/lessons/:slug', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const lesson = await getLesson(req.user.id, value.childId, req.params.slug)
    // A locked lesson never ships its blocks — the page bounces to the outline.
    if (lesson.locked) {
      res.json({ success: true, data: { locked: true, slug: lesson.slug } })
      return
    }
    res.json({ success: true, data: lesson })
  } catch (error) {
    console.error('Fundamentals lesson error:', error)
    sendError(res, error, 'Unable to load lesson')
  }
})

router.post('/progress', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = progressSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const outline = await markComplete(req.user.id, {
      childId: value.childId,
      lessonSlug: value.lesson_slug,
      checkCorrect: value.check_correct,
      checkTotal: value.check_total,
    })
    res.status(201).json({ success: true, data: outline })
  } catch (error) {
    console.error('Fundamentals progress error:', error)
    sendError(res, error, 'Unable to save progress')
  }
})

export default router
