import type { Lang } from '../concepts/explainers/makeTenSteps'
import { KKG2_ANSWER_CELLS, KKG2_ANSWER } from './KenKenG2Illustration'

export type KenKenG2Phase = 'show' | 'rule' | 'fill' | 'result'

export interface KenKenG2Step {
  phase: KenKenG2Phase
  /** Number of ABCD answer cells filled in so far (0..4). */
  filled: number
  /** Index (0..3) of the answer cell being lit on this beat, or null. */
  active: number | null
  caption: string
  hold: number
  result: boolean
}

export interface KenKenG2Storyboard {
  answer: string
  steps: KenKenG2Step[]
  finalIndex: number
}

export function buildKenKenG2Steps(lang: Lang): KenKenG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KenKenG2Step[] = [
    {
      phase: 'show',
      filled: 0,
      active: null,
      caption: t(
        'Fill every square with 1, 2, 3, or 4. Find the corners ABCD.',
        'Isi tiap kotak dengan 1, 2, 3, atau 4. Cari pojok-pojoknya ABCD.',
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
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'Start from the givens (the 1 and the 3), then let the cages pin down the rest.',
        'Mulai dari angka yang sudah ada (1 dan 3), lalu biarkan kotak-kotak menentukan sisanya.',
      ),
      hold: 2300,
      result: false,
    },
  ]

  // Fill A, B, C, D one at a time, lighting each cell as its digit lands. We keep
  // the captions generic ("working through the cage clues") rather than asserting a
  // specific single-cage deduction, to avoid claiming an impossible intermediate step.
  KKG2_ANSWER_CELLS.forEach((cell, i) => {
    steps.push({
      phase: 'fill',
      filled: i + 1,
      active: i,
      caption: t(
        `Working through the cage clues, corner ${cell.label} must be ${cell.value}.`,
        `Dari petunjuk kotak-kotaknya, pojok ${cell.label} pasti ${cell.value}.`,
      ),
      hold: 1700,
      result: false,
    })
  })

  steps.push({
    phase: 'result',
    filled: KKG2_ANSWER_CELLS.length,
    active: null,
    caption: t(`Reading the corners: ABCD = ${KKG2_ANSWER}.`, `Membaca pojok-pojoknya: ABCD = ${KKG2_ANSWER}.`),
    hold: 0,
    result: true,
  })

  return { answer: KKG2_ANSWER, steps, finalIndex: steps.length - 1 }
}
