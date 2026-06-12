import type { Lang } from '../concepts/explainers/makeTenSteps'
import { KK_ANSWER } from './KenKenGridIllustration'

export interface KenKenStep {
  /** Cells solved so far: "row-col" -> digit (givens always show on their own). */
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

export interface KenKenStoryboard {
  answer: string
  steps: KenKenStep[]
  finalIndex: number
}

// Deduction chain (row 0 = top, col 0 = left; full solution 4231/2413/3142/1324):
//   1. Top row already holds the given 1 → its other cells are {2,3,4}.
//   2. The 1− pair from {2,3,4} is {2,3} or {3,4}; if it were {3,4} the top-left
//      would be 2 and the 10+ cage would need 8 from two different cells (max 7).
//      → top-left = 4, 1− pair = {2,3}.
//   3. 10+ cage: the two cells under the 4 sum to 6 = {2,4}; column 0 already has
//      the 4 → A = (1,0) = 2 and (1,1) = 4.
//   4. Order the {2,3}: column 1 has the given 3 at the bottom → (0,1) = 2, (0,2) = 3.
//   5. Row 1 now has 2 and 4 → its missing digits {1,3} sit in the 6+ cage;
//      1 + 3 = 4 → the cage's third cell (2,3) = 2.
//   6. Column 3 has the 1 on top → C = (1,3) = 3 and (1,2) = 1.
//   7. Column 3 holds 1, 3, 2 → D = (3,3) = 4.
//   8. Column 0 has 4, 2 → {1,3} for the 2− cage (3−1=2 ✓); row 3 has the given 3
//      → B = (3,0) = 1 and (2,0) = 3.
//   9. Row-and-column fills the last three: (2,1)=1, (2,2)=4, (3,2)=2
//      (3− : 4−1=3 ✓; bottom 6+ : 2+4=6 ✓).
export function buildKenKenSteps(lang: Lang): KenKenStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const s1 = { '0-0': 4 }
  const s2 = { ...s1, '1-0': 2, '1-1': 4 }
  const s3 = { ...s2, '0-1': 2, '0-2': 3 }
  const s4 = { ...s3, '2-3': 2 }
  const s5 = { ...s4, '1-2': 1, '1-3': 3 }
  const s6 = { ...s5, '3-3': 4 }
  const s7 = { ...s6, '2-0': 3, '3-0': 1 }
  const s8 = { ...s7, '2-1': 1, '2-2': 4, '3-2': 2 }

  const steps: KenKenStep[] = [
    {
      solved: {},
      activeKeys: [],
      litKeys: ['0-3', '3-1'],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'Every row and column uses 1–4 once; cage labels give a sum (+) or difference (−). Two numbers are given: 1 and 3.',
        'Tiap baris dan kolom memuat 1–4 sekali; label bingkai memberi jumlah (+) atau selisih (−). Dua angka sudah ada: 1 dan 3.',
      ),
    },
    {
      solved: {},
      activeKeys: [],
      litKeys: ['0-0', '0-1', '0-2'],
      markAnswers: false,
      hold: 2400,
      result: false,
      caption: t(
        'The top row already has its 1 — so these three cells hold 2, 3, 4.',
        'Baris atas sudah punya 1 — jadi tiga kotak ini berisi 2, 3, 4.',
      ),
    },
    {
      solved: {},
      activeKeys: [],
      litKeys: ['0-1', '0-2'],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'The 1− pair must differ by 1: from 2, 3, 4 that is {2,3} or {3,4}.',
        'Pasangan 1− harus berselisih 1: dari 2, 3, 4 berarti {2,3} atau {3,4}.',
      ),
    },
    {
      solved: s1,
      activeKeys: ['0-0'],
      litKeys: ['1-0', '1-1'],
      markAnswers: false,
      hold: 3200,
      result: false,
      caption: t(
        'If the pair were {3,4}, the top-left would be 2 — and the 10+ cage would need 8 more from two different cells (at most 3+4=7). Impossible! So the top-left is 4.',
        'Kalau pasangannya {3,4}, kiri-atas jadi 2 — dan bingkai 10+ butuh 8 lagi dari dua kotak berbeda (paling banyak 3+4=7). Tidak mungkin! Jadi kiri-atas 4.',
      ),
    },
    {
      solved: s2,
      activeKeys: ['1-0', '1-1'],
      litKeys: ['0-0'],
      markAnswers: false,
      hold: 2800,
      result: false,
      caption: t(
        '10+ cage: 4 needs 6 more = {2,4}. The left cell cannot be another 4 (same column) → A = 2, and next to it 4.',
        'Bingkai 10+: 4 butuh 6 lagi = {2,4}. Kotak kiri tak boleh 4 lagi (satu kolom) → A = 2, dan di sebelahnya 4.',
      ),
    },
    {
      solved: s3,
      activeKeys: ['0-1', '0-2'],
      litKeys: ['3-1'],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'Order the {2,3}: the second column already has a 3 at the bottom → 2 goes here, then 3. Top row done: 4 2 3 1.',
        'Urutkan {2,3}: kolom kedua sudah punya 3 di bawah → 2 di sini, lalu 3. Baris atas selesai: 4 2 3 1.',
      ),
    },
    {
      solved: s4,
      activeKeys: ['2-3'],
      litKeys: ['1-2', '1-3'],
      markAnswers: false,
      hold: 2800,
      result: false,
      caption: t(
        'The second row has 2 and 4 → its missing digits are {1,3}, both in the 6+ cage. 1+3 = 4, so the cage’s third cell = 6 − 4 = 2.',
        'Baris kedua punya 2 dan 4 → sisanya {1,3}, keduanya di bingkai 6+. 1+3 = 4, jadi kotak ketiga bingkai = 6 − 4 = 2.',
      ),
    },
    {
      solved: s5,
      activeKeys: ['1-2', '1-3'],
      litKeys: ['0-3'],
      markAnswers: false,
      hold: 2400,
      result: false,
      caption: t(
        'The right column already has the 1 on top → C cannot be 1 → C = 3, and next to it 1.',
        'Kolom kanan sudah punya 1 di atas → C tak boleh 1 → C = 3, dan di sebelahnya 1.',
      ),
    },
    {
      solved: s6,
      activeKeys: ['3-3'],
      litKeys: ['0-3', '1-3', '2-3'],
      markAnswers: false,
      hold: 2200,
      result: false,
      caption: t(
        'The right column now holds 1, 3, 2 → the last corner D = 4.',
        'Kolom kanan kini berisi 1, 3, 2 → pojok terakhir D = 4.',
      ),
    },
    {
      solved: s7,
      activeKeys: ['2-0', '3-0'],
      litKeys: ['3-1'],
      markAnswers: false,
      hold: 2800,
      result: false,
      caption: t(
        'The left column has 4 and 2 → {1,3} remain for the 2− cage (3−1=2 ✓). The bottom row already has a 3 → B = 1, above it 3.',
        'Kolom kiri punya 4 dan 2 → sisa {1,3} untuk bingkai 2− (3−1=2 ✓). Baris bawah sudah punya 3 → B = 1, di atasnya 3.',
      ),
    },
    {
      solved: s8,
      activeKeys: ['2-1', '2-2', '3-2'],
      litKeys: [],
      markAnswers: false,
      hold: 2600,
      result: false,
      caption: t(
        'Row-and-column fills the last three cells: 1, 4, 2 — and the cages check out (3−: 4−1=3, bottom 6+: 2+4=6).',
        'Aturan baris-kolom mengisi tiga kotak terakhir: 1, 4, 2 — dan bingkainya cocok (3−: 4−1=3, 6+ bawah: 2+4=6).',
      ),
    },
    {
      solved: s8,
      activeKeys: [],
      litKeys: [],
      markAnswers: true,
      hold: 0,
      result: true,
      caption: t(`Read the corners: A, B, C, D = 2, 1, 3, 4 → ABCD = ${KK_ANSWER}.`, `Baca pojoknya: A, B, C, D = 2, 1, 3, 4 → ABCD = ${KK_ANSWER}.`),
    },
  ]

  return { answer: KK_ANSWER, steps, finalIndex: steps.length - 1 }
}
