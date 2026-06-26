// TIMO-22-P4H-Q20 — beat storyboard for counting rectangles containing *.
//
// Grid: L-shaped, 3 cols × 4 rows, top-left 1×2 absent. * at (row 3, col 2).
// Key insight: (top line choices) × (bottom choices) × (left choices) × (right choices) = 16.
//
// Beats:
//   0  intro      — show grid, state the task
//   1  top-span   — top boundary in rows 1–2: left must stay at col 2. 2 × 2 × 1 × 2 = 8
//   2  bot-span   — top boundary at row 3: left can be col 1 or 2.  1 × 2 × 2 × 2 = 8
//   3  result     — 8 + 8 = 16

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'top-span' | 'bot-span' | 'result'

export interface StarBeat {
  phase: PhaseId
  caption: string
  equation: string
  hold: number
  result: boolean
}

export interface StarStoryboard {
  steps: StarBeat[]
  finalIndex: number
}

export function buildStarGridTIMO22P4Q20Steps(lang: Lang): StarStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StarBeat[] = [
    {
      phase: 'intro',
      caption: t(
        'Count every rectangle that contains the red ★. A rectangle containing ★ must have its top ≤ row 3, bottom ≥ row 3, left ≤ col 2, right ≥ col 2.',
        'Hitung setiap persegi panjang yang memuat tanda ★. Sebuah persegi panjang memuat ★ jika batas atasnya ≤ baris 3, bawahnya ≥ baris 3, kirinya ≤ kolom 2, kanannya ≥ kolom 2.',
      ),
      equation: '',
      hold: 2400,
      result: false,
    },
    {
      phase: 'top-span',
      caption: t(
        'Top boundary in rows 1–2 (shaded). Column 1 is absent there, so left edge must be at col 2 — only 1 left choice. Top: 2, left: 1, right: 2, bottom: 2 → 2 × 1 × 2 × 2 = 8.',
        'Batas atas di baris 1–2 (diarsir). Kolom 1 tidak ada di sana, sehingga batas kiri harus di kolom 2 — hanya 1 pilihan kiri. Atas: 2, kiri: 1, kanan: 2, bawah: 2 → 2 × 1 × 2 × 2 = 8.',
      ),
      equation: t('Top in rows 1–2: 8', 'Atas di baris 1–2: 8'),
      hold: 2600,
      result: false,
    },
    {
      phase: 'bot-span',
      caption: t(
        'Top boundary at row 3 (shaded). Now col 1 exists, so left edge can be col 1 or col 2 — 2 left choices. Top: 1, left: 2, right: 2, bottom: 2 → 1 × 2 × 2 × 2 = 8.',
        'Batas atas di baris 3 (diarsir). Kini kolom 1 ada, sehingga batas kiri bisa kolom 1 atau 2 — 2 pilihan kiri. Atas: 1, kiri: 2, kanan: 2, bawah: 2 → 1 × 2 × 2 × 2 = 8.',
      ),
      equation: t('Top at row 3: 8', 'Atas di baris 3: 8'),
      hold: 2600,
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        'Add both groups: 8 + 8 = 16 rectangles contain the ★.',
        'Jumlahkan kedua kelompok: 8 + 8 = 16 persegi panjang memuat tanda ★.',
      ),
      equation: '8 + 8 = 16',
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
