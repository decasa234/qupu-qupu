import { Router, type Request, type Response } from 'express'
import { runMaintenanceCleanup } from '../services/maintenance.js'
import { runDailyNotifications } from '../services/notifications/dispatch.js'

const router = Router()

// All cron endpoints are invoked by Vercel Cron (see vercel.json `crons`).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set
// in the project env; we require it so the endpoints aren't publicly
// runnable.
function requireCronSecret(req: Request, res: Response): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return false
  }
  return true
}

router.get('/cleanup', async (req: Request, res: Response): Promise<void> => {
  if (!requireCronSecret(req, res)) return

  try {
    const result = await runMaintenanceCleanup()
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Maintenance cleanup error:', err)
    res.status(500).json({ success: false, error: 'Cleanup failed' })
  }
})

// Daily parent notifications (P2.5): streak-at-risk every evening, weekly
// digest on Mondays. Idempotent per WIB day via notification_log, so a
// same-day re-run returns zero sends instead of double-mailing parents.
router.get('/notifications', async (req: Request, res: Response): Promise<void> => {
  if (!requireCronSecret(req, res)) return

  try {
    const result = await runDailyNotifications()
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Notification run error:', err)
    res.status(500).json({ success: false, error: 'Notification run failed' })
  }
})

export default router
