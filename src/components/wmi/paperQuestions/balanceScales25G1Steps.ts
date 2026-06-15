import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, MAX_TOTAL, MIN_TOTAL } from './BalanceScales25G1Illustration'

// WMI-25F1A-Q22 — three balance scales relate a green ball (b) and a yellow
// square (s), both whole numbers >= 1:
//   Scale 1 (left down):  2b  > s
//   Scale 2 (right down): 3b  < 2s
//   Scale 3 (left down):  12  > b + s   (the pink "12" block outweighs b + s)
// Only two whole-number pairs satisfy all three: (b=3, s=5) total 8 and
// (b=4, s=7) total 11. Asked: largest total − smallest total = 11 − 8 = 3.
//
// This storyboard lights one scale per beat to read its rule, then narrows the
// ball to {3,4} and the square to {5,7}, surfaces the two valid totals, and
// lands the difference on the result beat. Pure (lang) => beats. SSR-safe.

export type ScalesPhase = 'intro' | 'scale' | 'narrow' | 'totals' | 'result'

export interface BalanceScalesStep {
  phase: ScalesPhase
  /** Which scale (1..3) to spotlight; others dim. null = all neutral. */
  litScale: number | null
  /** The inequality this beat reads, shown as a chip (null off scale beats). */
  rule: string | null
  /** Ball candidates known so far (e.g. [3,4]); null until narrowed. */
  ballCandidates: number[] | null
  /** Square candidates known so far (e.g. [5,7]); null until narrowed. */
  squareCandidates: number[] | null
  /** The two valid totals, surfaced on the totals/result beats. */
  totals: number[] | null
  caption: string
  hold: number
  result: boolean
}

export interface BalanceScalesStoryboard {
  answer: number
  maxTotal: number
  minTotal: number
  steps: BalanceScalesStep[]
  finalIndex: number
}

export function buildBalanceScales25G1Steps(lang: Lang): BalanceScalesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BalanceScalesStep[] = [
    {
      phase: 'intro',
      litScale: null,
      rule: null,
      ballCandidates: null,
      squareCandidates: null,
      totals: null,
      hold: 2000,
      result: false,
      caption: t(
        'The ball (b) and square (s) hide whole-number weights. Read each scale to pin them down.',
        'Bola (b) dan persegi (s) menyembunyikan berat bilangan bulat. Baca tiap timbangan untuk menemukannya.',
      ),
    },
    {
      phase: 'scale',
      litScale: 1,
      rule: '2b > s',
      ballCandidates: null,
      squareCandidates: null,
      totals: null,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 1 tips left: two balls beat one square, so 2b > s.',
        'Timbangan 1 miring kiri: dua bola mengalahkan satu persegi, jadi 2b > s.',
      ),
    },
    {
      phase: 'scale',
      litScale: 2,
      rule: '3b < 2s',
      ballCandidates: null,
      squareCandidates: null,
      totals: null,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 2 tips right: two squares beat three balls, so 3b < 2s.',
        'Timbangan 2 miring kanan: dua persegi mengalahkan tiga bola, jadi 3b < 2s.',
      ),
    },
    {
      phase: 'scale',
      litScale: 3,
      rule: '12 > b + s',
      ballCandidates: null,
      squareCandidates: null,
      totals: null,
      hold: 2200,
      result: false,
      caption: t(
        'Scale 3 tips left: the "12" block beats a square plus a ball, so b + s < 12.',
        'Timbangan 3 miring kiri: balok "12" mengalahkan satu persegi tambah satu bola, jadi b + s < 12.',
      ),
    },
    {
      phase: 'narrow',
      litScale: null,
      rule: null,
      ballCandidates: [3, 4],
      squareCandidates: [5, 7],
      totals: null,
      hold: 2400,
      result: false,
      caption: t(
        'Try whole numbers: 2b > s and 3b < 2s squeeze the ball to 3 or 4, and the square to 5 or 7.',
        'Coba bilangan bulat: 2b > s dan 3b < 2s menjepit bola jadi 3 atau 4, dan persegi jadi 5 atau 7.',
      ),
    },
    {
      phase: 'totals',
      litScale: null,
      rule: null,
      ballCandidates: [3, 4],
      squareCandidates: [5, 7],
      totals: [MIN_TOTAL, MAX_TOTAL],
      hold: 2400,
      result: false,
      caption: t(
        `Only b=3,s=5 (and b+s<12) gives ${MIN_TOTAL}, and b=4,s=7 gives ${MAX_TOTAL}. Two totals!`,
        `Hanya b=3,s=5 (dan b+s<12) memberi ${MIN_TOTAL}, dan b=4,s=7 memberi ${MAX_TOTAL}. Dua total!`,
      ),
    },
    {
      phase: 'result',
      litScale: null,
      rule: null,
      ballCandidates: [3, 4],
      squareCandidates: [5, 7],
      totals: [MIN_TOTAL, MAX_TOTAL],
      hold: 0,
      result: true,
      caption: t(
        `Biggest − smallest = ${MAX_TOTAL} − ${MIN_TOTAL} = ${ANSWER}.`,
        `Terbesar − terkecil = ${MAX_TOTAL} − ${MIN_TOTAL} = ${ANSWER}.`,
      ),
    },
  ]

  return { answer: ANSWER, maxTotal: MAX_TOTAL, minTotal: MIN_TOTAL, steps, finalIndex: steps.length - 1 }
}
