// IKMC-23-EC-Q18 — "Rebecca folds a square twice then cuts a corner. What does
// it look like unfolded?"  Answer: B — square with a diamond hole at the centre.
//
// Beat-by-beat storyboard for the post-answer explainer (4 beats):
//   beat 0 (stage 0) — flat square with horizontal fold line. State the plan.
//   beat 1 (stage 1) — after fold 1: rectangle with vertical fold line.
//   beat 2 (stage 2) — after fold 2: quarter square with corner scissors.
//   beat 3 (stage 3) — RESULT: unfolded square with diamond hole. Answer B.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { FoldCut18ECStage } from './FoldCut18ECIllustration'

export interface FoldCut18ECStep {
  stage: FoldCut18ECStage
  caption: string
  hold: number
  result: boolean
}

export interface FoldCut18ECStoryboard {
  steps: FoldCut18ECStep[]
  finalIndex: number
}

export function buildFoldCut18ECSteps(lang: Lang): FoldCut18ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FoldCut18ECStep[] = [
    {
      stage: 0,
      hold: 2400,
      result: false,
      caption: t(
        'Start: a square piece of paper. The horizontal dashed line shows ' +
          'where Rebecca makes the first fold — the bottom half folds UP over the top half.',
        'Awal: selembar kertas persegi. Garis putus-putus horizontal menunjukkan ' +
          'tempat Rebecca melakukan lipatan pertama — separuh bawah dilipat KE ATAS menutupi separuh atas.',
      ),
    },
    {
      stage: 1,
      hold: 2600,
      result: false,
      caption: t(
        'After fold 1: the paper is now a rectangle (half as tall). ' +
          'The vertical dashed line shows the second fold — the right half folds LEFT over the left half.',
        'Setelah lipatan 1: kertas kini berupa persegi panjang (setengah tinggi). ' +
          'Garis putus-putus vertikal menunjukkan lipatan kedua — separuh kanan dilipat KE KIRI menutupi separuh kiri.',
      ),
    },
    {
      stage: 2,
      hold: 2600,
      result: false,
      caption: t(
        'After fold 2: the paper is now a quarter-size square with 4 layers. ' +
          'Rebecca cuts off the top-left corner — that corner is the centre of the original square!',
        'Setelah lipatan 2: kertas kini berupa seperempat persegi dengan 4 lapisan. ' +
          'Rebecca memotong sudut kiri atas — sudut itu adalah PUSAT dari persegi aslinya!',
      ),
    },
    {
      stage: 3,
      hold: 0,
      result: true,
      caption: t(
        'Unfolded! Both folds mirror the cut in all four quadrants, creating a ' +
          'diamond-shaped hole at the centre. Answer B.',
        'Dibuka! Kedua lipatan mencerminkan potongan ke empat kuadran, menciptakan ' +
          'lubang berbentuk belah ketupat di tengah. Jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
