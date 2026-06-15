import type { Lang } from '../concepts/explainers/makeTenSteps'
import { DIAMOND, DOT, Q21_ANSWER, Q21_SOLUTION, STAR } from './P22G3Q21Illustration'

// Storyboard for WMI-22P3A-Q21 — fill the 3x3 grid with 1..9 (no repeats) so
// every labelled row/column matches its total, then add ● + ◆ + ★.
//
// Verified unique fill: 3 9 4 / 1 5 7 / 8 2 6.
// Deductions used in the beats:
//   • whole grid 1..9 sums to 45.
//   • row 0 = 16, row 1 = 13 -> row 2 = 45 - 16 - 13 = 16.
//   • col 0 = 12, col 1 = 16 -> col 2 = 45 - 12 - 16 = 17.
//   • bottom-left is given 8; col 0 = 12 -> the other two col-0 cells sum to 4
//     -> top-left ● = 3, mid-left = 1 (the only 1..9 split that fits row sums).
//   • bottom-right ◆ = 6 falls out of col 2 = 17 and row 2 = 16.
// Result: ● + ◆ + ★ = 3 + 6 + 8 = 17 (answer B).

type Filled = ReadonlyArray<ReadonlyArray<number | null>>
const N = null

export interface Q21Step {
  filled: Filled
  highlight: 'row0' | 'row1' | 'col0' | 'col1' | null
  caption: string
  hold: number
  result: boolean
}

export interface Q21Storyboard {
  dot: number
  diamond: number
  star: number
  answer: number
  steps: Q21Step[]
  finalIndex: number
}

export function buildP22G3Q21Steps(lang: Lang): Q21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const S = Q21_SOLUTION
  const blank: Filled = [
    [N, N, N],
    [N, N, N],
    [N, N, N],
  ]
  // After filling column 0 (top-left 3, mid-left 1; bottom-left 8 is given).
  const col0: Filled = [
    [S[0][0], N, N],
    [S[1][0], N, N],
    [N, N, N],
  ]
  // After completing the rows with the line totals.
  const rows: Filled = [
    [S[0][0], S[0][1], S[0][2]],
    [S[1][0], S[1][1], S[1][2]],
    [N, N, N],
  ]
  const full: Filled = S

  const steps: Q21Step[] = [
    {
      filled: blank,
      highlight: null,
      hold: 2100,
      result: false,
      caption: t(
        'The nine cells use 1–9 once each, so the whole grid always adds to 45.',
        'Sembilan sel memakai 1–9 sekali tiap, jadi seluruh kisi selalu berjumlah 45.',
      ),
    },
    {
      filled: blank,
      highlight: 'col0',
      hold: 2400,
      result: false,
      caption: t(
        'Column 1 totals 12 and already has the 8 at the bottom, so the top two cells of column 1 add to 12 − 8 = 4 → that must be 3 and 1.',
        'Kolom 1 berjumlah 12 dan sudah ada 8 di bawah, jadi dua sel atas kolom 1 berjumlah 12 − 8 = 4 → pasti 3 dan 1.',
      ),
    },
    {
      filled: col0,
      highlight: 'row0',
      hold: 2400,
      result: false,
      caption: t(
        'Row 1 totals 16. With ● = 3 on the left, the other two cells add to 13, fixing 9 and 4 → row 1 is 3, 9, 4.',
        'Baris 1 berjumlah 16. Dengan ● = 3 di kiri, dua sel lain berjumlah 13, mengunci 9 dan 4 → baris 1 jadi 3, 9, 4.',
      ),
    },
    {
      filled: rows,
      highlight: 'row1',
      hold: 2400,
      result: false,
      caption: t(
        'Row 2 totals 13. With 1 on the left, the rest add to 12, giving 5 and 7 → row 2 is 1, 5, 7. The last row 8, 2, 6 is what is left.',
        'Baris 2 berjumlah 13. Dengan 1 di kiri, sisanya berjumlah 12, memberi 5 dan 7 → baris 2 jadi 1, 5, 7. Baris terakhir 8, 2, 6 adalah sisanya.',
      ),
    },
    {
      filled: full,
      highlight: null,
      hold: 2200,
      result: false,
      caption: t(
        `Now read the marks: ● = ${DOT}, ◆ = ${DIAMOND}, and ★ = ${STAR} (the given 8).`,
        `Sekarang baca tandanya: ● = ${DOT}, ◆ = ${DIAMOND}, dan ★ = ${STAR} (angka 8 yang diberikan).`,
      ),
    },
    {
      filled: full,
      highlight: null,
      hold: 0,
      result: true,
      caption: t(
        `● + ◆ + ★ = ${DOT} + ${DIAMOND} + ${STAR} = ${Q21_ANSWER} — answer B.`,
        `● + ◆ + ★ = ${DOT} + ${DIAMOND} + ${STAR} = ${Q21_ANSWER} — jawaban B.`,
      ),
    },
  ]

  return { dot: DOT, diamond: DIAMOND, star: STAR, answer: Q21_ANSWER, steps, finalIndex: steps.length - 1 }
}
