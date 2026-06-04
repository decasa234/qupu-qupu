import { Router, type Request, type Response } from 'express'
import { runMaintenanceCleanup } from '../services/maintenance.js'

const router = Router()

// Maintenance cleanup, invoked by Vercel Cron (see vercel.json `crons`).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set
// in the project env; we require it so the endpoint isn't publicly runnable.
router.get('/cleanup', async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  try {
    const result = await runMaintenanceCleanup()
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Maintenance cleanup error:', err)
    res.status(500).json({ success: false, error: 'Cleanup failed' })
  }
})

export default router
