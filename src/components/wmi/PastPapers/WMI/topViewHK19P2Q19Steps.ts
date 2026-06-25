// Storyboard for HKIMO-19-P2H-Q19 — post-answer explainer.
// "At least how many squares can be seen if viewing the figure below from the top?" — answer: 4.
//
// Teaching beats:
//   intro    — stacked cubes share one top-view cell; "at least" = count distinct columns
//   project  — highlight topmost face of each column (gold) to show what's seen from above
//   count    — show 2D top-view grid with 4 labelled cells
//   answer   — final result: 4 squares

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewPhase = 'intro' | 'project' | 'count' | 'answer'

export interface TopViewStep {
  phase: TopViewPhase
  caption: string
  hold: number
  result: boolean
}

export interface TopViewStoryboard {
  steps: TopViewStep[]
  finalIndex: number
  answer: number
}

export function buildTopViewHK19P2Q19Steps(lang: Lang): TopViewStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TopViewStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    result: false,
    caption: t(
      'Looking from above: stacked cubes share ONE cell — each column counts as one square.',
      'Dilihat dari atas: kubus yang ditumpuk berbagi SATU sel — setiap kolom dihitung sebagai satu persegi.',
    ),
  })

  steps.push({
    phase: 'project',
    hold: 2400,
    result: false,
    caption: t(
      'Highlight the topmost face of each column — these are the 4 squares seen from above.',
      'Sorot permukaan teratas setiap kolom — ini adalah 4 persegi yang terlihat dari atas.',
    ),
  })

  steps.push({
    phase: 'count',
    hold: 2400,
    result: false,
    caption: t(
      'Top-view grid: cells A, B, C, D — each distinct column = one square. Count = 4.',
      'Grid tampak atas: sel A, B, C, D — setiap kolom berbeda = satu persegi. Jumlah = 4.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      '4 squares can be seen from the top.',
      '4 persegi dapat dilihat dari atas.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 4 }
}
