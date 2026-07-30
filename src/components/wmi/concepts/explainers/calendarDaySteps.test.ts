import { describe, test, expect } from 'vitest'
import {
  buildCalendarDaySteps,
  normalizeCalendarParams,
  CAL_DAYS_EN,
  CAL_DAYS_ID,
} from './calendarDaySteps'

// Mirrors api/services/wmi/concepts/calendar-day-reasoning/index.ts `dayIndex`.
const expected = (startDay: number, delta: number) => (startDay + delta) % 7

describe('buildCalendarDaySteps', () => {
  test('day names match the concept generator, Sunday-first', () => {
    expect(CAL_DAYS_EN[0]).toBe('Sunday')
    expect(CAL_DAYS_ID[0]).toBe('Minggu')
    expect(CAL_DAYS_ID).toEqual(['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
  })

  test('answer index is (startDay + delta) mod 7 for every params the generator can emit', () => {
    for (let startDay = 0; startDay <= 6; startDay++) {
      for (let delta = 1; delta <= 60; delta++) {
        const sb = buildCalendarDaySteps({ startDay, delta }, 'id')
        expect(sb.answerIndex).toBe(expected(startDay, delta))
        expect(sb.answerName).toBe(CAL_DAYS_ID[expected(startDay, delta)])
      }
    }
  })

  test('remainder beat states a true subtraction and the division readout matches', () => {
    // Monday (1) + 45 days → 45 = 6×7 + 3 → Thursday (4)
    const sb = buildCalendarDaySteps({ startDay: 1, delta: 45 }, 'id')
    expect(sb.weeks).toBe(6)
    expect(sb.remainder).toBe(3)
    expect(sb.divisionText).toBe('45 ÷ 7 = 6 sisa 3')
    expect(sb.landingText).toBe('Senin + 3 → Kamis')
    const rem = sb.steps.find((s) => s.phase === 'remainder')
    expect(rem?.caption).toBe('45 − 42 = 3. Tinggal maju 3 hari.')
  })

  test('the full-lap beat badges all 7 chips, landing 7 back on the start day', () => {
    const sb = buildCalendarDaySteps({ startDay: 3, delta: 45 }, 'en')
    const loop = sb.steps.find((s) => s.phase === 'loop')!
    expect(loop.wraps).toBe(true)
    expect(loop.badges.filter((b) => b !== null)).toHaveLength(7)
    expect([...loop.badges].sort((a, b) => (a as number) - (b as number))).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(loop.badges[sb.startIndex]).toBe(7)
    expect(loop.markerIndex).toBe(sb.startIndex)
    expect(loop.hopsDone).toBe(7)
  })

  test('a hop is flagged as wrapping exactly when it steps off Saturday onto Sunday', () => {
    for (let startDay = 0; startDay <= 6; startDay++) {
      for (let delta = 1; delta <= 60; delta++) {
        const sb = buildCalendarDaySteps({ startDay, delta }, 'en')
        const walk = sb.steps.filter((s) => s.phase === 'hop' || s.phase === 'result')
        for (const s of walk) {
          if (s.hopsDone === 0) continue
          const cameFrom = (startDay + s.hopsDone - 1) % 7
          expect(s.wraps).toBe(cameFrom === 6)
          expect(s.markerIndex).toBe((startDay + s.hopsDone) % 7)
        }
      }
    }
  })

  test('badges only ever mark days the walk has actually reached', () => {
    const sb = buildCalendarDaySteps({ startDay: 5, delta: 20 }, 'id') // 20 = 2×7 + 6
    expect(sb.remainder).toBe(6)
    for (const step of sb.steps.filter((s) => s.phase === 'hop' || s.phase === 'result')) {
      step.badges.forEach((badge, dayIdx) => {
        if (badge === null) return
        expect(badge).toBeLessThanOrEqual(step.hopsDone)
        expect((5 + badge) % 7).toBe(dayIdx)
      })
    }
  })

  test('only the last beat lands the answer, and no earlier caption names that day', () => {
    for (const lang of ['en', 'id'] as const) {
      const names = lang === 'id' ? CAL_DAYS_ID : CAL_DAYS_EN
      for (let startDay = 0; startDay <= 6; startDay++) {
        for (let delta = 1; delta <= 60; delta++) {
          if (delta % 7 === 0) continue // the generator never emits a whole number of weeks
          const sb = buildCalendarDaySteps({ startDay, delta }, lang)
          const answerName = names[expected(startDay, delta)]
          const last = sb.steps[sb.finalIndex]
          expect(last.result).toBe(true)
          expect(last.answerIndex).toBe(expected(startDay, delta))
          expect(last.caption).toContain(answerName)
          expect(last.hold).toBe(0)
          for (const earlier of sb.steps.slice(0, sb.finalIndex)) {
            expect(earlier.result).toBe(false)
            expect(earlier.answerIndex).toBeNull()
            expect(earlier.caption).not.toContain(answerName)
          }
        }
      }
    }
  })

  test('every params shape yields at least 3 beats and a well-formed board', () => {
    for (let startDay = 0; startDay <= 6; startDay++) {
      for (let delta = 1; delta <= 60; delta++) {
        const sb = buildCalendarDaySteps({ startDay, delta }, 'id')
        expect(sb.steps.length).toBeGreaterThanOrEqual(3)
        expect(sb.finalIndex).toBe(sb.steps.length - 1)
        for (const s of sb.steps) {
          expect(s.badges).toHaveLength(7)
          expect(s.markerIndex).toBeGreaterThanOrEqual(0)
          expect(s.markerIndex).toBeLessThanOrEqual(6)
          expect(s.caption.length).toBeGreaterThan(0)
          expect(s.caption).not.toMatch(/undefined|NaN/)
        }
      }
    }
  })

  test('the one-by-one trap only appears on long jumps, and never asserts a day', () => {
    const short = buildCalendarDaySteps({ startDay: 2, delta: 5 }, 'id')
    expect(short.steps.some((s) => s.phase === 'trap')).toBe(false)
    const long = buildCalendarDaySteps({ startDay: 2, delta: 45 }, 'id')
    const trap = long.steps.find((s) => s.phase === 'trap')!
    expect(trap.caption).toBe('Menghitung 45 hari satu per satu? Gampang salah.')
    expect(trap.result).toBe(false)
  })

  test('a jump under a week skips the weeks/remainder beats but still shows the lap', () => {
    const sb = buildCalendarDaySteps({ startDay: 0, delta: 2 }, 'en')
    expect(sb.weeks).toBe(0)
    expect(sb.steps.map((s) => s.phase)).toEqual(['week', 'loop', 'hop', 'result'])
    expect(sb.steps.some((s) => s.bottom === 'division')).toBe(false)
    expect(sb.steps[sb.finalIndex].bottom).toBe('landing')
  })

  test('language switch: id and en captions differ and use their own day names', () => {
    const en = buildCalendarDaySteps({ startDay: 1, delta: 45 }, 'en')
    const id = buildCalendarDaySteps({ startDay: 1, delta: 45 }, 'id')
    expect(en.steps[0].caption).toBe('Today is Monday. A week has 7 day names, then they repeat.')
    expect(id.steps[0].caption).toBe('Hari ini Senin. Seminggu ada 7 nama hari, lalu berulang.')
    expect(en.steps[en.finalIndex].caption).toBe('In 45 days it is Thursday.')
    expect(id.steps[id.finalIndex].caption).toBe('45 hari lagi hari Kamis.')
    expect(en.steps.map((s) => s.phase)).toEqual(id.steps.map((s) => s.phase))
  })

  test('a wrapping hop says so in words', () => {
    // Friday (5) + 3 days: hop 2 steps off Saturday back onto Sunday.
    const sb = buildCalendarDaySteps({ startDay: 5, delta: 3 }, 'id')
    const hop2 = sb.steps.find((s) => s.phase === 'hop' && s.hopsDone === 2)!
    expect(hop2.wraps).toBe(true)
    expect(hop2.caption).toBe('Maju 2: sesudah Sabtu namanya berulang → Minggu.')
  })

  test('defensive: an exact multiple of 7 lands back on the start day', () => {
    const sb = buildCalendarDaySteps({ startDay: 4, delta: 21 }, 'id')
    expect(sb.remainder).toBe(0)
    expect(sb.answerIndex).toBe(4)
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toBe('21 hari itu pas 3 minggu — tetap hari Kamis.')
    expect(sb.steps.some((s) => s.phase === 'remainder')).toBe(false)
  })

  test('garbage params are folded into something drawable instead of throwing', () => {
    for (const raw of [null, undefined, {}, { startDay: 'x', delta: 'y' }, { startDay: -3, delta: -9 }, { startDay: 99, delta: 1e9 }]) {
      const sb = buildCalendarDaySteps(raw, 'id')
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.startIndex).toBeGreaterThanOrEqual(0)
      expect(sb.startIndex).toBeLessThanOrEqual(6)
      expect(sb.delta).toBeGreaterThanOrEqual(1)
      expect(sb.steps.every((s) => !/undefined|NaN/.test(s.caption))).toBe(true)
    }
    expect(normalizeCalendarParams({ startDay: -3, delta: 12 })).toEqual({ startIndex: 4, delta: 12 })
    expect(normalizeCalendarParams({ startDay: 9, delta: 0 })).toEqual({ startIndex: 2, delta: 1 })
  })

  test('deterministic: the same params rebuild the identical storyboard', () => {
    const a = buildCalendarDaySteps({ startDay: 6, delta: 38 }, 'id')
    const b = buildCalendarDaySteps({ startDay: 6, delta: 38 }, 'id')
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})
