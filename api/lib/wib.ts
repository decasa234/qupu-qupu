// api/lib/wib.ts
//
// QUPU computes all day boundaries (streaks, daily quests, gamification
// events) in WIB — Asia/Jakarta, UTC+7, no DST. This is the single source
// of truth for converting a moment to its WIB calendar day.

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * The WIB (UTC+7) calendar day for `now`, formatted YYYY-MM-DD.
 * Used for DATE columns: event_date, last_activity_date, quest windows.
 */
export function wibDateString(now: Date): string {
  const wibShifted = new Date(now.getTime() + WIB_OFFSET_MS)
  const year = wibShifted.getUTCFullYear()
  const month = String(wibShifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(wibShifted.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
