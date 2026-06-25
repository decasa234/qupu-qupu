// HKIMO-20-P2H-Q18 — "How many line segment(s) is / are there in the polygon below?"
//
// Strategy: count in three groups of three.
//   Group 1 — Far-left node: L-D, L-E, L-G → 3 segments
//   Group 2 — Upper hub:     B-D, C-D, D-E  → 3 more (total 6)
//   Group 3 — Right triangle: E-F, E-G, F-G → 3 more (total 9)
//
// Answer: 9

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'left' | 'hub' | 'triangle' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Edge keys highlighted so far, as `a+b`. Cumulative. */
  highlightEdges: string[]
  /** Running segment count; -1 = not shown yet. */
  count: number
  caption: { en: string; id: string }
}

export function buildLineSegmentsHK20P2Q18Steps(_lang: Lang): AnimBeat[] {
  return [
    {
      phase: 'intro',
      highlightEdges: [],
      count: -1,
      caption: {
        en: 'Count every line segment in the figure.',
        id: 'Hitung setiap ruas garis pada gambar.',
      },
    },
    {
      phase: 'left',
      highlightEdges: ['LD', 'LE', 'LG'],
      count: 3,
      caption: {
        en: '3 segments radiate from the far-left point.',
        id: '3 ruas garis memancar dari titik paling kiri.',
      },
    },
    {
      phase: 'hub',
      highlightEdges: ['LD', 'LE', 'LG', 'BD', 'CD', 'DE'],
      count: 6,
      caption: {
        en: '3 more segments meet at the upper hub. 3 + 3 = 6.',
        id: '3 ruas garis lagi bertemu di titik pusat atas. 3 + 3 = 6.',
      },
    },
    {
      phase: 'triangle',
      highlightEdges: ['LD', 'LE', 'LG', 'BD', 'CD', 'DE', 'EF', 'EG', 'FG'],
      count: 9,
      caption: {
        en: '3 segments form the right triangle. 6 + 3 = 9.',
        id: '3 ruas garis membentuk segitiga kanan. 6 + 3 = 9.',
      },
    },
    {
      phase: 'result',
      highlightEdges: ['LD', 'LE', 'LG', 'BD', 'CD', 'DE', 'EF', 'EG', 'FG'],
      count: 9,
      caption: {
        en: 'Total: 9 line segments.',
        id: 'Total: 9 ruas garis.',
      },
    },
  ]
}
