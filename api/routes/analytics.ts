import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import { logEvent } from '../services/analytics.js'

const router = Router()

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

    let userId: string | null = null
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id?: string }
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
