/**
 * Beat-by-beat storyboard for OSN 2024 SD Nasional Eksperimen Q2.
 *
 * Problem: pick 6 distinct tiles from 1–23 (no 20); form two groups of 3:
 *   (a,b,c) with a+b+c=20 and (d,e,f) with d+e+f=24.
 *   Maximize D = a×b×c × d×e×f.
 * Answer: groups {4,7,9} and {6,8,10}  →  D = 252 × 480 = 120 960.
 */

// bound to seed quantities
export const GROUP1 = [4, 7, 9]   // sum = 20, product = 252
export const GROUP2 = [6, 8, 10]  // sum = 24, product = 480
export const PROD1 = 252
export const PROD2 = 480
export const D_MAX = 120960

type Lang = 'en' | 'id'

export interface TrianglesStep {
  /** Which group-1 corner values to display (undefined = show variable letters) */
  g1: [number | 'a', number | 'b', number | 'c']
  /** Which group-2 corner values to display (undefined = show variable letters) */
  g2: [number | 'd', number | 'e', number | 'f']
  caption: string
  hold: number
  result: boolean
}

export interface TrianglesStoryboard {
  steps: TrianglesStep[]
  finalIndex: number
}

export function buildTrianglesOSN24NEKQ2Steps(lang: Lang): TrianglesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrianglesStep[] = [
    {
      g1: ['a', 'b', 'c'],
      g2: ['d', 'e', 'f'],
      caption: t(
        'Choose 6 distinct tiles (1–23, not 20) so a+b+c=20 and d+e+f=24. Goal: maximise D = a×b×c × d×e×f.',
        'Pilih 6 ubin berbeda (1–23, bukan 20) sehingga a+b+c=20 dan d+e+f=24. Tujuan: maksimalkan D = a×b×c × d×e×f.',
      ),
      hold: 2000,
      result: false,
    },
    {
      g1: ['a', 'b', 'c'],
      g2: ['d', 'e', 'f'],
      caption: t(
        'AM-GM rule: for a fixed sum, balanced numbers give the highest product. Choose numbers as equal and as large as possible.',
        'Aturan AM-GM: untuk jumlah tetap, angka yang seimbang menghasilkan produk tertinggi. Pilih angka sepaling seimbang dan sebesar mungkin.',
      ),
      hold: 2200,
      result: false,
    },
    {
      g1: [4, 7, 9],
      g2: ['d', 'e', 'f'],
      caption: t(
        `Group 1 = {4, 7, 9}: 4+7+9 = 20 ✓, product = 4×7×9 = ${PROD1}. Keeping large tiles {6,8,10} free for group 2.`,
        `Kelompok 1 = {4, 7, 9}: 4+7+9 = 20 ✓, produk = 4×7×9 = ${PROD1}. Menyisakan ubin besar {6,8,10} untuk kelompok 2.`,
      ),
      hold: 2200,
      result: false,
    },
    {
      g1: [4, 7, 9],
      g2: [6, 8, 10],
      caption: t(
        `Group 2 = {6, 8, 10}: 6+8+10 = 24 ✓, product = 6×8×10 = ${PROD2}. All 6 tiles distinct ✓.`,
        `Kelompok 2 = {6, 8, 10}: 6+8+10 = 24 ✓, produk = 6×8×10 = ${PROD2}. Semua 6 ubin berbeda ✓.`,
      ),
      hold: 2200,
      result: false,
    },
    {
      g1: [4, 7, 9],
      g2: [6, 8, 10],
      caption: t(
        `D = ${PROD1} × ${PROD2} = ${D_MAX.toLocaleString()} — this is the maximum. ✓`,
        `D = ${PROD1} × ${PROD2} = ${D_MAX.toLocaleString()} — ini adalah nilai maksimum. ✓`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
