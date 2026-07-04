/**
 * Deterministic storyboard for WMI-24P3A-Q1 (number-line placement).
 *
 * The digits {8, 8, 5, 0} can be arranged many ways, but P sits between 8000
 * and 9000, close to the midpoint 8500. We:
 *   1. read where P is,
 *   2. rule out 5088 (does not start with 8),
 *   3. find the midpoint 8500,
 *   4. drop the surviving 8xxx values and keep the one nearest 8500 → 8580 (D).
 */
import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type P24G3Q1Phase = 'show' | 'mustStart8' | 'midpoint' | 'tooFar' | 'result'

export interface P24G3Q1Step {
  phase: P24G3Q1Phase
  showMidpoint: boolean
  /** Candidate value dropped on the line, or null. */
  candidate: { value: string; fraction: number; correct?: boolean } | null
  caption: string
  hold: number
  result: boolean
}

export interface P24G3Q1Storyboard {
  answer: string
  steps: P24G3Q1Step[]
  finalIndex: number
}

// Fraction of the 8000→9000 span for each candidate (8000=0, 9000=1).
const F_8085 = 0.085
const F_8850 = 0.85
const F_8580 = 0.58

export function buildP24G3Q1Steps(lang: Lang): P24G3Q1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: P24G3Q1Step[] = [
    {
      phase: 'show',
      showMidpoint: false,
      candidate: null,
      hold: 1800,
      result: false,
      caption: t('P is between 8000 and 9000, close to the middle.', 'P di antara 8000 dan 9000, dekat tengah.'),
    },
    {
      phase: 'mustStart8',
      showMidpoint: false,
      candidate: null,
      hold: 2000,
      result: false,
      caption: t('A number past 8000 must start with 8 — so 5088 is out.', 'Bilangan setelah 8000 harus diawali 8 — jadi 5088 gugur.'),
    },
    {
      phase: 'midpoint',
      showMidpoint: true,
      candidate: null,
      hold: 2000,
      result: false,
      caption: t('Halfway between 8000 and 9000 is 8500. P sits right beside it.', 'Tengah antara 8000 dan 9000 adalah 8500. P tepat di dekatnya.'),
    },
    {
      phase: 'tooFar',
      showMidpoint: true,
      candidate: { value: '8085', fraction: F_8085, correct: false },
      hold: 1900,
      result: false,
      caption: t('8085 lands far left, near 8000 — too low for P.', '8085 jatuh jauh di kiri, dekat 8000 — terlalu rendah untuk P.'),
    },
    {
      phase: 'tooFar',
      showMidpoint: true,
      candidate: { value: '8850', fraction: F_8850, correct: false },
      hold: 1900,
      result: false,
      caption: t('8850 lands far right, near 9000 — too high for P.', '8850 jatuh jauh di kanan, dekat 9000 — terlalu tinggi untuk P.'),
    },
    {
      phase: 'result',
      showMidpoint: true,
      candidate: { value: '8580', fraction: F_8580, correct: true },
      hold: 0,
      result: true,
      caption: t('8580 sits just past 8500 — the only choice near P. Answer D.', '8580 tepat sesudah 8500 — satu-satunya pilihan dekat P. Jawaban D.'),
    },
  ]

  return { answer: 'D', steps, finalIndex: steps.length - 1 }
}
