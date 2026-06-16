import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SQUARE_VALUE, CIRCLE_VALUE, ANSWER } from './SubtractionShapesG2Illustration'

export type SubPhase = 'show' | 'units' | 'tens' | 'sum' | 'result'

export interface SubtractionShapesStep {
  phase: SubPhase
  /** Which column to highlight. */
  activeColumn: 'units' | 'tens' | null
  /** Show the borrow annotations once the units borrow is established. */
  showBorrow: boolean
  /** Reveal the solved ○ digit. */
  revealCircle: boolean
  /** Reveal the solved □ digit. */
  revealSquare: boolean
  /** Highlight the answer option with this label, or null. */
  highlightOption: 'A' | 'B' | 'C' | 'D' | null
  caption: string
  hold: number
  result: boolean
}

export interface SubtractionShapesStoryboard {
  steps: SubtractionShapesStep[]
  finalIndex: number
}

/**
 * Storyboard: solve the UNITS column first (needs a borrow → 13 − ○ = 4 → ○ = 9),
 * then the TENS column after the borrow (□ − 1 − 6 = 2 → □ = 9), then sum
 * □ + ○ = 18 (option D).
 */
export function buildSubtractionShapesG2Steps(lang: Lang): SubtractionShapesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SubtractionShapesStep[] = [
    {
      phase: 'show',
      activeColumn: null,
      showBorrow: false,
      revealCircle: false,
      revealSquare: false,
      highlightOption: null,
      hold: 1800,
      result: false,
      caption: t(
        'Each shape is a hidden digit. Solve column by column, starting at the units.',
        'Setiap bentuk adalah angka tersembunyi. Selesaikan kolom demi kolom, mulai dari satuan.',
      ),
    },
    {
      phase: 'units',
      activeColumn: 'units',
      showBorrow: false,
      revealCircle: false,
      revealSquare: false,
      highlightOption: null,
      hold: 2000,
      result: false,
      caption: t(
        'Units: 3 − ○ = 4 is impossible (too small), so we must borrow.',
        'Satuan: 3 − ○ = 4 tidak mungkin (terlalu kecil), jadi kita harus meminjam.',
      ),
    },
    {
      phase: 'units',
      activeColumn: 'units',
      showBorrow: true,
      revealCircle: true,
      revealSquare: false,
      highlightOption: null,
      hold: 2000,
      result: false,
      caption: t(
        `Borrow 1 ten → 13 − ○ = 4, so ○ = ${CIRCLE_VALUE}.`,
        `Pinjam 1 puluhan → 13 − ○ = 4, jadi ○ = ${CIRCLE_VALUE}.`,
      ),
    },
    {
      phase: 'tens',
      activeColumn: 'tens',
      showBorrow: true,
      revealCircle: true,
      revealSquare: true,
      highlightOption: null,
      hold: 2000,
      result: false,
      caption: t(
        `Tens (after the borrow): □ − 1 − 6 = 2, so □ − 7 = 2 → □ = ${SQUARE_VALUE}.`,
        `Puluhan (setelah pinjam): □ − 1 − 6 = 2, jadi □ − 7 = 2 → □ = ${SQUARE_VALUE}.`,
      ),
    },
    {
      phase: 'sum',
      activeColumn: null,
      showBorrow: true,
      revealCircle: true,
      revealSquare: true,
      highlightOption: null,
      hold: 1800,
      result: false,
      caption: t(
        `Now add: □ + ○ = ${SQUARE_VALUE} + ${CIRCLE_VALUE} = ${ANSWER}.`,
        `Sekarang jumlahkan: □ + ○ = ${SQUARE_VALUE} + ${CIRCLE_VALUE} = ${ANSWER}.`,
      ),
    },
    {
      phase: 'result',
      activeColumn: null,
      showBorrow: true,
      revealCircle: true,
      revealSquare: true,
      highlightOption: 'D',
      hold: 0,
      result: true,
      caption: t(
        `□ + ○ = ${ANSWER} → option D.`,
        `□ + ○ = ${ANSWER} → pilihan D.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
