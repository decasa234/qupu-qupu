import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { sendPublicError, sendValidationError } from '../lib/publicError.js'
import { getDashboard } from '../services/dashboard.js'

const router = Router()

const querySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = querySchema.validate(req.query)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const data = await getDashboard(req.user.id, value.childId)
    res.json({ success: true, data })
  } catch (err: unknown) {
    console.error('Get dashboard error:', err)
    // 'Child not found' keeps its historical 404 via the shared allowlist;
    // anything else becomes the generic Indonesian 400.
    sendPublicError(res, err)
  }
})

export default router
