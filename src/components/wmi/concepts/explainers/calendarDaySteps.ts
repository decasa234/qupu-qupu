import type { Lang } from './makeTenSteps'

// M5 `calendar-day-reasoning`: today is <startDay>, what day is it `delta` days
// later? The storyboard binds to that concept's own params
// (api/services/wmi/concepts/calendar-day-reasoning/index.ts → { startDay, delta })
// and mirrors its two hint steps beat for beat:
//   1. `delta ÷ 7` leaves remainder r   -> `loop` / `weeks` / `remainder`
//   2. count r days on from the start   -> `hop` … `result`
//
// The lesson is that day names live on a 7-long loop: hop 7 and you are home
// again, so only `delta mod 7` can move you. Nothing is asserted — every beat is
// a consequence of the row of day chips already on screen, the wrap arrow is
// lit exactly on the beats that cross Saturday → Sunday, and only the last beat
// names the answer.

export const CAL_DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const CAL_DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const
export const CAL_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export const CAL_SHORT_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const

export type CalendarPhase = 'week' | 'trap' | 'loop' | 'weeks' | 'remainder' | 'hop' | 'result'

/** What the strip under the wrap arrow shows this beat. */
export type CalendarBottom = 'none' | 'weeks' | 'division' | 'landing'

export interface CalendarStep {
  phase: CalendarPhase
  caption: string
  /** Day index (0 = Sunday … 6 = Saturday) the marker sits on this beat. */
  markerIndex: number
  /** Step number to badge under each day chip, or null. Always length 7. */
  badges: (number | null)[]
  /** Hops already walked (0 on the setup beats); shown inside the marker. */
  hopsDone: number
  /** This beat's move crosses the Saturday → Sunday seam — lights the wrap arrow. */
  wraps: boolean
  bottom: CalendarBottom
  /** The landed day index — non-null on the final beat only. */
  answerIndex: number | null
  result: boolean
  /** How long to hold this beat on screen, in ms (the answer lingers). */
  hold: number
}

export interface CalendarStoryboard {
  startIndex: number
  delta: number
  /** Whole weeks inside `delta` — every one of them lands back on the start day. */
  weeks: number
  /** `delta mod 7`: the only part that can actually move the day. */
  remainder: number
  answerIndex: number
  /** Full day names in `lang`, Sunday-first (same order the concept uses). */
  dayNames: string[]
  /** Three-letter chip labels in `lang`, Sunday-first. */
  shortNames: string[]
  startName: string
  answerName: string
  /** `45 ÷ 7 = 6 sisa 3` — the readout under the row, already in `lang`. */
  divisionText: string
  /** `Senin + 3 → Kamis` — the landing readout, already in `lang`. */
  landingText: string
  steps: CalendarStep[]
  finalIndex: number
}

const EMPTY_BADGES = (): (number | null)[] => [null, null, null, null, null, null, null]

/**
 * Params arrive as plain JSON off the wire (stored instances), so fold anything
 * unexpected into something drawable rather than throwing mid-render.
 */
export function normalizeCalendarParams(raw: unknown): { startIndex: number; delta: number } {
  const rec = (raw ?? {}) as Record<string, unknown>
  const rawStart = rec.startDay
  const startIndex =
    typeof rawStart === 'number' && Number.isFinite(rawStart) ? (((Math.trunc(rawStart) % 7) + 7) % 7) : 0
  const rawDelta = rec.delta
  const delta =
    typeof rawDelta === 'number' && Number.isFinite(rawDelta) ? Math.min(400, Math.max(1, Math.trunc(rawDelta))) : 1
  return { startIndex, delta }
}

export function buildCalendarDaySteps(rawParams: unknown, lang: Lang): CalendarStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { startIndex, delta } = normalizeCalendarParams(rawParams)

  const dayNames = [...(lang === 'id' ? CAL_DAYS_ID : CAL_DAYS_EN)]
  const shortNames = [...(lang === 'id' ? CAL_SHORT_ID : CAL_SHORT_EN)]

  const weeks = Math.floor(delta / 7)
  const remainder = delta - weeks * 7
  const answerIndex = (startIndex + remainder) % 7
  const startName = dayNames[startIndex]
  const answerName = dayNames[answerIndex]

  /** Day index `offset` hops on from the start. */
  const at = (offset: number) => (startIndex + offset) % 7
  const nameAt = (offset: number) => dayNames[at(offset)]
  /** Hop number `k` steps off the end of the list (Saturday → Sunday). */
  const crosses = (k: number) => at(k - 1) === 6

  /** Badge every chip the walk has touched with the hop number that landed on it. */
  const badgesUpTo = (upTo: number): (number | null)[] => {
    const out = EMPTY_BADGES()
    for (let k = 1; k <= upTo; k++) out[at(k)] = k
    return out
  }

  const divisionText = t(
    `${delta} ÷ 7 = ${weeks} remainder ${remainder}`,
    `${delta} ÷ 7 = ${weeks} sisa ${remainder}`,
  )
  const landingText = `${startName} + ${remainder} → ${answerName}`

  const base = {
    markerIndex: startIndex,
    badges: EMPTY_BADGES(),
    hopsDone: 0,
    wraps: false,
    bottom: 'none' as CalendarBottom,
    answerIndex: null as number | null,
    result: false,
  }

  const steps: CalendarStep[] = []

  // 1. the loop itself: seven names, then they come round again
  steps.push({
    ...base,
    phase: 'week',
    caption: t(
      `Today is ${startName}. A week has 7 day names, then they repeat.`,
      `Hari ini ${startName}. Seminggu ada 7 nama hari, lalu berulang.`,
    ),
    hold: 2400,
  })

  // 2. why one-at-a-time is the wrong tool for a long jump
  if (delta >= 10) {
    steps.push({
      ...base,
      phase: 'trap',
      caption: t(
        `Counting ${delta} days one at a time? Easy to lose track.`,
        `Menghitung ${delta} hari satu per satu? Gampang salah.`,
      ),
      hold: 2600,
    })
  }

  // 3. walk a whole lap so the return is seen, not claimed
  steps.push({
    ...base,
    phase: 'loop',
    caption: t(
      `7 days forward is one full lap — back to ${startName}.`,
      `Maju 7 hari itu satu putaran penuh — kembali ke ${startName}.`,
    ),
    badges: badgesUpTo(7),
    // the marker ends where it began — the "+7" on it is the whole point
    hopsDone: 7,
    wraps: true,
    hold: 3000,
  })

  // 4–5. peel the full weeks off, leaving the remainder
  if (weeks >= 1) {
    steps.push({
      ...base,
      phase: 'weeks',
      caption: t(
        `${weeks} × 7 = ${weeks * 7} days. Every full week lands back on ${startName}.`,
        `${weeks} × 7 = ${weeks * 7} hari. Tiap minggu penuh kembali ke ${startName}.`,
      ),
      bottom: 'weeks',
      hold: 2800,
    })
    if (remainder > 0) {
      steps.push({
        ...base,
        phase: 'remainder',
        caption: t(
          `${delta} − ${weeks * 7} = ${remainder}. Only ${remainder} day${remainder === 1 ? '' : 's'} left to hop.`,
          `${delta} − ${weeks * 7} = ${remainder}. Tinggal maju ${remainder} hari.`,
        ),
        bottom: 'division',
        hold: 2800,
      })
    }
  }

  if (remainder === 0) {
    // Defensive: the generator never emits a multiple of 7, but a hand-seeded
    // instance could — then the whole jump is full laps and nothing moves.
    steps.push({
      ...base,
      phase: 'result',
      caption: t(
        `${delta} days is exactly ${weeks} weeks — still ${startName}.`,
        `${delta} hari itu pas ${weeks} minggu — tetap hari ${startName}.`,
      ),
      bottom: 'landing',
      answerIndex: startIndex,
      result: true,
      hold: 0,
    })
  } else {
    // 6. hop the remainder one day at a time — short enough to stay honest
    const walkBottom: CalendarBottom = weeks >= 1 ? 'division' : 'none'
    for (let k = 1; k < remainder; k++) {
      steps.push({
        ...base,
        phase: 'hop',
        caption: crosses(k)
          ? t(
              `Hop ${k}: after ${nameAt(k - 1)} the names start over → ${nameAt(k)}.`,
              `Maju ${k}: sesudah ${nameAt(k - 1)} namanya berulang → ${nameAt(k)}.`,
            )
          : t(`Hop ${k}: ${nameAt(k - 1)} → ${nameAt(k)}.`, `Maju ${k}: ${nameAt(k - 1)} → ${nameAt(k)}.`),
        markerIndex: at(k),
        badges: badgesUpTo(k),
        hopsDone: k,
        wraps: crosses(k),
        bottom: walkBottom,
        hold: 1500,
      })
    }

    // 7. the last hop lands — and only now is the day named
    steps.push({
      ...base,
      phase: 'result',
      caption: t(`In ${delta} days it is ${answerName}.`, `${delta} hari lagi hari ${answerName}.`),
      markerIndex: answerIndex,
      badges: badgesUpTo(remainder),
      hopsDone: remainder,
      wraps: crosses(remainder),
      bottom: 'landing',
      answerIndex,
      result: true,
      hold: 0,
    })
  }

  return {
    startIndex,
    delta,
    weeks,
    remainder,
    answerIndex,
    dayNames,
    shortNames,
    startName,
    answerName,
    divisionText,
    landingText,
    steps,
    finalIndex: steps.length - 1,
  }
}
