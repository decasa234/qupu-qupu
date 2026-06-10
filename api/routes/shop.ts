// api/routes/shop.ts
//
// Three endpoints:
//   GET  /api/shop/items?childId=X
//   POST /api/shop/purchase   body { childId, itemId }
//   GET  /api/me/inventory?childId=X
//
// All require authentication; childId must belong to the authenticated
// user. Validation via Joi. Error bodies are Indonesian (P1.3 helpers);
// the FE purchase flow branches on `data.status`, never on error text,
// so the structured `data` payloads below must stay intact.

import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'
import { queryOne } from '../db.js'
import { sendPublicError, sendValidationError } from '../lib/publicError.js'
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

// 403 + Indonesian copy from the shared allowlist (publicError.ts).
function sendChildOwnershipError(res: Response): void {
  sendPublicError(res, new Error('Child does not belong to user'))
}

router.get('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, error } = childIdQuery.validate(req.query)
    if (error) { sendValidationError(res, error); return }
    const childId = value.childId as string
    const userId = (req as Request & { user?: { id: string } }).user!.id
    if (!(await assertChildBelongsToUser(childId, userId))) {
      sendChildOwnershipError(res); return
    }
    const items = await listItemsForChild(childId)
    res.json({ success: true, data: { items } })
  } catch (err) {
    console.error('Shop items error:', err)
    sendPublicError(res, err)
  }
})

const purchaseBody = Joi.object({
  childId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
})

router.post('/purchase', async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, error } = purchaseBody.validate(req.body)
    if (error) { sendValidationError(res, error); return }
    const { childId, itemId } = value as { childId: string; itemId: string }
    const userId = (req as Request & { user?: { id: string } }).user!.id
    if (!(await assertChildBelongsToUser(childId, userId))) {
      sendChildOwnershipError(res); return
    }
    const result = await purchaseItem(childId, itemId)
    switch (result.status) {
      case 'purchased':
      case 'already_owned':
        res.json({ success: true, data: result }); return
      case 'insufficient_funds':
        // `data` carries the structured result — the FE branches on
        // data.status, the error string is display copy only.
        res.status(400).json({
          success: false,
          error: 'Koinmu belum cukup untuk item ini.',
          data: result,
        }); return
      case 'shield_cap':
        res.status(400).json({
          success: false,
          error: 'Pelindung Streak kamu sudah penuh (maksimal 2). Pakai dulu sebelum beli lagi.',
          data: result,
        }); return
      case 'not_found':
        res.status(404).json({ success: false, error: 'Item tidak ditemukan.' }); return
      case 'not_available':
        res.status(404).json({ success: false, error: 'Item ini sedang tidak tersedia.' }); return
    }
  } catch (err) {
    console.error('Shop purchase error:', err)
    sendPublicError(res, err)
  }
})

export const inventoryRouter = Router()
inventoryRouter.use(authenticateToken)
inventoryRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, error } = childIdQuery.validate(req.query)
    if (error) { sendValidationError(res, error); return }
    const childId = value.childId as string
    const userId = (req as Request & { user?: { id: string } }).user!.id
    if (!(await assertChildBelongsToUser(childId, userId))) {
      sendChildOwnershipError(res); return
    }
    const items = await listInventory(childId)
    res.json({ success: true, data: { items } })
  } catch (err) {
    console.error('Inventory error:', err)
    sendPublicError(res, err)
  }
})

export default router
