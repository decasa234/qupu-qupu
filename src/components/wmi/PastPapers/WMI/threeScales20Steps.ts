import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { ShapeKey } from './ThreeScales20Illustration'
import { ANSWER, TOTAL_G } from './ThreeScales20Illustration'

export type ThreeScalesPhase = 'total' | 'balanced' | 'star' | 'triangle' | 'result'

export interface ThreeScalesStep {
  phase: ThreeScalesPhase
  /** Which scale (0..2) to emphasise; others dim. null = all neutral. */
  focus: 0 | 1 | 2 | null
  /** Weights deduced so far — shown as green badges on every matching tile. */
  solved: Partial<Record<ShapeKey, number>>
  /** Reveal the asked answer (△ + ○ = 6). */
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ThreeScalesStoryboard {
  answer: number
  steps: ThreeScalesStep[]
  finalIndex: number
}

export function buildThreeScales20Steps(lang: Lang): ThreeScalesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ThreeScalesStep[] = [
    {
      phase: 'total',
      focus: null,
      solved: {},
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        `All five blocks together: 2 + 3 + 3 + 3 + 5 = ${TOTAL_G} g.`,
        `Kelima balok bersama-sama: 2 + 3 + 3 + 3 + 5 = ${TOTAL_G} g.`,
      ),
    },
    {
      phase: 'balanced',
      focus: 0,
      solved: {},
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 1 is level, so each side weighs 16 ÷ 2 = 8 g. Circle + star = 8 — only 3 + 5 works! But which is which?',
        'Timbangan 1 datar, jadi tiap sisi 16 ÷ 2 = 8 g. Lingkaran + bintang = 8 — hanya 3 + 5 yang cocok! Tapi mana yang mana?',
      ),
    },
    {
      phase: 'star',
      focus: 1,
      solved: { star: 5, circle: 3 },
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 2: the star side is heavier. If ★ were 3, its side could weigh at most 3 + 3 = 6 against 2 + 5 = 7 — wrong way! So ★ = 5 and ○ = 3.',
        'Timbangan 2: sisi bintang lebih berat. Jika ★ = 3, sisinya paling berat 3 + 3 = 6 lawan 2 + 5 = 7 — terbalik! Jadi ★ = 5 dan ○ = 3.',
      ),
    },
    {
      phase: 'triangle',
      focus: 2,
      solved: { star: 5, circle: 3, triangle: 3 },
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 3: the triangle side is heavier. If △ were 2, its side would weigh 2 + 3 = 5 against 3 + 3 = 6 — wrong way again! So △ = 3.',
        'Timbangan 3: sisi segitiga lebih berat. Jika △ = 2, sisinya 2 + 3 = 5 lawan 3 + 3 = 6 — terbalik lagi! Jadi △ = 3.',
      ),
    },
    {
      phase: 'result',
      focus: null,
      solved: { star: 5, circle: 3, triangle: 3 },
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(`△ + ○ = 3 + 3 = ${ANSWER} g.`, `△ + ○ = 3 + 3 = ${ANSWER} g.`),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
