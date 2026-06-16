import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { NUMBERS23 } from './NumberStrip23G1Illustration'

// WMI-23F1A-Q3 (2023 G1 final). The eleven numbers are FIXED and printed:
//   8, 11, 14, 9, 16, 18, 20, 7, 12, 19, 5
// A = the second-smallest number, B = the 9th number from the left, C = the
// number in the middle. Of A, B, C, find largest − smallest.
//
// This storyboard teaches the method one idea per beat: locate A (2nd-smallest),
// then B (9th from left), then C (middle), keeping earlier marks lit, and finally
// compare the three to subtract smallest from largest. The winner is the last beat
// (hold: 0); the locate beats linger so each "why this cell" reads.
//
// Pure builder — no random, no dates, SSR-safe & deterministic.

export type Mark = 'A' | 'B' | 'C'

export type NumberStrip23Phase = 'show' | 'locate' | 'compare' | 'result'

export interface NumberStrip23Step {
  phase: NumberStrip23Phase
  /** Marks lit on this beat (cumulative): 0-based cell index → label. */
  marks: Array<{ index: number; label: Mark }>
  /** The label being introduced on a locate beat, else null. */
  focus: Mark | null
  /** Pill values to show under the strip on compare/result beats: A, B, C. */
  values: { a: number; b: number; c: number } | null
  /** On the result beat, the largest / smallest of {A,B,C} and the difference. */
  largest: number | null
  smallest: number | null
  diff: number | null
  caption: string
  hold: number
  result: boolean
}

export interface NumberStrip23Storyboard {
  numbers: number[]
  /** Cell indices for A (2nd-smallest), B (9th from left), C (middle). */
  aIndex: number
  bIndex: number
  cIndex: number
  values: { a: number; b: number; c: number }
  answer: number
  steps: NumberStrip23Step[]
  finalIndex: number
}

export function buildNumberStrip23Steps(lang: Lang): NumberStrip23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const numbers = NUMBERS23

  // A = second-smallest. Sort a copy ascending, keep the original index of the
  // 2nd value (the smallest is 5, the next-smallest is 7 at cell 7).
  const sortedAsc = numbers
    .map((value, index) => ({ value, index }))
    .sort((x, y) => x.value - y.value || x.index - y.index)
  const smallestVal = sortedAsc[0].value
  const aIndex = sortedAsc[1].index
  const aVal = numbers[aIndex]

  // B = 9th from the left → cell at 0-based index 8.
  const bIndex = 8
  const bVal = numbers[bIndex]

  // C = the middle of 11 numbers → the 6th → 0-based index 5.
  const cIndex = Math.floor((numbers.length - 1) / 2)
  const cVal = numbers[cIndex]

  const values = { a: aVal, b: bVal, c: cVal }

  const largest = Math.max(aVal, bVal, cVal)
  const smallest = Math.min(aVal, bVal, cVal)
  const answer = largest - smallest

  const aMark = { index: aIndex, label: 'A' as Mark }
  const bMark = { index: bIndex, label: 'B' as Mark }
  const cMark = { index: cIndex, label: 'C' as Mark }

  const steps: NumberStrip23Step[] = [
    {
      phase: 'show',
      marks: [],
      focus: null,
      values: null,
      largest: null,
      smallest: null,
      diff: null,
      hold: 1700,
      result: false,
      caption: t(
        'Find A, B, C — then take the biggest minus the smallest.',
        'Cari A, B, C — lalu kurangi yang terbesar dengan yang terkecil.',
      ),
    },
    {
      phase: 'locate',
      marks: [aMark],
      focus: 'A',
      values: null,
      largest: null,
      smallest: null,
      diff: null,
      hold: 2100,
      result: false,
      caption: t(
        `A = 2nd-smallest. Smallest is ${smallestVal}, next is ${aVal}.`,
        `A = terkecil ke-2. Terkecil ${smallestVal}, berikutnya ${aVal}.`,
      ),
    },
    {
      phase: 'locate',
      marks: [aMark, bMark],
      focus: 'B',
      values: null,
      largest: null,
      smallest: null,
      diff: null,
      hold: 2100,
      result: false,
      caption: t(
        `B = 9th from the left. Count over to ${bVal}.`,
        `B = ke-9 dari kiri. Hitung sampai ${bVal}.`,
      ),
    },
    {
      phase: 'locate',
      marks: [aMark, bMark, cMark],
      focus: 'C',
      values: null,
      largest: null,
      smallest: null,
      diff: null,
      hold: 2100,
      result: false,
      caption: t(
        `C = middle. 11 numbers, so the 6th is ${cVal}.`,
        `C = tengah. 11 bilangan, jadi yang ke-6 ${cVal}.`,
      ),
    },
    {
      phase: 'compare',
      marks: [aMark, bMark, cMark],
      focus: null,
      values,
      largest,
      smallest,
      diff: null,
      hold: 2000,
      result: false,
      caption: t(
        `Compare A=${aVal}, B=${bVal}, C=${cVal}. Biggest ${largest}, smallest ${smallest}.`,
        `Bandingkan A=${aVal}, B=${bVal}, C=${cVal}. Terbesar ${largest}, terkecil ${smallest}.`,
      ),
    },
    {
      phase: 'result',
      marks: [aMark, bMark, cMark],
      focus: null,
      values,
      largest,
      smallest,
      diff: answer,
      hold: 0,
      result: true,
      caption: t(
        `${largest} − ${smallest} = ${answer}.`,
        `${largest} − ${smallest} = ${answer}.`,
      ),
    },
  ]

  return {
    numbers,
    aIndex,
    bIndex,
    cIndex,
    values,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
