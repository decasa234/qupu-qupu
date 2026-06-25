// Storyboard for HKIMO-25-P2H-Q17 — post-answer explainer.
// "At least how many square(s) can be seen if viewing the figure below from the top?"
// Answer = 9: all 9 positions of a 3×3 grid footprint are occupied.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewPhase = 'intro' | 'view' | 'grid' | 'total'

export interface TopViewHK25P2Q17Step {
  phase: TopViewPhase
  show3D: boolean
  showGrid: boolean
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface TopViewHK25P2Q17Storyboard {
  steps: TopViewHK25P2Q17Step[]
  finalIndex: number
  answer: number
}

export function buildTopViewHK25P2Q17Steps(lang: Lang): TopViewHK25P2Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TopViewHK25P2Q17Step[] = []

  steps.push({
    phase: 'intro',
    show3D: true,
    showGrid: false,
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
    runningTotal: 0,
    hold: 2200,
    result: false,
    caption: t(
      'Each column of cubes shows as exactly one square in the top view — stacked cubes hide the lower faces.',
      'Setiap kolom kubus tampak sebagai satu persegi dalam tampilan atas — kubus yang bertumpuk menyembunyikan permukaan bawah.',
    ),
  })

  steps.push({
    phase: 'grid',
    show3D: false,
    showGrid: true,
    runningTotal: 9,
    hold: 2400,
    result: false,
    caption: t(
      'Top view: the footprint is a full 3×3 grid — 9 columns each show 1 square.',
      'Tampak atas: jejak adalah kisi 3×3 penuh — 9 kolom, masing-masing menampilkan 1 persegi.',
    ),
  })

  steps.push({
    phase: 'total',
    show3D: false,
    showGrid: true,
    runningTotal: 9,
    hold: 0,
    result: true,
    caption: t(
      'Minimum visible squares from top: 9.',
      'Minimum persegi yang terlihat dari atas: 9.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
