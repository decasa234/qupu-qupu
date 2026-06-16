import type { Lang } from '../concepts/explainers/makeTenSteps'
import { GRID } from './FreqGrid23G1Illustration'

// WMI-23F1A-Q6 (2023 Grade 1 Final): among the numbers in the grid, find the
// difference between the value that appears MOST often and the value that
// appears LEAST often. Method, one idea per beat:
//   1. turn on the tally so every value's count is visible;
//   2. find the MOST frequent value (10 -> 7 times) and wash its cells;
//   3. find the LEAST frequent value (4 -> 3 times) and wash its cells;
//   4. result: 10 - 4 = 6.

export type FreqGridPhase = 'show' | 'most' | 'least' | 'result'

export interface FreqGridStep {
  phase: FreqGridPhase
  /** Value whose cells (and tally bar) light up on this beat, or null. */
  highlight: number | null
  /** Whether to draw the frequency tally on this beat. */
  tally: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FreqGridStoryboard {
  /** Most frequent value and its count. */
  most: { value: number; count: number }
  /** Least frequent value and its count. */
  least: { value: number; count: number }
  answer: number
  steps: FreqGridStep[]
  finalIndex: number
}

/** Count how many cells in the grid equal `value`. */
function frequencyOf(value: number): number {
  let n = 0
  for (const row of GRID) for (const cell of row) if (cell === value) n += 1
  return n
}

export function buildFreqGridSteps(lang: Lang): FreqGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Distinct values in ascending order, derived from the grid (single source).
  const values = Array.from(new Set(GRID.flat())).sort((a, b) => a - b)
  const counts = values.map((value) => ({ value, count: frequencyOf(value) }))

  // Most frequent: highest count (smaller value breaks ties for determinism).
  const most = counts.reduce((best, c) => (c.count > best.count ? c : best))
  // Least frequent: lowest count (smaller value breaks ties for determinism).
  const least = counts.reduce((worst, c) => (c.count < worst.count ? c : worst))
  const answer = most.value - least.value

  const steps: FreqGridStep[] = [
    {
      phase: 'show',
      highlight: null,
      tally: true,
      hold: 2000,
      result: false,
      caption: t(
        'Count how many times each number shows up.',
        'Hitung berapa kali tiap angka muncul.',
      ),
    },
    {
      phase: 'most',
      highlight: most.value,
      tally: true,
      hold: 2200,
      result: false,
      caption: t(
        `${most.value} shows up the MOST — ${most.count} times.`,
        `${most.value} paling SERING muncul — ${most.count} kali.`,
      ),
    },
    {
      phase: 'least',
      highlight: least.value,
      tally: true,
      hold: 2200,
      result: false,
      caption: t(
        `${least.value} shows up the LEAST — ${least.count} times.`,
        `${least.value} paling JARANG muncul — ${least.count} kali.`,
      ),
    },
    {
      phase: 'result',
      highlight: null,
      tally: true,
      hold: 0,
      result: true,
      caption: t(
        `Difference: ${most.value} − ${least.value} = ${answer}.`,
        `Selisihnya: ${most.value} − ${least.value} = ${answer}.`,
      ),
    },
  ]

  return { most, least, answer, steps, finalIndex: steps.length - 1 }
}
