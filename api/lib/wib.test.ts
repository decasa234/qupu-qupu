import { describe, it, expect } from 'vitest'
import { wibDateString, wibWeek } from './wib.js'

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

// Monday-start weeks in WIB. The danger zones: the Sunday→Monday WIB
// midnight (which lands on Sunday 17:00 UTC), and month/year rollover when
// the Monday belongs to the previous month/year.
describe('wibWeek', () => {
  it('maps a midweek moment to its Monday-start WIB week', () => {
    // 2026-06-10 is a Wednesday (12:00 WIB).
    const week = wibWeek(new Date('2026-06-10T05:00:00Z'))
    expect(week.start).toBe('2026-06-08')
    expect(week.end).toBe('2026-06-14')
    // Monday 00:00 WIB = Sunday 17:00 UTC.
    expect(week.startUtc.toISOString()).toBe('2026-06-07T17:00:00.000Z')
  })

  it('keeps Sunday 23:59 WIB inside the closing week', () => {
    // 16:59Z + 7h = Sunday 2026-06-14 23:59 WIB.
    const week = wibWeek(new Date('2026-06-14T16:59:00Z'))
    expect(week.start).toBe('2026-06-08')
    expect(week.end).toBe('2026-06-14')
  })

  it('rolls to the next week exactly at Monday 00:00 WIB', () => {
    // 17:00Z + 7h = Monday 2026-06-15 00:00 WIB.
    const week = wibWeek(new Date('2026-06-14T17:00:00Z'))
    expect(week.start).toBe('2026-06-15')
    expect(week.end).toBe('2026-06-21')
    expect(week.startUtc.toISOString()).toBe('2026-06-14T17:00:00.000Z')
  })

  it('keeps a WIB Monday morning (still Sunday in UTC) in the new week', () => {
    // Sunday 20:00Z + 7h = Monday 2026-06-15 03:00 WIB.
    const week = wibWeek(new Date('2026-06-14T20:00:00Z'))
    expect(week.start).toBe('2026-06-15')
  })

  it('crosses the year boundary back to a December Monday', () => {
    // 2026-01-01 07:00 WIB is a Thursday; its week starts Mon 2025-12-29.
    const week = wibWeek(new Date('2026-01-01T00:00:00Z'))
    expect(week.start).toBe('2025-12-29')
    expect(week.end).toBe('2026-01-04')
    expect(week.startUtc.toISOString()).toBe('2025-12-28T17:00:00.000Z')
  })

  it('agrees with wibDateString on a Monday', () => {
    const monday = new Date('2026-06-14T17:30:00Z') // Monday 00:30 WIB
    expect(wibWeek(monday).start).toBe(wibDateString(monday))
  })
})
