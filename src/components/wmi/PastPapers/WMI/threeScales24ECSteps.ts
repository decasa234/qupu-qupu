import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC-21-EC-Q24 — "What does Martin need to put on the left-hand side of the
// third set of scales for them to balance?"
//
// Three balanced (level) scales:
//   Scale 1: 1 hexagon  =  3 triangles           → H = 3T
//   Scale 2: 1 hexagon + 1 triangle  =  1 square → S = H + T = 3T + T = 4T
//   Scale 3: ?  =  1 hexagon + 1 triangle         → right = 4T = 1 square → answer A
//
// Strategy: read Scale 1 to express hexagon in triangles, substitute into
// Scale 2 to find square, then apply to Scale 3's right side.
//
// Beats:
//   0 — Intro: show all three scales, neutral
//   1 — Read Scale 1: H = 3T
//   2 — Read Scale 2: S = H + T, substitute to get S = 4T
//   3 — Read Scale 3: right = H + T = 4T = 1 square → need 1 square on left
//   4 — Result: answer A confirmed

export const ANSWER_LABEL_EN = '1 square (A)'
export const ANSWER_LABEL_ID = '1 persegi (A)'

export interface ThreeScales24Step {
  /** Which scale (1, 2, or 3) to spotlight; null = all neutral. */
  litScale: 1 | 2 | 3 | null
  /** Equation or rule shown as a badge (empty string = hidden). */
  equation: string
  caption: string
  hold: number
  /** True on the last beat when the answer is revealed. */
  result: boolean
}

export interface ThreeScales24Storyboard {
  steps: ThreeScales24Step[]
  finalIndex: number
}

/**
 * Builds the beat-by-beat solution storyboard for Q24.
 */
export function buildThreeScales24Steps(lang: Lang): ThreeScales24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ThreeScales24Step[] = [
    // Beat 0 — Intro
    {
      litScale: null,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Three balanced scales show hexagons, squares, and triangles. Read them one by one to find the unknown.',
        'Tiga timbangan seimbang menunjukkan segi enam, persegi, dan segitiga. Baca satu per satu untuk menemukan yang tidak diketahui.',
      ),
    },
    // Beat 1 — Read Scale 1
    {
      litScale: 1,
      equation: t('⬡ = △ + △ + △', '⬡ = △ + △ + △'),
      hold: 2400,
      result: false,
      caption: t(
        'Scale 1 is balanced: 1 hexagon equals 3 triangles. So H = 3T.',
        'Timbangan 1 seimbang: 1 segi enam sama dengan 3 segitiga. Jadi H = 3T.',
      ),
    },
    // Beat 2 — Read Scale 2, substitute
    {
      litScale: 2,
      equation: t('□ = ⬡ + △ = 4T', '□ = ⬡ + △ = 4T'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 2: 1 square = 1 hexagon + 1 triangle. Substituting H = 3T gives square = 3T + T = 4T.',
        'Timbangan 2: 1 persegi = 1 segi enam + 1 segitiga. Menggantikan H = 3T memberikan persegi = 3T + T = 4T.',
      ),
    },
    // Beat 3 — Apply to Scale 3
    {
      litScale: 3,
      equation: t('? = ⬡ + △ = 4T = □', '? = ⬡ + △ = 4T = □'),
      hold: 2600,
      result: false,
      caption: t(
        'Scale 3 right side: 1 hexagon + 1 triangle = 4T = 1 square. So the left pan needs 1 square.',
        'Sisi kanan Timbangan 3: 1 segi enam + 1 segitiga = 4T = 1 persegi. Jadi sisi kiri butuh 1 persegi.',
      ),
    },
    // Beat 4 — Result
    {
      litScale: 3,
      equation: t('1 square ✓', '1 persegi ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Put 1 square on the left side of scale 3. Answer: A.',
        'Letakkan 1 persegi di sisi kiri timbangan 3. Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
