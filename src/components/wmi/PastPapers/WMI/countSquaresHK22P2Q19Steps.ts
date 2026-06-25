// HKIMO-22-P2H-Q19 — beat steps for the animated explainer.
//
// Figure: 3-column × 3-row rectangular grid.
// Count all squares by size:
//   1×1: 3 columns × 3 rows = 9
//   2×2: 2 positions across × 2 positions down = 4
//   3×3: 1 position across × 1 position down = 1
//   Total: 9 + 4 + 1 = 14
//
// 5 beats (0–4): intro → count 1×1 → count 2×2 → count 3×3 → answer.

export type SquareHighlight22P2Q19 = 'none' | '1x1' | '2x2' | '3x3' | 'answer'

export interface CountSquaresHK22P2Q19Beat {
  caption: string
  highlight: SquareHighlight22P2Q19
  hold: number
}

export interface CountSquaresHK22P2Q19Story {
  steps: CountSquaresHK22P2Q19Beat[]
  finalIndex: number
}

const EN: CountSquaresHK22P2Q19Beat[] = [
  {
    caption: 'Count squares of ALL sizes — not just the small unit squares!',
    highlight: 'none',
    hold: 2200,
  },
  {
    caption: 'Step 1: 1×1 unit squares. 3 columns × 3 rows = 9.',
    highlight: '1x1',
    hold: 2400,
  },
  {
    caption: 'Step 2: 2×2 squares. 2 positions across × 2 positions down = 4.',
    highlight: '2x2',
    hold: 2400,
  },
  {
    caption: 'Step 3: 3×3 squares. Just 1 — the whole grid itself!',
    highlight: '3x3',
    hold: 2400,
  },
  {
    caption: 'Total: 9 + 4 + 1 = 14 squares!',
    highlight: 'answer',
    hold: 3000,
  },
]

const ID: CountSquaresHK22P2Q19Beat[] = [
  {
    caption: 'Hitung persegi dari SEMUA ukuran — bukan hanya persegi satuan kecil!',
    highlight: 'none',
    hold: 2200,
  },
  {
    caption: 'Langkah 1: Persegi 1×1. 3 kolom × 3 baris = 9.',
    highlight: '1x1',
    hold: 2400,
  },
  {
    caption: 'Langkah 2: Persegi 2×2. 2 posisi mendatar × 2 posisi ke bawah = 4.',
    highlight: '2x2',
    hold: 2400,
  },
  {
    caption: 'Langkah 3: Persegi 3×3. Hanya 1 — seluruh grid itu sendiri!',
    highlight: '3x3',
    hold: 2400,
  },
  {
    caption: 'Total: 9 + 4 + 1 = 14 persegi!',
    highlight: 'answer',
    hold: 3000,
  },
]

export function buildCountSquaresHK22P2Q19Steps(lang: 'en' | 'id'): CountSquaresHK22P2Q19Story {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
