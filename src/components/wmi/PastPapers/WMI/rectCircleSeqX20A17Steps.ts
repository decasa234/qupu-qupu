// rectCircleSeqX20A17Steps.ts
//
// SEAMOX-20-A-Q17 — "In which figure are there 32 circles?"
//
// Growing chain of rectangles: figure n has n joined rectangles with 4 small
// open circles at each vertical divider line (n+1 dividers). Circles = 4(n+1).
//
// Beat sequence:
//   0 — overview: show Fig 1, Fig 2, Fig 3
//   1 — count circles in Fig 1 → 8 (highlight all circles)
//   2 — count circles in Fig 2 → 12 (highlight all circles)
//   3 — count circles in Fig 3 → 16 (highlight all circles)
//   4 — identify pattern: each new figure adds 4 circles (+4 per figure)
//   5 — deduce formula: circles = 4(n + 1)
//   6 — solve 4(n+1) = 32 → n+1 = 8 → n = 7
//   7 — final: Figure 7 has 32 circles

export interface RectCircleStep {
  caption: string
  /** Which figure panel(s) to highlight (0-indexed: 0=Fig1, 1=Fig2, 2=Fig3), or null for all */
  highlightPanel: number | null
  /** Whether to tint circles in the highlighted panel */
  highlightCircles: boolean
  /** Whether to show the formula result chip */
  showFormula: boolean
  /** Whether to show the final answer chip */
  result: boolean
  /** Extra hold ms on this beat */
  hold?: number
}

export interface RectCircleStory {
  steps: RectCircleStep[]
  finalIndex: number
}

export function buildRectCircleSeqX20A17Steps(lang: 'en' | 'id'): RectCircleStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectCircleStep[] = [
    // Beat 0 — overview
    {
      caption: t(
        'Each figure is a row of rectangles. Count the small circles around the edges!',
        'Setiap gambar adalah deretan persegi panjang. Hitung lingkaran kecil di tepinya!',
      ),
      highlightPanel: null,
      highlightCircles: false,
      showFormula: false,
      result: false,
      hold: 600,
    },

    // Beat 1 — Fig 1 has 8 circles
    {
      caption: t(
        'Fig 1 has 1 rectangle. Count: 8 circles (4 circles × 2 divider lines).',
        'Gambar 1 punya 1 persegi panjang. Hitung: 8 lingkaran (4 × 2 garis pembatas).',
      ),
      highlightPanel: 0,
      highlightCircles: true,
      showFormula: false,
      result: false,
    },

    // Beat 2 — Fig 2 has 12 circles
    {
      caption: t(
        'Fig 2 has 2 rectangles. Count: 12 circles (4 circles × 3 divider lines).',
        'Gambar 2 punya 2 persegi panjang. Hitung: 12 lingkaran (4 × 3 garis pembatas).',
      ),
      highlightPanel: 1,
      highlightCircles: true,
      showFormula: false,
      result: false,
    },

    // Beat 3 — Fig 3 has 16 circles
    {
      caption: t(
        'Fig 3 has 3 rectangles. Count: 16 circles (4 circles × 4 divider lines).',
        'Gambar 3 punya 3 persegi panjang. Hitung: 16 lingkaran (4 × 4 garis pembatas).',
      ),
      highlightPanel: 2,
      highlightCircles: true,
      showFormula: false,
      result: false,
    },

    // Beat 4 — notice the +4 pattern
    {
      caption: t(
        'Pattern: 8 → 12 → 16 → ... Each new rectangle adds 4 more circles!',
        'Pola: 8 → 12 → 16 → ... Setiap persegi panjang baru menambah 4 lingkaran!',
      ),
      highlightPanel: null,
      highlightCircles: false,
      showFormula: false,
      result: false,
    },

    // Beat 5 — formula
    {
      caption: t(
        'Formula: Fig n has 4 × (n + 1) circles. Check: Fig 3 → 4 × 4 = 16 ✓',
        'Rumus: Gambar n memiliki 4 × (n + 1) lingkaran. Cek: Gambar 3 → 4 × 4 = 16 ✓',
      ),
      highlightPanel: null,
      highlightCircles: false,
      showFormula: true,
      result: false,
    },

    // Beat 6 — solve for 32
    {
      caption: t(
        'Solve: 4 × (n + 1) = 32 → n + 1 = 8 → n = 7.',
        'Selesaikan: 4 × (n + 1) = 32 → n + 1 = 8 → n = 7.',
      ),
      highlightPanel: null,
      highlightCircles: false,
      showFormula: true,
      result: false,
    },

    // Beat 7 — final answer
    {
      caption: t(
        'Figure 7 has 4 × 8 = 32 circles. Answer: Fig. 7.',
        'Gambar 7 memiliki 4 × 8 = 32 lingkaran. Jawaban: Gambar 7.',
      ),
      highlightPanel: null,
      highlightCircles: false,
      showFormula: true,
      result: true,
      hold: 800,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
