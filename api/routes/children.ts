import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { createChild, deleteChild, listChildren, updateChild } from '../services/children.js'

const router = Router()

const createSchema = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  ageGroupId: Joi.string().uuid().allow(null).optional(),
  avatarColor: Joi.string().max(20).allow(null).optional(),
  dailyGoalQuizzes: Joi.number().integer().min(1).max(20).optional(),
})

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(80).optional(),
  ageGroupId: Joi.string().uuid().allow(null).optional(),
  avatarColor: Joi.string().max(20).allow(null).optional(),
  dailyGoalQuizzes: Joi.number().integer().min(1).max(20).optional(),
}).min(1)

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const children = await listChildren(req.user.id)
    res.json({ success: true, data: { children } })
  } catch (error) {
    console.error('List children error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = createSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const child = await createChild(req.user.id, value)
    res.status(201).json({ success: true, data: { child } })
  } catch (error: unknown) {
    console.error('Create child error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to create child',
    })
  }
})

router.patch('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = updateSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const child = await updateChild(req.user.id, req.params.id, value)

    if (!child) {
      res.status(404).json({ success: false, error: 'Child not found' })
      return
    }

    res.json({ success: true, data: { child } })
  } catch (error: unknown) {
    console.error('Update child error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update child',
    })
  }
})

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteChild(req.user.id, req.params.id)

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Child not found' })
      return
    }

    res.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error('Delete child error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
