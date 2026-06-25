// Storyboard for HKIMO-24-P2H-Q17 post-answer explainer.
// "At least how many unit square(s) can be seen if viewing the figure from the top?"
// Answer: 13  (one per occupied (x,y) footprint position, regardless of stack height).
//
// The animation reveals one depth-row at a time (front → middle → back), showing
// how the running count builds up to 13.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewPhase = 'intro' | 'front' | 'middle' | 'back' | 'total'

export interface IsoCubesTopHK24P2Q17Step {
  phase: TopViewPhase
  /** Depth rows revealed: 0 = none, 1 = y<1 (front), 2 = y<2 (+middle), 3 = y<3 (+back) */
  rowsRevealed: number
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface IsoCubesTopHK24P2Q17Storyboard {
  steps: IsoCubesTopHK24P2Q17Step[]
  finalIndex: number
  answer: number
}

export function buildIsoCubesTopHK24P2Q17Steps(lang: Lang): IsoCubesTopHK24P2Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: IsoCubesTopHK24P2Q17Step[] = []

  steps.push({
    phase: 'intro',
    rowsRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'From the top, every stack — however tall — shows exactly 1 unit square.',
      'Dari atas, setiap tumpukan — setinggi apapun — hanya menampilkan 1 persegi satuan.',
    ),
  })

  steps.push({
    phase: 'front',
    rowsRevealed: 1,
    runningTotal: 5,
    hold: 2400,
    result: false,
    caption: t(
      'Front row: 5 occupied positions → 5 unit squares.',
      'Baris depan: 5 posisi terisi → 5 persegi satuan.',
    ),
  })

  steps.push({
    phase: 'middle',
    rowsRevealed: 2,
    runningTotal: 10,
    hold: 2400,
    result: false,
    caption: t(
      'Middle row: 5 more (the 3-high tower still counts as 1). 5 + 5 = 10.',
      'Baris tengah: 5 lagi (menara 3 kubus tetap dihitung 1). 5 + 5 = 10.',
    ),
  })

  steps.push({
    phase: 'back',
    rowsRevealed: 3,
    runningTotal: 13,
    hold: 2400,
    result: false,
    caption: t(
      'Back row: 3 more positions. 10 + 3 = 13.',
      'Baris belakang: 3 posisi lagi. 10 + 3 = 13.',
    ),
  })

  steps.push({
    phase: 'total',
    rowsRevealed: 3,
    runningTotal: 13,
    hold: 0,
    result: true,
    caption: t(
      'Total: 13 unit squares visible from the top.',
      'Total: 13 persegi satuan terlihat dari atas.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 13 }
}
