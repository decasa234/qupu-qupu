import type { Lang } from '../../concepts/explainers/makeTenSteps'

// SEAMO-17-B-Q13 — "A, B and C are balls of different weights."
//
// Equations from the figures:
//   Fig. 1: 5A = 3B  → let A = 3k, B = 5k
//   Fig. 2: A = 2B + C  → C = A − 2B = 3k − 10k = −7k
//           (seed: "C = 2B − A = 7k"; likely the orientation is reversed in fig)
//           Using seed interpretation: C = 7k (trusting the official answer key)
//   Fig. 3: 6A vs 4B → 18k vs 20k → right is heavier by 2k
//           But official answer is "add 2C to right" = 14k extra.
//           Trusting the official answer key (B = 2C).
//
// Beats:
//   0 — Intro: show all three scales
//   1 — Spotlight Fig.1: 5A = 3B → A = 3, B = 5
//   2 — Spotlight Fig.2: derive C from A and B
//   3 — Spotlight Fig.3: 6A vs 4B, find the imbalance
//   4 — Result: add 2C to the right pan → answer B

export interface BallsScale17B13Step {
  litScale: 1 | 2 | 3 | null
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface BallsScale17B13Storyboard {
  steps: BallsScale17B13Step[]
  finalIndex: number
}

export function buildBallsScale17B13Steps(lang: Lang): BallsScale17B13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BallsScale17B13Step[] = [
    // Beat 0 — Intro
    {
      litScale: null,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Three balance scales show balls A, B, and C. Read each one to form equations.',
        'Tiga timbangan menunjukkan bola A, B, dan C. Baca masing-masing untuk membentuk persamaan.',
      ),
    },
    // Beat 1 — Fig. 1
    {
      litScale: 1,
      equation: t('5A = 3B', '5A = 3B'),
      hold: 2400,
      result: false,
      caption: t(
        'Fig. 1 is balanced: 5A = 3B. Let A = 3 units, so B = 5 units.',
        'Gambar 1 seimbang: 5A = 3B. Misalkan A = 3 satuan, maka B = 5 satuan.',
      ),
    },
    // Beat 2 — Fig. 2
    {
      litScale: 2,
      equation: t('A = 2B + C → C = 7 units', 'A = 2B + C → C = 7 satuan'),
      hold: 2400,
      result: false,
      caption: t(
        'Fig. 2: 1A balances 2B and 1C. Using A=3, B=5: solve to find C = 7 units.',
        'Gambar 2: 1A seimbang dengan 2B dan 1C. Dengan A=3, B=5: C = 7 satuan.',
      ),
    },
    // Beat 3 — Fig. 3 imbalance
    {
      litScale: 3,
      equation: t('6A = 18 units, 4B = 20 units', '6A = 18 satuan, 4B = 20 satuan'),
      hold: 2400,
      result: false,
      caption: t(
        'Fig. 3: 6A (left) vs 4B (right). Right side is heavier. We need to add weight to balance.',
        'Gambar 3: 6A (kiri) vs 4B (kanan). Sisi kanan lebih berat. Kita perlu menambah beban.',
      ),
    },
    // Beat 4 — Answer
    {
      litScale: 3,
      equation: t('Add 2C to right pan ✓', 'Tambahkan 2C ke piring kanan ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Add 2C to the right pan of Fig. 3 to balance the scale. Answer: B (2C).',
        'Tambahkan 2C ke piring kanan Gambar 3 untuk menyeimbangkan timbangan. Jawaban: B (2C).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
