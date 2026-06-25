// Storyboard for HKIMO-24-P3H-Q17 — post-answer explainer.
// "At least how many square(s) can be seen if viewing the figure from the right?"
// Right-side view (y-z silhouette) reveals 4 visible squares:
//   (y=0, z=0), (y=1, z=0), (y=1, z=1), (y=1, z=2)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase =
  | 'intro'
  | 'front-row'
  | 'back-ground'
  | 'back-z1'
  | 'back-z2'
  | 'total'

export interface RightViewHK24P3Q17Step {
  phase: RightViewPhase
  /** How many right-view cells are lit (cumulative) */
  litCount: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewHK24P3Q17Storyboard {
  steps: RightViewHK24P3Q17Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewHK24P3Q17Steps(lang: Lang): RightViewHK24P3Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK24P3Q17Step[] = []

  steps.push({
    phase: 'intro',
    litCount: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Look at the 3-D figure from the right side. Count only the faces you can actually see.',
      'Lihat gambar 3D dari sisi kanan. Hitung hanya wajah yang benar-benar terlihat.',
    ),
  })

  steps.push({
    phase: 'front-row',
    litCount: 1,
    hold: 2200,
    result: false,
    caption: t(
      'Front row (depth 1): the rightmost cube is at ground level — 1 visible square.',
      'Baris depan (baris 1): kubus paling kanan ada di lantai — 1 persegi terlihat.',
    ),
  })

  steps.push({
    phase: 'back-ground',
    litCount: 2,
    hold: 2200,
    result: false,
    caption: t(
      'Back cluster (depth 2), ground level: rightmost cube visible — now 2 squares.',
      'Kelompok belakang (baris 2), lantai: kubus paling kanan terlihat — kini 2 persegi.',
    ),
  })

  steps.push({
    phase: 'back-z1',
    litCount: 3,
    hold: 2200,
    result: false,
    caption: t(
      '2nd level of back cluster: no cube to the right blocks it — 3 squares so far.',
      'Lantai 2 kelompok belakang: tidak ada kubus lebih kanan yang menghalangi — 3 persegi.',
    ),
  })

  steps.push({
    phase: 'back-z2',
    litCount: 4,
    hold: 2400,
    result: false,
    caption: t(
      '3rd level (tower top): still visible from the right — total 4 squares.',
      'Lantai 3 (puncak menara): masih terlihat dari kanan — total 4 persegi.',
    ),
  })

  steps.push({
    phase: 'total',
    litCount: 4,
    hold: 0,
    result: true,
    caption: t(
      'Right-side view: 4 squares visible. Answer = 4.',
      'Tampilan dari kanan: 4 persegi terlihat. Jawaban = 4.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 4 }
}
