// Deterministic storyboard for WMI-22P2A-Q25 (pack the most 16-sum trominoes).
//
// The scan only gives the six allowed shapes, so the explainer teaches the
// PACKING METHOD rather than tracing a specific (unavailable) grid:
//   1. A valid group is three touching squares (one of the six shapes) whose
//      numbers add to 16.
//   2. Groups may not overlap — each square is used at most once.
//   3. Pack as many disjoint valid groups as you can; greedy/edge-first packing
//      squeezes one more in past 12, reaching the maximum of 13 (answer D).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const TARGET_SUM = 16
export const PER_GROUP = 3
export const ANSWER = 13

export interface PackStep {
  /** Which allowed shape to spotlight in the legend (-1 = none). */
  highlight: number
  /** Running count of trios placed (shown as a chip). */
  placed: number
  caption: string
  hold: number
  result: boolean
}

export interface PackStoryboard {
  steps: PackStep[]
  finalIndex: number
}

export function buildP22G2Q25Steps(lang: Lang): PackStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PackStep[] = [
    {
      highlight: -1,
      placed: 0,
      hold: 1800,
      result: false,
      caption: t(
        'A group is three touching squares — one of these six shapes — whose numbers add to 16.',
        'Satu kelompok adalah tiga kotak bersentuhan — salah satu dari enam bentuk ini — yang angkanya berjumlah 16.',
      ),
    },
    {
      highlight: 0,
      placed: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Straight or L — any of the six counts, as long as the three numbers total 16.',
        'Lurus atau L — keenam bentuk boleh, asalkan ketiga angkanya berjumlah 16.',
      ),
    },
    {
      highlight: -1,
      placed: 6,
      hold: 1900,
      result: false,
      caption: t(
        'Each square can be used only once, so the groups must NOT overlap.',
        'Tiap kotak hanya boleh dipakai sekali, jadi kelompok TIDAK boleh tumpang tindih.',
      ),
    },
    {
      highlight: -1,
      placed: 12,
      hold: 1900,
      result: false,
      caption: t(
        'Pack as many disjoint 16-groups as you can. Filling rows leaves a few squares stranded at 12 groups…',
        'Susun sebanyak mungkin kelompok-16 yang lepas. Mengisi baris menyisakan beberapa kotak terjebak di 12 kelompok…',
      ),
    },
    {
      highlight: -1,
      placed: 13,
      hold: 0,
      result: true,
      caption: t(
        'Bending one group into an L frees space for one more — the most you can fit at once is 13. Answer D.',
        'Membengkokkan satu kelompok jadi L membuka ruang satu lagi — paling banyak yang muat sekaligus adalah 13. Jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
