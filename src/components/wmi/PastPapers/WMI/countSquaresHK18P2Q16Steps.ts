// HKIMO-18-P2H-Q16 — beat steps for the animated explainer.
//
// Figure: 4-column × 3-row rectangular grid.
// Count all squares by size:
//   1×1: 4 columns × 3 rows = 12
//   2×2: 3 positions across × 2 positions down = 6
//   3×3: 2 positions across × 1 position down = 2
//   Total: 12 + 6 + 2 = 20
//
// 5 beats (0–4): intro → count 1×1 → count 2×2 → count 3×3 → answer.

export type SquareHighlight = 'none' | '1x1' | '2x2' | '3x3' | 'answer'

export interface CountSquaresHK18P2Q16Beat {
  caption: string
  highlight: SquareHighlight
  showAnswer: boolean
  hold: number
}

export interface CountSquaresHK18P2Q16Story {
  steps: CountSquaresHK18P2Q16Beat[]
  finalIndex: number
}

const EN: CountSquaresHK18P2Q16Beat[] = [
  {
    caption: 'Count squares of ALL sizes — not just the small unit squares!',
    highlight: 'none',
    showAnswer: false,
    hold: 2200,
  },
  {
    caption: 'Step 1: 1×1 unit squares. 4 columns × 3 rows = 12.',
    highlight: '1x1',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Step 2: 2×2 squares. 3 positions across × 2 positions down = 6.',
    highlight: '2x2',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Step 3: 3×3 squares. 2 positions across × 1 position down = 2.',
    highlight: '3x3',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Total: 12 + 6 + 2 = 20 squares!',
    highlight: 'answer',
    showAnswer: true,
    hold: 3000,
  },
]

const ID: CountSquaresHK18P2Q16Beat[] = [
  {
    caption: 'Hitung persegi dari SEMUA ukuran — bukan hanya persegi satuan kecil!',
    highlight: 'none',
    showAnswer: false,
    hold: 2200,
  },
  {
    caption: 'Langkah 1: Persegi 1×1. 4 kolom × 3 baris = 12.',
    highlight: '1x1',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Langkah 2: Persegi 2×2. 3 posisi mendatar × 2 posisi ke bawah = 6.',
    highlight: '2x2',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Langkah 3: Persegi 3×3. 2 posisi mendatar × 1 posisi ke bawah = 2.',
    highlight: '3x3',
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Total: 12 + 6 + 2 = 20 persegi!',
    highlight: 'answer',
    showAnswer: true,
    hold: 3000,
  },
]

export function buildCountSquaresHK18P2Q16Steps(lang: 'en' | 'id'): CountSquaresHK18P2Q16Story {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
