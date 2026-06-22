// boxes13PESteps.ts — storyboard for IKMC-23-PE-Q13 (2023 Pre-Ecolier, question 13).
//
// PROBLEM: A 6-row × 5-column table has 30 boxes.
//   Paint row 3, row 6, column C, and column D.
//   How many boxes are NOT painted?  Answer: C = 12.
//
// SOLUTION (inclusion-exclusion):
//   Row 3:   5 boxes (A3, B3, C3, D3, E3)
//   Row 6:   5 boxes (A6, B6, C6, D6, E6)
//   Col C:   6 boxes (C1–C6)
//   Col D:   6 boxes (D1–D6)
//   Overlap: 4 boxes counted twice (C3, D3, C6, D6) — subtract once
//   Painted = 5 + 5 + 6 + 6 − 4 = 18
//   NOT painted = 30 − 18 = 12
//
// Beats:
//   0. intro       — show empty grid; state the task.
//   1. rows        — highlight row 3 and row 6 (5 + 5 = 10 boxes).
//   2. cols        — highlight col C and col D (6 + 6 = 12 boxes) → subtotal 22.
//   3. overlap     — 4 boxes double-counted; subtract → 22 − 4 = 18 painted.
//   4. unpainted   — 30 − 18 = 12 not painted.
//   5. result      — answer: 12 → choice C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'rows' | 'cols' | 'overlap' | 'unpainted' | 'result'

/**
 * Which cell-fill variant to show:
 *   'none'      — all white
 *   'rows'      — rows 3 & 6 highlighted
 *   'cols'      — rows 3 & 6 + cols C & D highlighted (overlap in amber)
 *   'overlap'   — same as 'cols' but overlapping cells in amber
 *   'unpainted' — painted cells blue; unpainted cells white
 *   'answer'    — painted = solid fill; unpainted = white (clean final state)
 */
export type CellMode = 'none' | 'rows' | 'cols' | 'overlap' | 'unpainted' | 'answer'

export interface BoxBeat {
  /** Which animation phase this beat belongs to. */
  phase: PhaseId
  cellMode: CellMode
  /** Equation string shown below the grid ('' = hidden). */
  equation: string
  /** Caption shown in the explanation box. */
  caption: string
  /** Auto-advance hold in ms (0 = last beat, manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface BoxStoryboard {
  steps: BoxBeat[]
  finalIndex: number
}

export function buildBoxes13PESteps(lang: Lang): BoxStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      cellMode: 'none',
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'A table of 30 boxes: 6 rows (1–6) × 5 columns (A–E). We must paint row 3, row 6, column C and column D.',
        'Tabel dengan 30 kotak: 6 baris (1–6) × 5 kolom (A–E). Kita harus mengecat baris 3, baris 6, kolom C, dan kolom D.',
      ),
    },

    // Beat 1 — rows
    {
      phase: 'rows',
      cellMode: 'rows',
      equation: t('Row 3: 5 boxes + Row 6: 5 boxes = 10', 'Baris 3: 5 kotak + Baris 6: 5 kotak = 10'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 3 has 5 boxes, row 6 has 5 boxes — that is 10 painted so far.',
        'Baris 3 punya 5 kotak, baris 6 punya 5 kotak — sudah 10 kotak dicat.',
      ),
    },

    // Beat 2 — cols
    {
      phase: 'cols',
      cellMode: 'cols',
      equation: t('+ Col C: 6 boxes + Col D: 6 boxes → 10 + 12 = 22?', '+ Kol C: 6 kotak + Kol D: 6 kotak → 10 + 12 = 22?'),
      hold: 2400,
      result: false,
      caption: t(
        'Column C has 6 boxes and column D has 6 boxes. But adding 10 + 12 = 22 counts some boxes twice!',
        'Kolom C punya 6 kotak dan kolom D punya 6 kotak. Tapi menjumlahkan 10 + 12 = 22 menghitung beberapa kotak dua kali!',
      ),
    },

    // Beat 3 — overlap
    {
      phase: 'overlap',
      cellMode: 'overlap',
      equation: t('22 − 4 overlap = 18 painted', '22 − 4 tumpang tindih = 18 dicat'),
      hold: 2600,
      result: false,
      caption: t(
        '4 boxes are in both a painted row AND a painted column (C3, D3, C6, D6). Subtract them once: 22 − 4 = 18 painted boxes.',
        '4 kotak berada di baris yang dicat DAN kolom yang dicat (C3, D3, C6, D6). Kurangi sekali: 22 − 4 = 18 kotak dicat.',
      ),
    },

    // Beat 4 — unpainted
    {
      phase: 'unpainted',
      cellMode: 'unpainted',
      equation: t('30 − 18 = 12 not painted', '30 − 18 = 12 tidak dicat'),
      hold: 2400,
      result: false,
      caption: t(
        '30 total boxes − 18 painted = 12 boxes are NOT painted.',
        '30 kotak total − 18 dicat = 12 kotak TIDAK dicat.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      cellMode: 'answer',
      equation: t('12 boxes not painted → Answer C', '12 kotak tidak dicat → Jawaban C'),
      hold: 0,
      result: true,
      caption: t(
        '12 boxes are not painted. The answer is C.',
        '12 kotak tidak dicat. Jawabannya adalah C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
