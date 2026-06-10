import { createHash, timingSafeEqual } from 'node:crypto'
import { Router, type Request, type Response } from 'express'
import { sweepExpiredFamilyQuests } from '../services/gamification/familyQuest.js'
import { runMaintenanceCleanup } from '../services/maintenance.js'
import { runDailyNotifications } from '../services/notifications/dispatch.js'

const router = Router()

// Constant-time string compare: hash both sides to equal-length digests so
// timingSafeEqual is usable regardless of input lengths, leaking neither
// length nor prefix-match timing.
function safeEqual(a: string, b: string): boolean {
  const digestA = createHash('sha256').update(a).digest()
  const digestB = createHash('sha256').update(b).digest()
  return timingSafeEqual(digestA, digestB)
}

// All cron endpoints are invoked by Vercel Cron (see vercel.json `crons`).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set
// in the project env; we require it so the endpoints aren't publicly
// runnable. Fail-closed when unset.
function requireCronSecret(req: Request, res: Response): boolean {
  const secret = process.env.CRON_SECRET
  const header = req.headers.authorization
  if (!secret || typeof header !== 'string' || !safeEqual(header, `Bearer ${secret}`)) {
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
// Also sweeps expired-but-earned Misi Keluarga payouts (idempotent: the
// rewarded_at CAS + per-(quest, child) ledger keys absorb re-runs).
router.get('/notifications', async (req: Request, res: Response): Promise<void> => {
  if (!requireCronSecret(req, res)) return

  try {
    const result = await runDailyNotifications()
    const familyQuests = await sweepExpiredFamilyQuests()
    res.json({ success: true, data: { ...result, familyQuests } })
  } catch (err) {
    console.error('Notification run error:', err)
    res.status(500).json({ success: false, error: 'Notification run failed' })
  }
})

export default router
