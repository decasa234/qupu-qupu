import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { KK20_ANSWER } from './KenKen20Illustration'

export interface KenKen20Step {
  /** Cells solved so far: "row-col" -> digit (the given 1 always shows on its own). */
  solved: Record<string, number>
  /** Cell keys deduced on this beat (green). */
  activeKeys: string[]
  /** Cell keys the deduction is "looking at" (amber dashed ring). */
  litKeys: string[]
  markAnswers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface KenKen20Storyboard {
  answer: string
  steps: KenKen20Step[]
  finalIndex: number
}

// Deduction chain (row 0 = top, col 0 = left; full solution 2431/1324/3142/4213):
//   1. The bottom 6+ cage covers the whole bottom row except (3,0); a row totals
//      1+2+3+4 = 10, so (3,0) = 10 − 6 = 4.
//   2. 1− cage above it: a neighbour of 4 is 3 or 5; only 3 exists → (2,0) = 3.
//   3. 10+ cage corner (2,2): can't be 5, and 3 would repeat in row 2 → 4.
//   4. Its two column-3 cells add to 6 = {2,4}; 4 next to the corner 4 would
//      repeat in row 2 → (1,3) = 4, (2,3) = 2 = D.
//   5. Row 2 reads 3 _ 4 2 → (2,1) = 1.
//   6. The 6+ cage already holds that 1 → its row-1 cells add to 5 = {2,3};
//      row 1's leftover is 1 → A = (1,0) = 1, and the 1− above makes (0,0) = 2.
//   7. Top row still needs {3,4}. A 3 at (0,1) would force a second 4 into the
//      bottom row (column 1 would need 4 at (3,1)) ✗ → (0,1) = 4, (0,2) = 3,
//      so the cage splits (1,1) = 3, (1,2) = 2 = C.
//   8. Column fills the rest: B = (3,1) = 2, (3,2) = 1, (3,3) = 3. ABCD = 1222.
export function buildKenKen20Steps(lang: Lang): KenKen20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const s1 = { '3-0': 4 }
  const s2 = { ...s1, '2-0': 3 }
  const s3 = { ...s2, '2-2': 4 }
  const s4 = { ...s3, '1-3': 4, '2-3': 2 }
  const s5 = { ...s4, '2-1': 1 }
  const s6 = { ...s5, '1-0': 1, '0-0': 2 }
  const s7 = { ...s6, '0-1': 4, '0-2': 3, '1-1': 3, '1-2': 2 }
  const s8 = { ...s7, '3-1': 2, '3-2': 1, '3-3': 3 }

  const steps: KenKen20Step[] = [
    {
      solved: {},
      activeKeys: [],
      litKeys: ['0-3'],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'Every row and column uses 1–4 once — so each row adds up to 10. One number is given: the 1 in the top-right corner.',
        'Tiap baris dan kolom memuat 1–4 sekali — jadi tiap baris berjumlah 10. Satu angka sudah ada: 1 di pojok kanan atas.',
      ),
    },
    {
      solved: s1,
      activeKeys: ['3-0'],
      litKeys: ['3-1', '3-2', '3-3'],
      markAnswers: false,
      hold: 2500,
      result: false,
      caption: t(
        'The bottom 6+ cage covers the whole bottom row except its first cell. The row totals 10, so that cell is 10 − 6 = 4.',
        'Bingkai 6+ bawah mengisi seluruh baris bawah kecuali sel pertamanya. Baris berjumlah 10, jadi sel itu 10 − 6 = 4.',
      ),
    },
    {
      solved: s2,
      activeKeys: ['2-0'],
      litKeys: ['3-0'],
      markAnswers: false,
      hold: 2300,
      result: false,
      caption: t(
        'The 1− cage above the 4 needs a neighbour of 4: that is 3 or 5 — and 5 does not exist. So it is 3.',
        'Bingkai 1− di atas angka 4 butuh tetangga dari 4: yaitu 3 atau 5 — dan 5 tidak ada. Jadi isinya 3.',
      ),
    },
    {
      solved: s3,
      activeKeys: ['2-2'],
      litKeys: ['1-3', '2-3'],
      markAnswers: false,
      hold: 2500,
      result: false,
      caption: t(
        '10+ cage: its corner cell cannot be 5, and a 3 would repeat in its row (the 3 is already there) — so the corner is 4.',
        'Bingkai 10+: sel sikunya tidak mungkin 5, dan angka 3 akan kembar di barisnya (3 sudah ada) — jadi sikunya 4.',
      ),
    },
    {
      solved: s4,
      activeKeys: ['1-3', '2-3'],
      litKeys: ['2-2'],
      markAnswers: false,
      hold: 2500,
      result: false,
      caption: t(
        'Its two column-4 cells add to 10 − 4 = 6, so they are 2 and 4. The 4 cannot sit beside the corner 4 in the same row → top 4, bottom 2. D = 2!',
        'Dua sel kolom-4 miliknya berjumlah 10 − 4 = 6, yaitu 2 dan 4. Angka 4 tidak boleh sebaris dengan 4 di siku → atas 4, bawah 2. D = 2!',
      ),
    },
    {
      solved: s5,
      activeKeys: ['2-1'],
      litKeys: ['2-0', '2-2', '2-3'],
      markAnswers: false,
      hold: 2200,
      result: false,
      caption: t(
        'Row 3 now reads 3, _, 4, 2 — the gap can only be 1.',
        'Baris 3 kini terbaca 3, _, 4, 2 — celahnya hanya bisa 1.',
      ),
    },
    {
      solved: s6,
      activeKeys: ['1-0', '0-0'],
      litKeys: ['1-1', '1-2', '2-1'],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'The 6+ cage already holds that 1, so its two upper cells add to 5 = {2, 3}. Their row’s leftover digit 1 goes to the first cell: A = 1 — and the 1− cage above it makes the top-left 2.',
        'Bingkai 6+ sudah memuat 1 itu, jadi dua sel atasnya berjumlah 5 = {2, 3}. Sisa angka barisnya, 1, mengisi sel pertama: A = 1 — dan bingkai 1− di atasnya membuat pojok kiri atas 2.',
      ),
    },
    {
      solved: s7,
      activeKeys: ['0-1', '0-2', '1-1', '1-2'],
      litKeys: [],
      markAnswers: false,
      hold: 2700,
      result: false,
      caption: t(
        'The top row still needs 3 and 4. Trying the 3 in column 2 would force a second 4 into the bottom row ✗ — so column 2 takes the 4, and the cage splits 3 + 2. C = 2!',
        'Baris atas masih butuh 3 dan 4. Mencoba 3 di kolom 2 memaksa 4 kembar di baris bawah ✗ — jadi kolom 2 berisi 4, dan bingkai terbagi 3 + 2. C = 2!',
      ),
    },
    {
      solved: s8,
      activeKeys: ['3-1', '3-2', '3-3'],
      litKeys: [],
      markAnswers: true,
      hold: 0,
      result: true,
      caption: t(
        `The last gaps fill row by row: B = 2 (check: 2 + 1 + 3 = 6 ✓). Read the letters: ABCD = ${KK20_ANSWER}.`,
        `Celah terakhir terisi baris demi baris: B = 2 (cek: 2 + 1 + 3 = 6 ✓). Baca hurufnya: ABCD = ${KK20_ANSWER}.`,
      ),
    },
  ]

  return { answer: KK20_ANSWER, steps, finalIndex: steps.length - 1 }
}
