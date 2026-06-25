// countSquaresHK23P3SFQ18Steps.ts
// HKIMO-23-P3SF-Q18 — "How many squares are there in the figure below?"
//
// Strategy: count by size (1×1, 2×2, 3×3, 4×4) then sum.
// Answer: 20 + 10 + 4 + 1 = 35.
//
// Beats:
//   0. intro   — show the figure, state the task.
//   1. size-1  — 20 unit squares.
//   2. size-2  — 10 two-squares (running total 30).
//   3. size-3  — 4 three-squares (running total 34).
//   4. size-4  — 1 four-square (running total 35).
//   5. result  — final tally 20+10+4+1 = 35.

export type Lang = 'en' | 'id'

export type SquaresPhaseId = 'intro' | 'size-1' | 'size-2' | 'size-3' | 'size-4' | 'result'

export interface SquaresBeat {
  phase: SquaresPhaseId
  /** Which square size to highlight (0 = none). */
  showSize: 0 | 1 | 2 | 3 | 4
  runningTotal: number
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface SquaresStoryboard {
  steps: SquaresBeat[]
  finalIndex: number
}

export function buildCountSquaresHK23P3SFQ18Steps(lang: Lang): SquaresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquaresBeat[] = [
    {
      phase: 'intro',
      showSize: 0,
      runningTotal: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Count squares of every size — 1×1, 2×2, 3×3, 4×4 — then add them all up.',
        'Hitung persegi setiap ukuran — 1×1, 2×2, 3×3, 4×4 — lalu jumlahkan semua.',
      ),
    },
    {
      phase: 'size-1',
      showSize: 1,
      runningTotal: 20,
      equation: '20 (1×1)',
      hold: 2400,
      result: false,
      caption: t(
        '1×1 squares: count every unit cell. There are 20.',
        'Persegi 1×1: hitung setiap sel unit. Ada 20.',
      ),
    },
    {
      phase: 'size-2',
      showSize: 2,
      runningTotal: 30,
      equation: '20 + 10 = 30  (+2×2)',
      hold: 2400,
      result: false,
      caption: t(
        '2×2 squares: slide a 2×2 frame over the figure — 10 positions fit.',
        'Persegi 2×2: geser bingkai 2×2 — 10 posisi muat.',
      ),
    },
    {
      phase: 'size-3',
      showSize: 3,
      runningTotal: 34,
      equation: '30 + 4 = 34  (+3×3)',
      hold: 2400,
      result: false,
      caption: t(
        '3×3 squares: four 3×3 squares are hidden inside the main block.',
        'Persegi 3×3: empat persegi 3×3 tersembunyi di dalam blok utama.',
      ),
    },
    {
      phase: 'size-4',
      showSize: 4,
      runningTotal: 35,
      equation: '34 + 1 = 35  (+4×4)',
      hold: 2400,
      result: false,
      caption: t(
        '4×4 square: the whole main block is one big 4×4 square.',
        'Persegi 4×4: seluruh blok utama adalah satu persegi 4×4 besar.',
      ),
    },
    {
      phase: 'result',
      showSize: 0,
      runningTotal: 35,
      equation: '20 + 10 + 4 + 1 = 35',
      hold: 0,
      result: true,
      caption: t(
        'Total: 20 + 10 + 4 + 1 = 35 squares. Answer: 35.',
        'Total: 20 + 10 + 4 + 1 = 35 persegi. Jawaban: 35.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
