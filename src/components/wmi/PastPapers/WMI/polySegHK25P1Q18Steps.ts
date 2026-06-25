// HKIMO-25-P1H-Q18 — "How many line segment(s) is/are there in the polygon below?"
//
// Counting strategy: two groups.
//   Group 1 — Outer boundary: A-B, B-E, E-H, H-G, G-F, F-D, D-A → 7 segments
//   Group 2 — Inner diagonals: A-C, C-E, B-C, C-D              → 4 more (total 11)
//
// Answer: 11

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'outer' | 'inner' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Edge keys to highlight, as a+b (e.g. 'AB'). Cumulative. */
  highlightEdges: string[]
  /** Running segment count; -1 = not shown yet. */
  count: number
  caption: { en: string; id: string }
}

const OUTER = ['AB', 'BE', 'EH', 'HG', 'GF', 'FD', 'DA']
const INNER = ['AC', 'CE', 'BC', 'CD']
const ALL   = [...OUTER, ...INNER]

export function buildPolySegHK25P1Q18Steps(_lang: Lang): AnimBeat[] {
  return [
    {
      phase: 'intro',
      highlightEdges: [],
      count: -1,
      caption: {
        en: 'Count all line segments in the polygon.',
        id: 'Hitung semua ruas garis pada poligon.',
      },
    },
    {
      phase: 'outer',
      highlightEdges: OUTER,
      count: 7,
      caption: {
        en: '7 segments form the outer boundary.',
        id: '7 ruas garis membentuk sisi luar poligon.',
      },
    },
    {
      phase: 'inner',
      highlightEdges: ALL,
      count: 11,
      caption: {
        en: '4 inner segments added. 7 + 4 = 11.',
        id: '4 ruas garis dalam ditambahkan. 7 + 4 = 11.',
      },
    },
    {
      phase: 'result',
      highlightEdges: ALL,
      count: 11,
      caption: {
        en: 'Total: 11 line segments.',
        id: 'Total: 11 ruas garis.',
      },
    },
  ]
}
