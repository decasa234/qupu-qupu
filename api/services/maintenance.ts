// api/services/maintenance.ts
//
// Periodic cleanup of rows that are only ever overwritten/replaced lazily and
// would otherwise accumulate forever. Invoked by the GET /api/cron/cleanup
// route (Vercel Cron, see vercel.json).

import { query } from '../db.js'
import { purgeExpiredPendingRegistrations } from './registration.js'

export interface MaintenanceResult {
  rateLimitRowsDeleted: number
}

export async function runMaintenanceCleanup(): Promise<MaintenanceResult> {
  // Expired OTP staging rows (older than their 7-day grace).
  await purgeExpiredPendingRegistrations()

  // Rate-limit counters are only rewritten on the next request for the same
  // key; idle keys (IPs/emails that never return) linger. Drop any whose
  // window ended over a day ago — far past every configured window.
  const rows = await query<{ limit_key: string }>(
    `DELETE FROM request_rate_limits
       WHERE window_started_at < NOW() - INTERVAL '24 hours'
       RETURNING limit_key`,
  )

  return { rateLimitRowsDeleted: rows.length }
}
