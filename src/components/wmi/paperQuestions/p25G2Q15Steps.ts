import type { Lang } from '../concepts/explainers/makeTenSteps'

export type FoldPhase = 'show' | 'folds' | 'quarter' | 'match' | 'result'

export interface FoldStep {
  phase: FoldPhase
  showFolds: boolean
  showQuarter: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FoldStoryboard {
  answer: string
  steps: FoldStep[]
  finalIndex: number
}

export function buildP25G2Q15Steps(lang: Lang, answer: string): FoldStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const A = answer || 'A'

  const steps: FoldStep[] = [
    {
      phase: 'show',
      showFolds: false,
      showQuarter: false,
      hold: 1700,
      result: false,
      caption: t(
        'This is the paper AFTER unfolding the cut.',
        'Ini kertas SETELAH potongan dibuka.',
      ),
    },
    {
      phase: 'folds',
      showFolds: true,
      showQuarter: false,
      hold: 2100,
      result: false,
      caption: t(
        'A square folds twice — one fold left-right, one fold up-down.',
        'Persegi dilipat dua kali — sekali kiri-kanan, sekali atas-bawah.',
      ),
    },
    {
      phase: 'quarter',
      showFolds: true,
      showQuarter: true,
      hold: 2200,
      result: false,
      caption: t(
        'Every cut is copied into all 4 quarters, so the figure is symmetric.',
        'Tiap potongan tersalin ke 4 perempatan, jadi gambarnya simetris.',
      ),
    },
    {
      phase: 'match',
      showFolds: true,
      showQuarter: true,
      hold: 2100,
      result: false,
      caption: t(
        'Fold it back: the cuts in ONE quarter must match the chosen option.',
        'Lipat kembali: potongan di SATU perempatan harus cocok dengan pilihan.',
      ),
    },
    {
      phase: 'result',
      showFolds: false,
      showQuarter: false,
      hold: 0,
      result: true,
      caption: t(
        `Only option ${A}'s quarter unfolds into this shape — answer ${A}.`,
        `Hanya perempatan pilihan ${A} yang terbuka menjadi bentuk ini — jawaban ${A}.`,
      ),
    },
  ]

  return { answer: A, steps, finalIndex: steps.length - 1 }
}
