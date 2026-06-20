// IKMC-19-PE-Q10 — "Patricia folds a sheet of paper twice and then cuts it,
// as shown. How many pieces of paper does she end up with?"  Answer: B = 3.
//
// Storyboard for the post-answer animation. One idea per beat, landing on the
// answer:
//   beat 0 — flat rectangle with vertical fold crease (stage 0). State the plan.
//   beat 1 — first fold: left half over to the right → half-width rectangle
//            (stage 1).
//   beat 2 — second fold: top half down over bottom → quarter-square + scissors
//            shown (stage 2).
//   beat 3 — zoomed view of the cut: the corner triangle is snipped off, but
//            cutting through the fold edge means fewer than 4 cuts when unfolded
//            (stage 3).
//   beat 4 — RESULT: unfold → 3 separate pieces revealed (stage 4).
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Captions bind to the seed's hint_steps_en/id rather than being
// re-asserted here.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { PaperFold10Stage } from './PaperFold10Illustration'

export type PaperFold10Phase = 'plan' | 'fold' | 'cut' | 'unfold' | 'result'

export interface PaperFold10Step {
  stage: PaperFold10Stage
  phase: PaperFold10Phase
  caption: string
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface PaperFold10Storyboard {
  /** The correct answer value as a string. */
  answer: string
  steps: PaperFold10Step[]
  finalIndex: number
}

export function buildPaperFold10Steps(lang: Lang): PaperFold10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PaperFold10Step[] = [
    {
      stage: 0,
      phase: 'plan',
      hold: 2400,
      result: false,
      caption: t(
        'Patricia starts with a full sheet of paper. She will fold it TWICE before cutting.',
        'Patricia mulai dengan selembar kertas utuh. Dia akan melipat kertas DUA KALI sebelum memotong.',
      ),
    },
    {
      stage: 1,
      phase: 'fold',
      hold: 2400,
      result: false,
      caption: t(
        'Fold 1: fold the left half over to the right. The paper is now half as wide — 2 layers.',
        'Lipatan 1: lipat separuh kiri ke kanan. Kertas sekarang setengah lebar — 2 lapisan.',
      ),
    },
    {
      stage: 2,
      phase: 'fold',
      hold: 2400,
      result: false,
      caption: t(
        'Fold 2: fold the top half down over the bottom. Now 4 layers — then snip the top-right corner!',
        'Lipatan 2: lipat separuh atas ke bawah. Sekarang 4 lapisan — lalu gunting sudut kanan atas!',
      ),
    },
    {
      stage: 3,
      phase: 'cut',
      hold: 2600,
      result: false,
      caption: t(
        'The cut goes through the fold edge on one side — so when unfolded, those corners stay joined together.',
        'Potongan melewati tepi lipatan di satu sisi — jadi saat dibuka, sudut-sudut itu tetap menyatu.',
      ),
    },
    {
      stage: 4,
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Unfold! The cut that crossed the fold edge becomes a notch — giving 3 pieces total, not 4.',
        'Buka lipatan! Potongan yang melewati tepi lipatan menjadi lekukan — menghasilkan 3 potongan, bukan 4.',
      ),
    },
  ]

  return { answer: '3', steps, finalIndex: steps.length - 1 }
}
