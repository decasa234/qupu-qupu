// Storyboard for IKMC-23-PE-Q18 — birthday cakes / age deduction.
//
// Five children share a birthday. The cakes have 4, 5, 6, 7, 8 candles.
// Constraints:
//   • Vittorio is the youngest → 4 candles
//   • Lea = Jose + 2 → deduce: Jose=5, Lea=7
//   • Ali = Lea + 1  → Ali=8
//   • Sarah = leftover → 6 candles → answer C
//
// Beat sequence:
//   0 — show all five cakes (no highlight)
//   1 — highlight Vittorio (4): "youngest → 4 candles"
//   2 — highlight Jose (5) and Lea (7): "Lea = Jose + 2"
//   3 — highlight Ali (8): "Ali = Lea + 1"
//   4 — highlight Sarah (6): "Sarah gets 6 → answer C"

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface Cakes18Step {
  /** Which digit labels are highlighted (empty set = none) */
  highlight: Set<number>
  /** The single label being 'answered' (green), if any */
  answer: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Cakes18Storyboard {
  steps: Cakes18Step[]
  finalIndex: number
  /** For aria: the complete ordered mapping */
  order: { name: string; candles: number }[]
}

export function buildCakes18PESteps(lang: Lang): Cakes18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const order = [
    { name: 'Vittorio', candles: 4 },
    { name: 'Jose',     candles: 5 },
    { name: 'Sarah',    candles: 6 },
    { name: 'Lea',      candles: 7 },
    { name: 'Ali',      candles: 8 },
  ]

  const steps: Cakes18Step[] = [
    {
      highlight: new Set(),
      answer: null,
      hold: 1600,
      result: false,
      caption: t(
        'Five cakes: 4, 5, 6, 7, 8 candles — one per child.',
        '5 kue: 4, 5, 6, 7, 8 lilin — satu per anak.',
      ),
    },
    {
      highlight: new Set([4]),
      answer: null,
      hold: 2000,
      result: false,
      caption: t(
        'Vittorio is youngest → 4 candles.',
        'Vittorio termuda → 4 lilin.',
      ),
    },
    {
      highlight: new Set([5, 7]),
      answer: null,
      hold: 2200,
      result: false,
      caption: t(
        'Lea = Jose + 2: Jose → 5 candles, Lea → 7 candles.',
        'Lea = Jose + 2: Jose → 5 lilin, Lea → 7 lilin.',
      ),
    },
    {
      highlight: new Set([8]),
      answer: null,
      hold: 2000,
      result: false,
      caption: t(
        'Ali = Lea + 1: Ali → 8 candles.',
        'Ali = Lea + 1: Ali → 8 lilin.',
      ),
    },
    {
      highlight: new Set([6]),
      answer: 6,
      hold: 0,
      result: true,
      caption: t(
        "Only 6 candles left → Sarah’s cake. Answer C.",
        'Hanya 6 lilin tersisa → kue Sarah. Jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, order }
}
