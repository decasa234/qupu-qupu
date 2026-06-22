// IKMC-23-PE-Q1 — storyboard for the overlapping-circles count explainer.
//
// Strategy: point to each circle one at a time (id 1..8), say what it is,
// then collect the total and land on the answer D = 8.
//
// Binds to quantities from the seed:
//   { label_en: "Circles counted", value: "8 circles total" }

import { TOTAL_CIRCLES } from './CountCircles1PEIllustration'

export type CircleCountPhase =
  | 'intro'
  | 'face'
  | 'earL'
  | 'earLDot'
  | 'earR'
  | 'earRDot'
  | 'eyeL'
  | 'eyeR'
  | 'mouth'
  | 'result'

export interface CircleCountStep {
  phase: CircleCountPhase
  /** Circles 1..n are shown as highlighted; rest are dimmed. 0 = static (no highlight). */
  highlighted: number
  caption: string
  hold: number
  result: boolean
}

export interface CircleCountStoryboard {
  totalCircles: number
  steps: CircleCountStep[]
  finalIndex: number
}

export function buildCountCircles1PESteps(lang: 'en' | 'id'): CircleCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CircleCountStep[] = [
    {
      phase: 'intro',
      highlighted: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count every circle in the figure — mark each one so you don\'t miss any.',
        'Hitung setiap lingkaran dalam gambar — tandai satu per satu agar tidak ada yang terlewat.',
      ),
    },
    {
      phase: 'face',
      highlighted: 1,
      hold: 1400,
      result: false,
      caption: t('Circle 1 — the big yellow face.', 'Lingkaran 1 — wajah kuning besar.'),
    },
    {
      phase: 'earL',
      highlighted: 2,
      hold: 1400,
      result: false,
      caption: t('Circle 2 — blue left ear.', 'Lingkaran 2 — telinga kiri biru.'),
    },
    {
      phase: 'earLDot',
      highlighted: 3,
      hold: 1400,
      result: false,
      caption: t('Circle 3 — green dot inside the left ear.', 'Lingkaran 3 — titik hijau di dalam telinga kiri.'),
    },
    {
      phase: 'earR',
      highlighted: 4,
      hold: 1400,
      result: false,
      caption: t('Circle 4 — blue right ear.', 'Lingkaran 4 — telinga kanan biru.'),
    },
    {
      phase: 'earRDot',
      highlighted: 5,
      hold: 1400,
      result: false,
      caption: t('Circle 5 — green dot inside the right ear.', 'Lingkaran 5 — titik hijau di dalam telinga kanan.'),
    },
    {
      phase: 'eyeL',
      highlighted: 6,
      hold: 1400,
      result: false,
      caption: t('Circle 6 — orange left eye.', 'Lingkaran 6 — mata kiri oranye.'),
    },
    {
      phase: 'eyeR',
      highlighted: 7,
      hold: 1400,
      result: false,
      caption: t('Circle 7 — orange right eye.', 'Lingkaran 7 — mata kanan oranye.'),
    },
    {
      phase: 'mouth',
      highlighted: 8,
      hold: 1400,
      result: false,
      caption: t('Circle 8 — purple mouth.', 'Lingkaran 8 — mulut ungu.'),
    },
    {
      phase: 'result',
      highlighted: 8,
      hold: 0,
      result: true,
      caption: t(
        `${TOTAL_CIRCLES} circles in total — answer D.`,
        `${TOTAL_CIRCLES} lingkaran seluruhnya — jawaban D.`,
      ),
    },
  ]

  return {
    totalCircles: TOTAL_CIRCLES,
    steps,
    finalIndex: steps.length - 1,
  }
}
