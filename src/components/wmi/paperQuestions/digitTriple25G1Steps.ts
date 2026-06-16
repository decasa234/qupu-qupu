import type { Lang } from '../concepts/explainers/makeTenSteps'

// WMI-25F1A-Q17 (2025 Grade 1 Final).
// Use the digits 0, 2, 4, 6, 7, 9 once each to form three 2-digit numbers and
// make (largest - smallest) as small as possible. The storyboard deduces the
// method one idea per beat:
//   1. State the goal — make the three numbers crowd together.
//   2. Insight — the TENS digits drive the spread, so pick three tens that are
//      close: 4, 6, 7. The leftovers 9, 2, 0 become units (0 can't lead).
//   3. Build 70 (the biggest — give it a small units digit).
//   4. Build 62.
//   5. Build 49 (the smallest — give it a big units digit so it climbs).
//   6. Result — 70 - 49 = 21.
//
// Pure builder, deterministic, SSR-safe — no random, no dates.

export type DigitTriplePhase = 'goal' | 'pick' | 'build' | 'result'

export interface DigitTripleStep {
  phase: DigitTriplePhase
  /** The three formed numbers passed to the primitive, or null until all built. */
  formed: string[] | null
  /** Slot index being built on this beat (0=smallest .. 2=largest), or null. */
  buildSlot: number | null
  /** Tens digits chosen as the "close cluster" (highlighted on the pick beat). */
  tens: number[] | null
  /** Units digits left over (highlighted on the pick beat). */
  units: number[] | null
  caption: string
  hold: number
  result: boolean
}

export interface DigitTripleStoryboard {
  /** Final three numbers, low → high: 49, 62, 70. */
  numbers: string[]
  low: number
  high: number
  answer: number
  /** Tens cluster and leftover units used by the winning split. */
  tens: number[]
  units: number[]
  steps: DigitTripleStep[]
  finalIndex: number
}

// The winning split, fixed by the solution: tens {4,6,7}, units {9,2,0}.
const NUMBERS = ['49', '62', '70'] // low → high
const TENS = [4, 6, 7]
const UNITS = [9, 2, 0]

export function buildDigitTripleSteps(lang: Lang): DigitTripleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const low = 49
  const high = 70
  const answer = high - low // 21

  const steps: DigitTripleStep[] = [
    {
      phase: 'goal',
      formed: null,
      buildSlot: null,
      tens: null,
      units: null,
      hold: 2000,
      result: false,
      caption: t(
        'Make three 2-digit numbers that sit close together.',
        'Buat tiga bilangan dua angka yang berdekatan.',
      ),
    },
    {
      phase: 'pick',
      formed: null,
      buildSlot: null,
      tens: TENS,
      units: UNITS,
      hold: 2300,
      result: false,
      caption: t(
        'The tens digit decides the size. Pick three close ones: 4, 6, 7.',
        'Angka puluhan menentukan besarnya. Pilih tiga yang dekat: 4, 6, 7.',
      ),
    },
    {
      phase: 'build',
      // Slots fill low → high; only the largest (70) is placed so far.
      formed: [null, null, '70'],
      buildSlot: 2,
      tens: TENS,
      units: UNITS,
      hold: 2000,
      result: false,
      caption: t(
        'Biggest tens 7 gets the small units 0 → 70.',
        'Puluhan terbesar 7 dapat satuan kecil 0 → 70.',
      ),
    },
    {
      phase: 'build',
      formed: [null, '62', '70'],
      buildSlot: 1,
      tens: TENS,
      units: UNITS,
      hold: 2000,
      result: false,
      caption: t(
        'Middle tens 6 takes units 2 → 62.',
        'Puluhan tengah 6 dapat satuan 2 → 62.',
      ),
    },
    {
      phase: 'build',
      formed: NUMBERS,
      buildSlot: 0,
      tens: TENS,
      units: UNITS,
      hold: 2100,
      result: false,
      caption: t(
        'Smallest tens 4 takes the big units 9 → 49, so it climbs up close.',
        'Puluhan terkecil 4 dapat satuan besar 9 → 49, jadi ikut naik mendekat.',
      ),
    },
    {
      phase: 'result',
      formed: NUMBERS,
      buildSlot: null,
      tens: TENS,
      units: UNITS,
      hold: 0,
      result: true,
      caption: t(
        `Largest 70 − smallest 49 = ${answer}. That's the closest we can get.`,
        `Terbesar 70 − terkecil 49 = ${answer}. Itu paling dekat yang bisa.`,
      ),
    },
  ]

  return {
    numbers: NUMBERS,
    low,
    high,
    answer,
    tens: TENS,
    units: UNITS,
    steps,
    finalIndex: steps.length - 1,
  }
}
