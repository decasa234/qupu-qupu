import type { Lang } from '../concepts/explainers/makeTenSteps'
import { KK_ANSWER, KK_N, KK_SOLUTION } from './KenKenGridIllustration'

export type KenKenPhase = 'show' | 'rule' | 'fill' | 'mark' | 'result'

export interface KenKenStep {
  phase: KenKenPhase
  /** How many top rows show their digits (0..4). */
  filledRows: number
  /** Row being filled on this beat, or null. */
  activeRow: number | null
  /** Tint + tag the ABCD answer cells. */
  markAnswers: boolean
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
  const rowStr = (r: number) => KK_SOLUTION[r].join(', ')

  const steps: KenKenStep[] = [
    {
      phase: 'show',
      filledRows: 0,
      activeRow: null,
      markAnswers: false,
      caption: t('Fill every square with 1, 2, 3, or 4. Find ABCD.', 'Isi tiap kotak dengan 1, 2, 3, atau 4. Cari ABCD.'),
      hold: 1700,
      result: false,
    },
    {
      phase: 'rule',
      filledRows: 0,
      activeRow: null,
      markAnswers: false,
      caption: t(
        'Each row and each column must use 1, 2, 3, 4 with no repeats.',
        'Tiap baris dan tiap kolom harus memuat 1, 2, 3, 4 tanpa pengulangan.',
      ),
      hold: 2300,
      result: false,
    },
    {
      phase: 'rule',
      filledRows: 0,
      activeRow: null,
      markAnswers: false,
      caption: t(
        'A thick cage label like "6+" means its numbers add to 6; "1−" means they differ by 1.',
        'Label kotak tebal seperti "6+" berarti jumlah angkanya 6; "1−" berarti selisihnya 1.',
      ),
      hold: 2500,
      result: false,
    },
  ]

  // Fill the whole grid one row at a time so every box gets a number.
  const rowCaption = (r: number): string => {
    const s = rowStr(r)
    if (r === 0) return t(`Top row: ${s} — 1, 2, 3, 4 each used once.`, `Baris atas: ${s} — 1, 2, 3, 4 masing-masing sekali.`)
    if (r === KK_N - 1)
      return t(
        `Bottom row: ${s}. The grid is full — every row and column holds 1–4.`,
        `Baris bawah: ${s}. Kisi penuh — tiap baris dan kolom memuat 1–4.`,
      )
    return t(`Row ${r + 1}: ${s}.`, `Baris ${r + 1}: ${s}.`)
  }

  for (let r = 0; r < KK_N; r++) {
    steps.push({
      phase: 'fill',
      filledRows: r + 1,
      activeRow: r,
      markAnswers: false,
      caption: rowCaption(r),
      hold: r === KK_N - 1 ? 1900 : 1600,
      result: false,
    })
  }

  steps.push({
    phase: 'mark',
    filledRows: KK_N,
    activeRow: null,
    markAnswers: true,
    caption: t('Now read the four marked cells: A, B, C, D.', 'Sekarang baca empat kotak bertanda: A, B, C, D.'),
    hold: 1900,
    result: false,
  })

  steps.push({
    phase: 'result',
    filledRows: KK_N,
    activeRow: null,
    markAnswers: true,
    caption: t(`ABCD = ${KK_ANSWER}.`, `ABCD = ${KK_ANSWER}.`),
    hold: 0,
    result: true,
  })

  return { answer: KK_ANSWER, steps, finalIndex: steps.length - 1 }
}
