// Storyboard for WMI-25F2A-Q19 (2025 Grade-2 Final, product grid).
// Pure builder: (lang) => ordered beats. No randomness, no Date — SSR-safe.
//
// Method taught: each shaded cell is the PRODUCT of the two white cells in its
// row/column, so we deduce the white cells one at a time, then read the "?".
//   col 1: a*c = 42, row 1: a*b = 30, row 2: c*d = 56  ->  a=6, b=5, c=7, d=8
//   visible ? = col 2 = b*d = 5*8 = 40.
//
// FLAG (honest): the paper key totals 61 across TWO "?" squares, but the scan
// captured only ONE sub-grid (one "?"). We solve that grid to 40, then state
// plainly that 61 = 40 + 21 where 21 is the second grid's "?" — a grid the scan
// did NOT capture, so we do NOT fabricate it.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PRODUCT_SOLUTION25, VISIBLE_Q_VALUE25 } from './ProductGrid25G2Illustration'

export type WhiteName = 'a' | 'b' | 'c' | 'd'

export interface ProductGridStep {
  /** White cells solved so far (drives the figure's `whites` reveal). */
  whites: Partial<Record<WhiteName, number>>
  /** Reveal the visible "?" as 40 on the figure. */
  revealQ: boolean
  /** Highlight one shaded clue (its grid key, e.g. '0-1') this beat, or null. */
  focusClue: string | null
  caption: string
  hold: number
  /** True on the final, winning beat. */
  result: boolean
  /** Honest "scan is incomplete" note (final beat) — renders a caution badge. */
  flagged?: boolean
}

export interface ProductGridStoryboard {
  /** Full keyed answer per the paper. */
  answer: string
  /** The value this (single, captured) grid's "?" resolves to. */
  visibleQ: number
  steps: ProductGridStep[]
  finalIndex: number
}

export function buildProductGrid25Steps(lang: Lang): ProductGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { a, b, c, d } = PRODUCT_SOLUTION25 // a=6, b=5, c=7, d=8
  const q = VISIBLE_Q_VALUE25 // 40 = b*d
  const SECOND = 61 - q // 21 — lives in the missing sub-grid (NOT drawn)

  const steps: ProductGridStep[] = [
    {
      whites: {},
      revealQ: false,
      focusClue: null,
      hold: 2600,
      result: false,
      caption: t(
        'Rule: each shaded number is the two white squares in its row or column MULTIPLIED. Fill the white squares first.',
        'Aturan: tiap angka arsiran adalah dua kotak putih di baris atau kolomnya yang DIKALI. Isi kotak putih dulu.',
      ),
    },
    {
      // Column 1 (a*c=42) and row 1 (a*b=30) share cell a. The common factor 6
      // works for both: 42 = 6*7 and 30 = 6*5. So a = 6.
      whites: { a },
      revealQ: false,
      focusClue: '0-1',
      hold: 2300,
      result: false,
      caption: t(
        `Cell a sits in BOTH the 42 column and the 30 row. The number that divides 42 AND 30 is ${a} → a = ${a}.`,
        `Kotak a ada di kolom 42 DAN baris 30. Bilangan yang membagi 42 DAN 30 adalah ${a} → a = ${a}.`,
      ),
    },
    {
      // Column 1: a*c = 42, so c = 42 / a = 7.
      whites: { a, c },
      revealQ: false,
      focusClue: '0-1',
      hold: 2100,
      result: false,
      caption: t(
        `Column: a x c = 42, and a = ${a}, so c = 42 ÷ ${a} = ${c}.`,
        `Kolom: a x c = 42, dan a = ${a}, jadi c = 42 ÷ ${a} = ${c}.`,
      ),
    },
    {
      // Row 1: a*b = 30, so b = 30 / a = 5.
      whites: { a, b, c },
      revealQ: false,
      focusClue: '1-3',
      hold: 2100,
      result: false,
      caption: t(
        `Row: a x b = 30, and a = ${a}, so b = 30 ÷ ${a} = ${b}.`,
        `Baris: a x b = 30, dan a = ${a}, jadi b = 30 ÷ ${a} = ${b}.`,
      ),
    },
    {
      // Row 2: c*d = 56, so d = 56 / c = 8. Check: all four are different.
      whites: { a, b, c, d },
      revealQ: false,
      focusClue: '2-0',
      hold: 2300,
      result: false,
      caption: t(
        `Row: c x d = 56, and c = ${c}, so d = 56 ÷ ${c} = ${d}. All four (${a}, ${b}, ${c}, ${d}) are different ✓.`,
        `Baris: c x d = 56, dan c = ${c}, jadi d = 56 ÷ ${c} = ${d}. Keempatnya (${a}, ${b}, ${c}, ${d}) berbeda ✓.`,
      ),
    },
    {
      // The visible "?" is column 2 = b*d = 40.
      whites: { a, b, c, d },
      revealQ: true,
      focusClue: '3-2',
      hold: 2300,
      result: false,
      caption: t(
        `Now the "?": it is b x d = ${b} x ${d} = ${q}. This grid's ? = ${q}.`,
        `Sekarang "?": itu adalah b x d = ${b} x ${d} = ${q}. ? pada grid ini = ${q}.`,
      ),
    },
    {
      whites: { a, b, c, d },
      revealQ: true,
      focusClue: null,
      hold: 0,
      result: true,
      flagged: true,
      caption: t(
        `Answer ${61}. The question adds TWO "?" squares: ${q} (this grid) + ${SECOND} (a second grid the scan did not capture) = ${61}.`,
        `Jawaban ${61}. Soal menjumlahkan DUA kotak "?": ${q} (grid ini) + ${SECOND} (grid kedua yang tak terekam scan) = ${61}.`,
      ),
    },
  ]

  return {
    answer: '61',
    visibleQ: q,
    steps,
    finalIndex: steps.length - 1,
  }
}
