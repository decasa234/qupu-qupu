import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q22_ANSWER, Q22_STAR_VALUE } from './P21G3Q22Illustration'

export type Q22Phase = 'show' | 'rule' | 'findPartner' | 'compute' | 'reveal' | 'result'

export interface Q22Step {
  phase: Q22Phase
  /** Index into Q22_OPPOSITE to highlight (★ ↔ 4 is pair 0), or null. */
  litPair: number | null
  /** Pip count to show on the ★ face, or null to keep the star. */
  revealStarPips: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  starValue: number
  answer: string
  steps: Q22Step[]
  finalIndex: number
}

export function buildP21G3Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q22Step[] = [
    {
      phase: 'show',
      litPair: null,
      revealStarPips: null,
      hold: 1800,
      result: false,
      caption: t(
        'The ★ sits on a blank face. We must find how many dots it should have.',
        'Bintang ★ ada di sisi kosong. Kita cari berapa titik yang seharusnya ada di situ.',
      ),
    },
    {
      phase: 'rule',
      litPair: null,
      revealStarPips: null,
      hold: 1900,
      result: false,
      caption: t(
        'Rule: when the net folds into a cube, every pair of opposite faces adds to 7.',
        'Aturan: saat jaring dilipat jadi kubus, setiap pasang sisi berhadapan berjumlah 7.',
      ),
    },
    {
      phase: 'findPartner',
      litPair: 0,
      revealStarPips: null,
      hold: 2100,
      result: false,
      caption: t(
        'Fold it up: the ★ face ends up opposite the face with 4 dots.',
        'Lipat: sisi ★ ternyata berhadapan dengan sisi bertitik 4.',
      ),
    },
    {
      phase: 'compute',
      litPair: 0,
      revealStarPips: null,
      hold: 2000,
      result: false,
      caption: t(
        `So ★ + 4 = 7, which means ★ = 7 − 4 = ${Q22_STAR_VALUE}.`,
        `Jadi ★ + 4 = 7, berarti ★ = 7 − 4 = ${Q22_STAR_VALUE}.`,
      ),
    },
    {
      phase: 'reveal',
      litPair: 0,
      revealStarPips: Q22_STAR_VALUE,
      hold: 1900,
      result: false,
      caption: t(
        `The ★ face has ${Q22_STAR_VALUE} dots.`,
        `Sisi ★ memiliki ${Q22_STAR_VALUE} titik.`,
      ),
    },
    {
      phase: 'result',
      litPair: 0,
      revealStarPips: Q22_STAR_VALUE,
      hold: 0,
      result: true,
      caption: t(
        `★ = ${Q22_STAR_VALUE} dots — the matching picture is option ${Q22_ANSWER}.`,
        `★ = ${Q22_STAR_VALUE} titik — gambar yang cocok adalah pilihan ${Q22_ANSWER}.`,
      ),
    },
  ]

  return { starValue: Q22_STAR_VALUE, answer: Q22_ANSWER, steps, finalIndex: steps.length - 1 }
}
