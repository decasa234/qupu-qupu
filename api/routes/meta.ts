import { Router, type Request, type Response } from 'express'
import { listMeta } from '../services/videos.js'

const router = Router()

router.get('/subjects', async (_req: Request, res: Response): Promise<void> => {
  try {
    const meta = await listMeta()
    res.json({ success: true, data: meta.subjects })
  } catch (error) {
    console.error('Get subjects error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/age-groups', async (_req: Request, res: Response): Promise<void> => {
  try {
    const meta = await listMeta()
    res.json({ success: true, data: meta.ageGroups })
  } catch (error) {
    console.error('Get age groups error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
