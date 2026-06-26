// Storyboard for TIMO-22-P4H-Q18 — post-answer explainer.
// "Paling sedikit berapa banyak persegi yang terlihat dari sisi kanan?" → 9
//
// Right-side view: project the 3D figure onto the y–z plane (depth × height).
// For each (y, z) pair, the cell is visible if ANY cube exists at that (y, z).
//
//   y=0 (front): height 3 → 3 visible squares
//   y=1 (mid):   height 3 → 3 visible squares
//   y=2 (back):  height 2 → 2 visible squares
//   y=3 (far):   height 1 → 1 visible square
//   Total = 9
//
// Beats:
//   0. intro       — 3D iso figure only; cue the student to look from the right
//   1. rightview   — right-side silhouette grid appears with depth labels
//   2. count       — all 9 cells turn green; count badge shows 9
//   3. result      — green caption confirms the answer

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewTIMO22P4Phase = 'intro' | 'rightview' | 'count' | 'result'

export interface RightViewCubesTIMO22P4Q18Beat {
  phase: RightViewTIMO22P4Phase
  /** Show the right-side silhouette grid */
  showGrid: boolean
  /** Highlight all 9 grid cells green */
  highlightAll: boolean
  /** Count badge value (0 = hidden) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewCubesTIMO22P4Q18Storyboard {
  steps: RightViewCubesTIMO22P4Q18Beat[]
  finalIndex: number
  answer: number
}

export function buildRightViewCubesTIMO22P4Q18Steps(
  lang: Lang,
): RightViewCubesTIMO22P4Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewCubesTIMO22P4Q18Beat[] = []

  steps.push({
    phase: 'intro',
    showGrid: false,
    highlightAll: false,
    count: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Observe the 3D cube arrangement. Imagine looking straight at it from the right side.',
      'Amati susunan kubus 3D ini. Bayangkan melihat langsung dari sisi kanan.',
    ),
  })

  steps.push({
    phase: 'rightview',
    showGrid: true,
    highlightAll: false,
    count: 0,
    hold: 2400,
    result: false,
    caption: t(
      'From the right, each depth column shows its tallest stack as a flat silhouette.',
      'Dari kanan, setiap kolom kedalaman tampak sebagai siluet datar setinggi tumpukan tertinggi.',
    ),
  })

  steps.push({
    phase: 'count',
    showGrid: true,
    highlightAll: true,
    count: 9,
    hold: 2400,
    result: false,
    caption: t(
      '3 + 3 + 2 + 1 = 9 visible unit squares in the right-side silhouette.',
      '3 + 3 + 2 + 1 = 9 persegi satuan terlihat dalam siluet sisi kanan.',
    ),
  })

  steps.push({
    phase: 'result',
    showGrid: true,
    highlightAll: true,
    count: 9,
    hold: 0,
    result: true,
    caption: t(
      'At least 9 squares are visible from the right.',
      'Paling sedikit 9 persegi terlihat dari sisi kanan.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
