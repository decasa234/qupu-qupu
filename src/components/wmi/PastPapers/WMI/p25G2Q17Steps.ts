// Storyboard for the WMI-25P2A-Q17 fish-tank explainer.
//
// Counts clockwise from the top wedge: 2, 3, 1, 1, 3, 1, 1 (sum 12).
// We may colour the 7 wedges with 3 kinds so neighbours differ, then we want the
// biggest gap between two kinds' totals.  A backtracking check over every proper
// 3-colouring of this 7-cycle confirms the best legal grouping is
//   kind B (orange) = 3 + 3 + 1 = 7,  kind A (green) = 2 + 1 + 1 = 4,  kind C = 1.
// Biggest gap = 7 - 1 = 6  → answer E.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TANK_COUNTS } from './P25G2Q17Illustration'

// Per-wedge kind for the winning grouping (index 0..6, clockwise from top).
// 0 = kind A (green), 1 = kind B (orange), 2 = kind C (purple).
export const Q17_KINDS: Array<0 | 1 | 2> = [0, 1, 0, 2, 1, 0, 1]

export const Q17_SUM_B = 3 + 3 + 1 // 7  (the two 3s + a 1)
export const Q17_SUM_A = 2 + 1 + 1 // 4
export const Q17_SUM_C = 1 // 1
export const Q17_MAX_DIFF = Q17_SUM_B - Q17_SUM_C // 6

export interface Q17Step {
  /** Per-wedge kind tint, or null to leave a wedge plain. */
  highlight: Array<number | null>
  dimUngrouped: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answer: number
  steps: Q17Step[]
  finalIndex: number
}

const NONE: Array<number | null> = [null, null, null, null, null, null, null]

export function buildP25G2Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Helper: reveal only the wedges that belong to the given set of kinds so far.
  const upto = (kinds: number[]): Array<number | null> =>
    Q17_KINDS.map((k) => (kinds.includes(k) ? k : null))

  const total = TANK_COUNTS.reduce((a, b) => a + b, 0)

  const steps: Q17Step[] = [
    {
      highlight: NONE,
      dimUngrouped: false,
      hold: 1900,
      result: false,
      caption: t(
        `12 fish in 7 areas, 3 kinds. Neighbours must be different kinds.`,
        `12 ikan di 7 wilayah, 3 jenis. Tetangga harus beda jenis.`,
      ),
    },
    {
      highlight: NONE,
      dimUngrouped: false,
      hold: 2000,
      result: false,
      caption: t(
        `Counts around the ring: 2, 3, 1, 1, 3, 1, 1 — that adds to ${total}.`,
        `Angka mengelilingi cincin: 2, 3, 1, 1, 3, 1, 1 — jumlahnya ${total}.`,
      ),
    },
    {
      highlight: NONE,
      dimUngrouped: false,
      hold: 2000,
      result: false,
      caption: t(
        `For the biggest gap, pile the most into one kind and the least into another.`,
        `Agar selisih terbesar, kumpulkan terbanyak ke satu jenis dan tersedikit ke jenis lain.`,
      ),
    },
    {
      highlight: upto([1]),
      dimUngrouped: true,
      hold: 2200,
      result: false,
      caption: t(
        `Big kind (orange) takes both 3s and a 1: 3 + 3 + 1 = ${Q17_SUM_B}.`,
        `Jenis besar (oranye) ambil dua angka 3 dan satu 1: 3 + 3 + 1 = ${Q17_SUM_B}.`,
      ),
    },
    {
      highlight: upto([1, 0]),
      dimUngrouped: true,
      hold: 2200,
      result: false,
      caption: t(
        `Middle kind (green) takes 2 + 1 + 1 = ${Q17_SUM_A} — never beside an orange.`,
        `Jenis tengah (hijau) ambil 2 + 1 + 1 = ${Q17_SUM_A} — tak pernah di samping oranye.`,
      ),
    },
    {
      highlight: upto([1, 0, 2]),
      dimUngrouped: true,
      hold: 2200,
      result: false,
      caption: t(
        `Small kind (purple) is just one area: ${Q17_SUM_C}. Now 7, 4 and 1.`,
        `Jenis kecil (ungu) hanya satu wilayah: ${Q17_SUM_C}. Sekarang 7, 4, dan 1.`,
      ),
    },
    {
      highlight: upto([1, 0, 2]),
      dimUngrouped: false,
      hold: 0,
      result: true,
      caption: t(
        `Biggest gap = ${Q17_SUM_B} - ${Q17_SUM_C} = ${Q17_MAX_DIFF}. Answer E.`,
        `Selisih terbesar = ${Q17_SUM_B} - ${Q17_SUM_C} = ${Q17_MAX_DIFF}. Jawaban E.`,
      ),
    },
  ]

  return { answer: Q17_MAX_DIFF, steps, finalIndex: steps.length - 1 }
}
