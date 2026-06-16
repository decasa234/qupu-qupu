// Deterministic storyboard for the WMI-25P1A-Q19 explainer.
//
// "How many squares (of all sizes) contain the apple?"  Answer D = 4.
// We reveal one containing square per beat, growing a running tally:
//   1×1 (the apple's own cell)        → 1
//   2×2 #1 (top-left at col0,row0)    → 2
//   2×2 #2 (top-left at col1,row0)    → 3
//   3×3   (top-left at col0,row0)     → 4
// The four squares are the exact set verified for a 3-col × 4-row grid with
// the apple at (col 1, row 0).

import type { Lang } from '../concepts/explainers/makeTenSteps'

export interface SquareHighlight {
  col: number
  row: number
  size: number
  color: string
}

export interface Q19Step {
  /** The single square to outline this beat (null on the intro). */
  highlight: SquareHighlight | null
  /** Running count of containing squares found so far. */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answer: number
  steps: Q19Step[]
  finalIndex: number
}

const C_1x1 = '#2563EB' // blue
const C_2x2 = '#F59E0B' // amber
const C_3x3 = '#10B981' // green

export function buildP25G1Q19Steps(lang: Lang): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q19Step[] = [
    {
      highlight: null,
      count: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Count every square that wraps around the apple — all sizes.',
        'Hitung setiap persegi yang membungkus apel — segala ukuran.',
      ),
    },
    {
      highlight: { col: 1, row: 0, size: 1, color: C_1x1 },
      count: 1,
      hold: 1800,
      result: false,
      caption: t(
        'The little 1×1 cell the apple sits in. That is 1.',
        'Persegi kecil 1×1 tempat apel berada. Itu 1.',
      ),
    },
    {
      highlight: { col: 0, row: 0, size: 2, color: C_2x2 },
      count: 2,
      hold: 1900,
      result: false,
      caption: t(
        'A 2×2 square on the left still covers the apple. Now 2.',
        'Persegi 2×2 di kiri masih menutupi apel. Sekarang 2.',
      ),
    },
    {
      highlight: { col: 1, row: 0, size: 2, color: C_2x2 },
      count: 3,
      hold: 1900,
      result: false,
      caption: t(
        'Slide the 2×2 one step right — it covers the apple too. Now 3.',
        'Geser 2×2 satu langkah ke kanan — menutupi apel juga. Sekarang 3.',
      ),
    },
    {
      highlight: { col: 0, row: 0, size: 3, color: C_3x3 },
      count: 4,
      hold: 0,
      result: true,
      caption: t(
        'One big 3×3 square holds it as well: 1 + 2 + 1 = 4 squares — answer D.',
        'Satu persegi besar 3×3 juga memuatnya: 1 + 2 + 1 = 4 persegi — jawaban D.',
      ),
    },
  ]

  return { answer: 4, steps, finalIndex: steps.length - 1 }
}
