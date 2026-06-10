// api/routes/shop.ts
//
// Three endpoints:
//   GET  /api/shop/items?childId=X
//   POST /api/shop/purchase   body { childId, itemId }
//   GET  /api/me/inventory?childId=X
//
// All require authentication; childId must belong to the authenticated
// user. Validation via Joi.

import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'
import { queryOne } from '../db.js'
import { listItemsForChild } from '../services/shop/catalog.js'
import { listInventory } from '../services/shop/inventory.js'
import { purchaseItem } from '../services/shop/purchase.js'

const router = Router()
router.use(authenticateToken)

const childIdQuery = Joi.object({ childId: Joi.string().uuid().required() })

async function assertChildBelongsToUser(childId: string, userId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM children WHERE id = $1 AND parent_user_id = $2`,
    [childId, userId],
  )
  return Boolean(row)
}

router.get('/items', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = childIdQuery.validate(req.query)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const childId = value.childId as string
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const items = await listItemsForChild(childId)
  res.json({ success: true, data: { items } })
})

const purchaseBody = Joi.object({
  childId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
})

router.post('/purchase', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = purchaseBody.validate(req.body)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const { childId, itemId } = value as { childId: string; itemId: string }
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const result = await purchaseItem(childId, itemId)
  switch (result.status) {
    case 'purchased':
    case 'already_owned':
      res.json({ success: true, data: result }); return
    case 'insufficient_funds':
      res.status(400).json({ success: false, error: 'Insufficient coins', data: result }); return
    case 'shield_cap':
      res.status(400).json({
        success: false,
        error: 'Pelindung Streak kamu sudah penuh (maksimal 2). Pakai dulu sebelum beli lagi.',
        data: result,
      }); return
    case 'not_found':
      res.status(404).json({ success: false, error: 'Item not found' }); return
    case 'not_available':
      res.status(404).json({ success: false, error: 'Item not available' }); return
  }
})

export const inventoryRouter = Router()
inventoryRouter.use(authenticateToken)
inventoryRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { value, error } = childIdQuery.validate(req.query)
  if (error) { res.status(400).json({ success: false, error: error.message }); return }
  const childId = value.childId as string
  const userId = (req as Request & { user?: { id: string } }).user!.id
  if (!(await assertChildBelongsToUser(childId, userId))) {
    res.status(403).json({ success: false, error: 'Child does not belong to user' }); return
  }
  const items = await listInventory(childId)
  res.json({ success: true, data: { items } })
})

export default router
