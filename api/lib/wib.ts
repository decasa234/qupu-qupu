// api/lib/wib.ts
//
// QUPU computes all day boundaries (streaks, daily quests, gamification
// events) in WIB — Asia/Jakarta, UTC+7, no DST. This is the single source
// of truth for converting a moment to its WIB calendar day.

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

function formatUtcDate(d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * The WIB (UTC+7) calendar day for `now`, formatted YYYY-MM-DD.
 * Used for DATE columns: event_date, last_activity_date, quest windows.
 */
export function wibDateString(now: Date): string {
  return formatUtcDate(new Date(now.getTime() + WIB_OFFSET_MS))
}

export interface WibWeek {
  start: string // Monday of `now`'s WIB week, YYYY-MM-DD
  end: string // Sunday of the same week (inclusive), YYYY-MM-DD
  startUtc: Date // the UTC instant of Monday 00:00 WIB — ledger created_at cutoff
}

/**
 * The Monday-start WIB week containing `now`. Weekly features (sibling
 * leaderboard, Misi Keluarga) key their windows off `start` and filter
 * TIMESTAMPTZ columns with `created_at >= startUtc`.
 */
export function wibWeek(now: Date): WibWeek {
  const shifted = new Date(now.getTime() + WIB_OFFSET_MS)
  // getUTCDay: 0 = Sunday … 6 = Saturday; Monday-start weeks need Mon = 0.
  const daysSinceMonday = (shifted.getUTCDay() + 6) % 7
  // Date.UTC normalizes negative day-of-month, so month/year rollover is safe.
  const mondayShiftedMs = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - daysSinceMonday,
  )
  return {
    start: formatUtcDate(new Date(mondayShiftedMs)),
    end: formatUtcDate(new Date(mondayShiftedMs + 6 * DAY_MS)),
    // Un-shift: Monday 00:00 WIB happens 7 hours BEFORE Monday 00:00 UTC.
    startUtc: new Date(mondayShiftedMs - WIB_OFFSET_MS),
  }
}
