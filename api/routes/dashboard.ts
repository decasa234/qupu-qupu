import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { getDashboard } from '../services/dashboard.js'

const router = Router()

const querySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = querySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const data = await getDashboard(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Get dashboard error:', err)
    const message = err instanceof Error ? err.message : 'Unable to load dashboard'
    const status = message === 'Child not found' ? 404 : 400
    res.status(status).json({ success: false, error: message })
  }
})

export default router
