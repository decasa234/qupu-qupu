// Storyboard for HKIMO-18-P2H-Q19 — post-answer explainer.
// "At least how many squares can be seen if viewing the figure below from top?"
// Answer = 5: 5 distinct (x,y) column positions have cubes; stacked ones hide the lower top face.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewPhase = 'intro' | 'view' | 'grid' | 'total'

export interface TopViewHK18P2Q19Step {
  phase: TopViewPhase
  /** Show the 3D isometric view */
  show3D: boolean
  /** Show the top-view grid overlay */
  showGrid: boolean
  /** How many grid cells have been highlighted so far */
  cellsRevealed: number
  /** Running total shown below */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface TopViewHK18P2Q19Storyboard {
  steps: TopViewHK18P2Q19Step[]
  finalIndex: number
  answer: number
}

export function buildTopViewHK18P2Q19Steps(lang: Lang): TopViewHK18P2Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TopViewHK18P2Q19Step[] = []

  steps.push({
    phase: 'intro',
    show3D: true,
    showGrid: false,
    cellsRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Look at the figure from directly above.',
      'Lihat gambar dari tepat di atas.',
    ),
  })

  steps.push({
    phase: 'view',
    show3D: true,
    showGrid: false,
    cellsRevealed: 0,
    runningTotal: 0,
    hold: 2200,
    result: false,
    caption: t(
      'Cubes stacked above others hide the lower top face — only the topmost face is visible.',
      'Kubus yang bertumpuk menyembunyikan permukaan atas kubus di bawahnya — hanya permukaan teratas yang terlihat.',
    ),
  })

  steps.push({
    phase: 'grid',
    show3D: false,
    showGrid: true,
    cellsRevealed: 5,
    runningTotal: 5,
    hold: 2400,
    result: false,
    caption: t(
      'Top view: 5 columns have cubes. Each column shows exactly 1 square.',
      'Tampak atas: 5 kolom memiliki kubus. Setiap kolom menampilkan tepat 1 persegi.',
    ),
  })

  steps.push({
    phase: 'total',
    show3D: false,
    showGrid: true,
    cellsRevealed: 5,
    runningTotal: 5,
    hold: 0,
    result: true,
    caption: t(
      'Minimum visible squares from top: 5.',
      'Minimum persegi yang terlihat dari atas: 5.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 5 }
}
