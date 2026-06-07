import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_CELLS, KK_ANSWER } from './KenKenGridIllustration'

export type KenKenPhase = 'show' | 'rule' | 'fill' | 'result'

export interface KenKenStep {
  phase: KenKenPhase
  /** Number of ABCD answer cells filled in so far (0..4). */
  filled: number
  /** Index (0..3) of the answer cell being lit on this beat, or null. */
  active: number | null
  caption: string
  hold: number
  result: boolean
}

export interface KenKenStoryboard {
  answer: string
  steps: KenKenStep[]
  finalIndex: number
}

export function buildKenKenSteps(lang: Lang): KenKenStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KenKenStep[] = [
    {
      phase: 'show',
      filled: 0,
      active: null,
      caption: t(
        'Fill every square with 1, 2, 3, or 4. Find ABCD.',
        'Isi tiap kotak dengan 1, 2, 3, atau 4. Cari ABCD.',
      ),
      hold: 1700,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'Each row and each column must use 1, 2, 3, 4 with no repeats.',
        'Tiap baris dan tiap kolom harus memuat 1, 2, 3, 4 tanpa pengulangan.',
      ),
      hold: 2300,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'A thick cage label like "6+" means its numbers add to 6; "1−" means they differ by 1.',
        'Label kotak tebal seperti "6+" berarti jumlah angkanya 6; "1−" berarti selisihnya 1.',
      ),
      hold: 2500,
      result: false,
    },
  ]

  // Fill A, B, C, D one at a time, lighting each cell as its digit lands.
  ANSWER_CELLS.forEach((cell, i) => {
    steps.push({
      phase: 'fill',
      filled: i + 1,
      active: i,
      caption: t(
        `Working through the cage clues, ${cell.label} must be ${cell.value}.`,
        `Dari petunjuk kotak-kotaknya, ${cell.label} pasti ${cell.value}.`,
      ),
      hold: 1700,
      result: false,
    })
  })

  steps.push({
    phase: 'result',
    filled: ANSWER_CELLS.length,
    active: null,
    caption: t(`ABCD = ${KK_ANSWER}.`, `ABCD = ${KK_ANSWER}.`),
    hold: 0,
    result: true,
  })

  return { answer: KK_ANSWER, steps, finalIndex: steps.length - 1 }
}
