export type Lang = 'en' | 'id'

export interface TakeAwayStep {
  /** Highlight the chips that are about to be removed. */
  marked: boolean
  /** The removed chips have left the frame. */
  gone: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface TakeAwayStoryboard {
  a: number
  b: number
  /** Chips remaining after the take-away (a − b). */
  left: number
  steps: TakeAwayStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

// Minuend clamps into 2..9 (matches the concept's generate range); subtrahend
// clamps into 1..a-1 so the result is always a positive whole number.
function clampMinuend(n: number): number {
  if (!Number.isFinite(n)) return 2
  return Math.max(2, Math.min(9, Math.round(n)))
}

export function buildTakeAwaySteps(aRaw: number, bRaw: number, lang: Lang): TakeAwayStoryboard {
  const a = clampMinuend(aRaw)
  const bRounded = Number.isFinite(bRaw) ? Math.round(bRaw) : 1
  const b = Math.max(1, Math.min(a - 1, bRounded))
  const left = a - b

  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TakeAwayStep[] = [
    // 1. Show the whole.
    {
      marked: false, gone: false,
      caption: t(`start with ${a}`, `mulai dari ${a}`),
      hold: 1500, result: false,
    },
    // 2. Mark the chips that will be taken away.
    {
      marked: true, gone: false,
      caption: t(`take away ${b}`, `ambil ${b}`),
      hold: 1900, result: false,
    },
    // 3. They leave the frame.
    {
      marked: true, gone: true,
      caption: t(`${b} taken away`, `${b} diambil`),
      hold: 1900, result: false,
    },
    // 4. Result: what is left.
    {
      marked: false, gone: true,
      caption: t(`${a} − ${b} = ${left}`, `${a} − ${b} = ${left}`),
      hold: 0, result: true,
    },
  ]

  return { a, b, left, steps, finalIndex: steps.length - 1 }
}
