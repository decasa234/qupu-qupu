import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-23P2A-Q24 (2023 Semifinal Grade 2 Paper A) — fruit product table.
//   apple × banana × banana = 16
//   apple × banana × cherry = 56
//   banana × banana × cherry = 28
//   Legend below the grid = COLUMN products: banana column = 8; the apple and
//   cherry column products hide behind the pink and blue circles.
//   Find pink + blue.   Seed answer: D (130).
//
// METHOD (all numbers verified):
//   • banana column = 🍌×🍌×🍌 = 8  →  🍌 = 2.
//   • rows 2 ÷ 3 share 🍌 and 🍒: they cancel → 🍎 = (56 ÷ 28) × 🍌 = 2 × 2 = 4.
//   • row 2: 4 × 2 × 🍒 = 56 → 🍒 = 7.  (Check row 1: 4 × 2 × 2 = 16 ✓)
//   • pink = apple column = 4 × 4 × 2 = 32;  blue = cherry column = 2 × 7 × 7 = 98.
//   • 32 + 98 = 130 → option D.

export interface FruitStep {
  caption: string
  /** Row indices to outline this beat (the two equations being compared). */
  markRows: number[]
  /** Resolved legend values to print, e.g. { apple, cherry } (column products). */
  reveal: { apple?: number; cherry?: number } | null
  /** True only on the final answer beat. */
  result: boolean
  hold: number
}

export interface FruitStoryboard {
  answerLetter: string
  steps: FruitStep[]
  finalIndex: number
}

export function buildP23G2Q24Steps(lang: Lang, answerLetter: string): FruitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FruitStep[] = [
    {
      caption: t(
        'The legend shows COLUMN products. The middle column: 🍌 × 🍌 × 🍌 = 8, so 🍌 = 2.',
        'Legenda menunjukkan hasil kali KOLOM. Kolom tengah: 🍌 × 🍌 × 🍌 = 8, jadi 🍌 = 2.',
      ),
      markRows: [],
      reveal: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        'Rows 2 and 3 share 🍌 and 🍒. They cancel: 🍎 = (56 ÷ 28) × 🍌 = 2 × 2 = 4.',
        'Baris 2 dan 3 berbagi 🍌 dan 🍒. Keduanya hapus: 🍎 = (56 ÷ 28) × 🍌 = 2 × 2 = 4.',
      ),
      markRows: [1, 2],
      reveal: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        'Row 2: 4 × 2 × 🍒 = 56, so 🍒 = 7. Check row 1: 4 × 2 × 2 = 16 ✓',
        'Baris 2: 4 × 2 × 🍒 = 56, jadi 🍒 = 7. Cek baris 1: 4 × 2 × 2 = 16 ✓',
      ),
      markRows: [0, 1],
      reveal: null,
      result: false,
      hold: 2600,
    },
    {
      caption: t(
        'Pink = 🍎 column = 4 × 4 × 2 = 32. Blue = 🍒 column = 2 × 7 × 7 = 98.',
        'Merah muda = kolom 🍎 = 4 × 4 × 2 = 32. Biru = kolom 🍒 = 2 × 7 × 7 = 98.',
      ),
      markRows: [],
      reveal: { apple: 32, cherry: 98 },
      result: false,
      hold: 2800,
    },
    {
      caption: t(
        '32 + 98 = 130 — option D.',
        '32 + 98 = 130 — pilihan D.',
      ),
      markRows: [],
      reveal: { apple: 32, cherry: 98 },
      result: true,
      hold: 0,
    },
  ]

  return { answerLetter, steps, finalIndex: steps.length - 1 }
}
