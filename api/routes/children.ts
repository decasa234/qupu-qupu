import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import {
  GENERIC_USER_ERROR,
  sendPublicError,
  sendValidationError,
} from '../lib/publicError.js'
import { createChild, deleteChild, listChildren, updateChild } from '../services/children.js'

const router = Router()

const createSchema = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  ageGroupId: Joi.string().uuid().allow(null).optional(),
  avatarColor: Joi.string().max(20).allow(null).optional(),
  avatarIcon: Joi.string().pattern(/^[a-z0-9-]+$/).max(40).allow(null).optional(),
  dailyGoalQuizzes: Joi.number().integer().min(1).max(20).optional(),
})

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(80).optional(),
  ageGroupId: Joi.string().uuid().allow(null).optional(),
  avatarColor: Joi.string().max(20).allow(null).optional(),
  avatarIcon: Joi.string().pattern(/^[a-z0-9-]+$/).max(40).allow(null).optional(),
  dailyGoalQuizzes: Joi.number().integer().min(1).max(20).optional(),
}).min(1)

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const children = await listChildren(req.user.id)
    res.json({ success: true, data: { children } })
  } catch (error) {
    console.error('List children error:', error)
    res.status(500).json({ success: false, error: GENERIC_USER_ERROR })
  }
})

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = createSchema.validate(req.body)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const child = await createChild(req.user.id, value)
    res.status(201).json({ success: true, data: { child } })
  } catch (error: unknown) {
    console.error('Create child error:', error)
    sendPublicError(res, error)
  }
})

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = updateSchema.validate(req.body)

    if (error) {
      sendValidationError(res, error)
      return
    }

    const child = await updateChild(req.user.id, req.params.id, value)

    if (!child) {
      // Same status + copy as the 'Child not found' allowlist entry.
      sendPublicError(res, new Error('Child not found'))
      return
    }

    res.json({ success: true, data: { child } })
  } catch (error: unknown) {
    console.error('Update child error:', error)
    sendPublicError(res, error)
  }
})

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteChild(req.user.id, req.params.id)

    if (!deleted) {
      sendPublicError(res, new Error('Child not found'))
      return
    }

    res.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error('Delete child error:', error)
    res.status(500).json({ success: false, error: GENERIC_USER_ERROR })
  }
})

export default router
