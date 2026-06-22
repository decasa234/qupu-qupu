// IKMC-23-PE-Q14 — "A sheet of paper is folded in half. Square and round holes
// are punched. How does the sheet look after it is unfolded again?" Answer: B.
//
// Storyboard for the post-answer animation (3 beats, one idea per beat):
//   beat 0 — flat square sheet with vertical fold crease (stage 0). State plan.
//   beat 1 — paper folded in half (right half visible, two holes punched) (stage 1).
//   beat 2 — RESULT (stage 2): unfolded sheet shows 4 holes in mirrored positions.
//            Two circles upper-left and upper-right; two squares lower-left and lower-right.
//            Answer B stated.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Captions align with the seed's hint_steps_en/id.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { PunchFold14PEStage } from './PunchFold14PEIllustration'

export type PunchFold14PEPhase = 'plan' | 'fold' | 'result'

export interface PunchFold14PEStep {
  stage: PunchFold14PEStage
  phase: PunchFold14PEPhase
  caption: string
  hold: number
  result: boolean
}

export interface PunchFold14PEStoryboard {
  steps: PunchFold14PEStep[]
  finalIndex: number
}

export function buildPunchFold14PESteps(lang: Lang): PunchFold14PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PunchFold14PEStep[] = [
    {
      stage: 0,
      phase: 'plan',
      hold: 2400,
      result: false,
      caption: t(
        'Start with a full square sheet. The dashed line shows the fold — left half will fold over to the right, making 2 layers.',
        'Mulai dengan selembar kertas persegi. Garis putus-putus menunjukkan lipatan — separuh kiri dilipat ke kanan, menghasilkan 2 lapisan.',
      ),
    },
    {
      stage: 1,
      phase: 'fold',
      hold: 2600,
      result: false,
      caption: t(
        'The paper is now folded in half. A round hole and a square hole are punched through BOTH layers — each hole goes through 2 sheets at once.',
        'Kertas sekarang dilipat menjadi dua. Lubang bulat dan lubang persegi dibuat menembus KEDUA lapisan — setiap lubang menembus 2 lembar sekaligus.',
      ),
    },
    {
      stage: 2,
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Unfolding reveals 4 holes — each hole is mirrored: 2 round holes at the top and 2 square holes at the bottom. Answer B.',
        'Membuka lipatan mengungkap 4 lubang — setiap lubang bercermin: 2 lubang bulat di atas dan 2 lubang persegi di bawah. Jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
