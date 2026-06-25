import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CircleNumbers20A9Phase =
  | 'intro'
  | 'verify1'
  | 'verify2'
  | 'apply'
  | 'result'

export interface CircleNumbers20A9Step {
  phase: CircleNumbers20A9Phase
  /** Which puzzle index (0/1/2) to highlight, or null for all */
  highlightIndex: number | null
  /** Whether to show the answer in the third circle */
  revealAnswer: boolean
  caption: string
  hold: number
}

export interface CircleNumbers20A9Storyboard {
  steps: CircleNumbers20A9Step[]
  finalIndex: number
}

export function buildCircleNumbers20A9Steps(lang: Lang): CircleNumbers20A9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CircleNumbers20A9Step[] = [
    {
      phase: 'intro',
      highlightIndex: null,
      revealAnswer: false,
      hold: 1600,
      caption: t(
        'Three circle puzzles. Each has a centre number and three satellites: TOP, BOTTOM-LEFT, BOTTOM-RIGHT. Find the rule!',
        'Tiga teka-teki lingkaran. Masing-masing punya angka tengah dan tiga satelit: ATAS, KIRI BAWAH, KANAN BAWAH. Temukan polanya!',
      ),
    },
    {
      phase: 'verify1',
      highlightIndex: 0,
      revealAnswer: false,
      hold: 2000,
      caption: t(
        'Circle 1: top=9, bottom-left=12, bottom-right=8. Centre=13. Try 9 + 12 − 8 = 13 ✓',
        'Lingkaran 1: atas=9, kiri bawah=12, kanan bawah=8. Tengah=13. Coba 9 + 12 − 8 = 13 ✓',
      ),
    },
    {
      phase: 'verify2',
      highlightIndex: 1,
      revealAnswer: false,
      hold: 2000,
      caption: t(
        'Circle 2: top=12, bottom-left=15, bottom-right=7. Centre=20. Check 12 + 15 − 7 = 20 ✓',
        'Lingkaran 2: atas=12, kiri bawah=15, kanan bawah=7. Tengah=20. Cek 12 + 15 − 7 = 20 ✓',
      ),
    },
    {
      phase: 'apply',
      highlightIndex: 2,
      revealAnswer: false,
      hold: 1800,
      caption: t(
        'Rule confirmed: centre = top + bottom-left − bottom-right. Apply to circle 3: 6 + 9 − 1 = ?',
        'Aturan terkonfirmasi: tengah = atas + kiri bawah − kanan bawah. Terapkan ke lingkaran 3: 6 + 9 − 1 = ?',
      ),
    },
    {
      phase: 'result',
      highlightIndex: 2,
      revealAnswer: true,
      hold: 0,
      caption: t(
        '6 + 9 − 1 = 14. The missing number is 14 — answer C.',
        '6 + 9 − 1 = 14. Angka yang hilang adalah 14 — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
