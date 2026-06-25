// Storyboard for HKIMO-25-P3H-Q16 — right-side view count.
// "At least how many squares can be seen from the right?" — Answer: 6.
//
// Strategy: project cube structure onto y-z plane (right-side silhouette).
//   Depth y=2 (front): 2 visible squares  (z=0 and z=1)
//   Depth y=3 (back):  4 visible squares  (z=0,1,2,3 — tower reaches z=3)
//   Total = 2 + 4 = 6

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase = 'intro' | 'depth-front' | 'depth-back' | 'total'

export interface RightViewHK25P3Q16Step {
  phase: RightViewPhase
  /** Which depth layers are highlighted: 0=none, 1=y=2 only, 2=y=2 & y=3 */
  layersShown: 0 | 1 | 2
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewHK25P3Q16Storyboard {
  steps: RightViewHK25P3Q16Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewHK25P3Q16Steps(lang: Lang): RightViewHK25P3Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK25P3Q16Step[] = []

  steps.push({
    phase: 'intro',
    layersShown: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Looking from the right — each depth row shows its tallest stack as squares.',
      'Dilihat dari kanan — setiap baris kedalaman menampilkan tumpukan tertingginya sebagai persegi.',
    ),
  })

  steps.push({
    phase: 'depth-front',
    layersShown: 1,
    runningTotal: 2,
    hold: 2400,
    result: false,
    caption: t(
      'Front depth (y=2): the step reaches height 2. → 2 visible squares.',
      'Kedalaman depan (y=2): anak tangga setinggi 2. → 2 persegi terlihat.',
    ),
  })

  steps.push({
    phase: 'depth-back',
    layersShown: 2,
    runningTotal: 6,
    hold: 2400,
    result: false,
    caption: t(
      'Back depth (y=3): the tower reaches height 4. → 4 visible squares. Running: 2 + 4 = 6.',
      'Kedalaman belakang (y=3): menara setinggi 4. → 4 persegi terlihat. Total sementara: 2 + 4 = 6.',
    ),
  })

  steps.push({
    phase: 'total',
    layersShown: 2,
    runningTotal: 6,
    hold: 0,
    result: true,
    caption: t(
      'Right-side view: 2 + 4 = 6 squares. Answer: 6.',
      'Tampak kanan: 2 + 4 = 6 persegi. Jawaban: 6.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 6 }
}
