import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC-21-EC-Q8 — "What is the weight of each white ball?"
//
// Three balanced scales (all level):
//   Scale 1: 1 grey + 1 black = 6 kg        → grey + black = 6
//   Scale 2: 3 white          = 15 kg        → 3 × white = 15  → white = 5 kg
//   Scale 3: 1 black + 3 white= 10 kg        → black + 15 = 10 → (confirms figure value)
//
// Strategy: Scale 2 is the key — 3 identical white balls balance the 15 kg block,
// so each white ball = 15 ÷ 3 = 5 kg. Answer: C.
//
// Beats:
//   0 — Intro: show all three scales, neutral
//   1 — Read Scale 2: spotlight, caption explains 3 white = 15 kg
//   2 — Divide: 15 ÷ 3 = 5 kg per white ball
//   3 — Result: answer C highlighted

export const WHITE_BALL_KG = 5       // official answer
export const WHITE_TOTAL_KG = 15     // 3 white balls from Scale 2 figure

export interface BallScales8Step {
  /** Which scale (1, 2, or 3) to spotlight; null = all neutral. */
  litScale: 1 | 2 | 3 | null
  /** Equation or result shown as a badge (empty string = hidden). */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface BallScales8Storyboard {
  steps: BallScales8Step[]
  finalIndex: number
}

export function buildBallScales8Steps(lang: Lang): BallScales8Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BallScales8Step[] = [
    // Beat 0 — Intro
    {
      litScale: null,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Three balanced scales show grey, black, and white balls against known weights. Which scale uses only one colour?',
        'Tiga timbangan seimbang menunjukkan bola abu-abu, hitam, dan putih terhadap beban yang diketahui. Timbangan mana yang hanya menggunakan satu warna?',
      ),
    },
    // Beat 1 — Spotlight Scale 2
    {
      litScale: 2,
      equation: t('3 white = 15 kg', '3 putih = 15 kg'),
      hold: 2400,
      result: false,
      caption: t(
        'Scale 2 is the simplest: three identical white balls balance the 15 kg block.',
        'Timbangan 2 paling sederhana: tiga bola putih yang identik menyeimbangkan beban 15 kg.',
      ),
    },
    // Beat 2 — Divide
    {
      litScale: 2,
      equation: t('15 ÷ 3 = 5 kg', '15 ÷ 3 = 5 kg'),
      hold: 2400,
      result: false,
      caption: t(
        'All three balls weigh 15 kg total — divide by 3 to get the weight of one white ball.',
        'Ketiga bola beratnya 15 kg total — bagi dengan 3 untuk mendapatkan berat satu bola putih.',
      ),
    },
    // Beat 3 — Result
    {
      litScale: 2,
      equation: t('1 white ball = 5 kg ✓', '1 bola putih = 5 kg ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Each white ball weighs 5 kg. Answer: C.',
        'Setiap bola putih beratnya 5 kg. Jawaban: C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
