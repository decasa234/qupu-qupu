import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SPHERE_INDEX } from './P25G1Q3Illustration'

// Storyboard for WMI-25P1A-Q3 — "which figure from the left is the ball?"
// Answer C = 8. We count positions left -> right, numbering each shape, and
// stop on the round ball at position 8.

export type Q3Phase = 'show' | 'count' | 'result'

export interface Q3Step {
  phase: Q3Phase
  /** 0-based indices to number above the row. */
  numbered: number[]
  /** index to ring (the ball, on the result beat). */
  ringIndex: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q3Storyboard {
  position: number
  answer: string
  steps: Q3Step[]
  finalIndex: number
}

export function buildP25G1Q3Steps(lang: Lang): Q3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const position = SPHERE_INDEX + 1 // 8

  // number the shapes up to and including the ball, one growing run per beat
  const upto = (k: number) => Array.from({ length: k }, (_, i) => i)

  const steps: Q3Step[] = [
    {
      phase: 'show',
      numbered: [],
      ringIndex: null,
      hold: 1600,
      result: false,
      caption: t(
        'Count the shapes from the left, one at a time.',
        'Hitung bangun dari kiri, satu per satu.',
      ),
    },
    {
      phase: 'count',
      numbered: upto(4),
      ringIndex: null,
      hold: 1900,
      result: false,
      caption: t('1, 2, 3, 4 — keep going past the cubes.', '1, 2, 3, 4 — lanjut lewati kubus-kubusnya.'),
    },
    {
      phase: 'count',
      numbered: upto(7),
      ringIndex: null,
      hold: 1900,
      result: false,
      caption: t('5, 6, 7 — the next one is the round ball.', '5, 6, 7 — yang berikutnya bola bulat.'),
    },
    {
      phase: 'result',
      numbered: upto(SPHERE_INDEX + 1),
      ringIndex: SPHERE_INDEX,
      hold: 0,
      result: true,
      caption: t(`The ball is the ${position}th figure — answer C.`, `Bola adalah bangun ke-${position} — jawaban C.`),
    },
  ]

  return { position, answer: 'C', steps, finalIndex: steps.length - 1 }
}
