// Steps for SASMO 2019 G3 Q2 — circle count pattern explainer.
// Five beats guiding the student from observation to answer D = 4.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface CCPStep {
  /** Show numeric count labels below each of the first 9 circles. */
  showCounts: boolean
  /** Dim all circles except the three "peak" circles at positions 1, 4, 7. */
  highlightPeak: boolean
  /** Replace the "?" text with 4 black dots in the 10th circle. */
  revealAnswer: boolean
  /** Show the "D = 4" answer label. */
  showFinalLabel: boolean
  caption: string
  /** Auto-advance delay in ms (0 = stay on this beat). */
  hold: number
  result: boolean
}

export interface CCPStoryboard {
  steps: CCPStep[]
  finalIndex: number
}

export function buildCircleCountPatternSASMO19G3Q2Steps(lang: Lang): CCPStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CCPStep[] = [
    // Beat 0 — Introduce the figure
    {
      showCounts: false,
      highlightPeak: false,
      revealAnswer: false,
      showFinalLabel: false,
      caption: t(
        'Study the 10 circles from left to right — each one contains black (filled) and white (hollow) circles.',
        'Perhatikan 10 lingkaran dari kiri ke kanan — masing-masing berisi lingkaran hitam dan putih.',
      ),
      hold: 2200,
      result: false,
    },
    // Beat 1 — Show all counts
    {
      showCounts: true,
      highlightPeak: false,
      revealAnswer: false,
      showFinalLabel: false,
      caption: t(
        'Count the black circles in each: 1, 9, 1, 3, 8, 1, 3, 6, 2, …',
        'Hitung lingkaran hitam di tiap lingkaran: 1, 9, 1, 3, 8, 1, 3, 6, 2, …',
      ),
      hold: 2500,
      result: false,
    },
    // Beat 2 — Highlight the peak circles (9, 8, 6)
    {
      showCounts: true,
      highlightPeak: true,
      revealAnswer: false,
      showFinalLabel: false,
      caption: t(
        'Every 3rd circle (positions 2, 5, 8) has the most black circles: 9 → 8 → 6. The other counts decrease too: 1,3,3 and 1,1,2.',
        'Setiap lingkaran ke-3 (posisi 2, 5, 8) paling banyak: 9 → 8 → 6. Hitungan lain juga berkurang mengikuti pola.',
      ),
      hold: 3000,
      result: false,
    },
    // Beat 3 — Reveal the answer
    {
      showCounts: true,
      highlightPeak: false,
      revealAnswer: true,
      showFinalLabel: false,
      caption: t(
        'Applying the pattern to the 10th circle gives 4 black circles — arranged in a 2×2 grid.',
        'Menerapkan pola pada lingkaran ke-10 menghasilkan 4 lingkaran hitam — tersusun dalam kisi 2×2.',
      ),
      hold: 2500,
      result: false,
    },
    // Beat 4 — Final answer
    {
      showCounts: true,
      highlightPeak: false,
      revealAnswer: true,
      showFinalLabel: true,
      caption: t('The answer is D = 4.', 'Jawabannya adalah D = 4.'),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
