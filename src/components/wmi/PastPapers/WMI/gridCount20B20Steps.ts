// SEAMO-2020-Paper-B-Q20 — storyboard for "count all squares in 4×4 grid".
//
// Answer: 30 (B).
// Counts: 1×1 → 16, 2×2 → 9, 3×3 → 4, 4×4 → 1. Total = 16+9+4+1 = 30.
//
// Teaching walk:
//   0. intro    — plain grid; ask students to count all squares.
//   1. size-1   — amber tint; 16 unit squares (4×4 = 16).
//   2. size-2   — indigo ring; 9 positions for 2×2 (3×3 = 9).
//   3. size-3   — blue ring; 4 positions for 3×3 (2×2 = 4).
//   4. size-4   — green ring; 1 position for 4×4 (1×1 = 1).
//   5. total    — green ring; 16+9+4+1 = 30 — answer B.

export type Lang = 'en' | 'id'

export type GridCount20B20Phase = 'intro' | 'size-1' | 'size-2' | 'size-3' | 'size-4' | 'total'

export interface GridCount20B20Beat {
  phase: GridCount20B20Phase
  /** Which square size to overlay (null = none). */
  highlightSize: 1 | 2 | 3 | 4 | null
  /** Running sum shown in the equation pill; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final beat). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface GridCount20B20Storyboard {
  steps: GridCount20B20Beat[]
  finalIndex: number
}

export function buildGridCount20B20Steps(lang: Lang): GridCount20B20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridCount20B20Beat[] = [
    {
      phase: 'intro',
      highlightSize: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Count ALL squares of every possible size — not just the small unit squares!',
        'Hitung SEMUA persegi dari setiap ukuran yang mungkin — bukan hanya persegi satuan kecil!',
      ),
    },
    {
      phase: 'size-1',
      highlightSize: 1,
      equation: '1×1: 4² = 16',
      hold: 2400,
      result: false,
      caption: t(
        '1×1 squares: 4 rows × 4 columns = 16.',
        'Persegi 1×1: 4 baris × 4 kolom = 16.',
      ),
    },
    {
      phase: 'size-2',
      highlightSize: 2,
      equation: '16 + 2×2: 3² = 9',
      hold: 2400,
      result: false,
      caption: t(
        '2×2 squares: 3 positions per row × 3 per column = 9.',
        'Persegi 2×2: 3 posisi per baris × 3 per kolom = 9.',
      ),
    },
    {
      phase: 'size-3',
      highlightSize: 3,
      equation: '16 + 9 + 3×3: 2² = 4',
      hold: 2400,
      result: false,
      caption: t(
        '3×3 squares: 2 positions per row × 2 per column = 4.',
        'Persegi 3×3: 2 posisi per baris × 2 per kolom = 4.',
      ),
    },
    {
      phase: 'size-4',
      highlightSize: 4,
      equation: '16 + 9 + 4 + 4×4: 1² = 1',
      hold: 2400,
      result: false,
      caption: t(
        '4×4 square: just the whole grid itself = 1.',
        'Persegi 4×4: seluruh kisi itu sendiri = 1.',
      ),
    },
    {
      phase: 'total',
      highlightSize: 4,
      equation: '16 + 9 + 4 + 1 = 30',
      hold: 0,
      result: true,
      caption: t(
        'Total: 16 + 9 + 4 + 1 = 30 squares. Answer: B.',
        'Total: 16 + 9 + 4 + 1 = 30 persegi. Jawaban: B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
