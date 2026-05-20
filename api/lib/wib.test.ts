import { describe, it, expect } from 'vitest'
import { wibDateString } from './wib.js'

// WIB is UTC+7. The risk in this function is the day-boundary: a UTC
// timestamp in the evening belongs to the *next* WIB calendar day, and
// streaks/quests key off that day. These cases pin that boundary down.
describe('wibDateString', () => {
  it('keeps the same WIB day for a UTC morning time', () => {
    expect(wibDateString(new Date('2026-05-20T05:00:00Z'))).toBe('2026-05-20')
  })

  it('rolls to the next WIB day for a UTC evening time', () => {
    // 18:00Z + 7h = 01:00 WIB the next day
    expect(wibDateString(new Date('2026-05-20T18:00:00Z'))).toBe('2026-05-21')
  })

  it('stays on the day one minute before WIB midnight', () => {
    // 16:59Z + 7h = 23:59 WIB
    expect(wibDateString(new Date('2026-05-20T16:59:00Z'))).toBe('2026-05-20')
  })

  it('advances exactly at WIB midnight', () => {
    // 17:00Z + 7h = 00:00 WIB the next day
    expect(wibDateString(new Date('2026-05-20T17:00:00Z'))).toBe('2026-05-21')
  })

  it('zero-pads single-digit months and days', () => {
    expect(wibDateString(new Date('2026-03-05T03:00:00Z'))).toBe('2026-03-05')
  })

  it('crosses the year boundary', () => {
    // 2025-12-31 17:00Z + 7h = 2026-01-01 00:00 WIB
    expect(wibDateString(new Date('2025-12-31T17:00:00Z'))).toBe('2026-01-01')
  })
})
