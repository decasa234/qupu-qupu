// HKIMO-22-P1H-Q18 — "Refer to the figure below, how many line segment(s) is / are there?"
//
// Strategy: count in three groups.
//   Group 1 — Hub edges:   A-B, B-C, B-D, B-E → 4 segments
//   Group 2 — Outer frame: C-F, F-G, E-G       → 3 more (total 7)
//   Group 3 — Inner cross: D-E, D-F            → 2 more (total 9)
//
// Answer: 9

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'hub' | 'outer' | 'inner' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Edge keys to highlight, as `a+b` (e.g. 'AB'). Cumulative. */
  highlightEdges: string[]
  /** Running segment count; -1 = not shown yet. */
  count: number
  caption: { en: string; id: string }
}

export function buildLineSegmentsHK22P1Q18Steps(_lang: Lang): AnimBeat[] {
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
      phase: 'hub',
      highlightEdges: ['AB', 'BC', 'BD', 'BE'],
      count: 4,
      caption: {
        en: '4 segments branch out from the centre point.',
        id: '4 ruas garis memancar dari titik pusat.',
      },
    },
    {
      phase: 'outer',
      highlightEdges: ['AB', 'BC', 'BD', 'BE', 'CF', 'FG', 'EG'],
      count: 7,
      caption: {
        en: '3 more segments form the outer frame. 4 + 3 = 7.',
        id: '3 ruas garis lagi membentuk rangka luar. 4 + 3 = 7.',
      },
    },
    {
      phase: 'inner',
      highlightEdges: ['AB', 'BC', 'BD', 'BE', 'CF', 'FG', 'EG', 'DE', 'DF'],
      count: 9,
      caption: {
        en: '2 inner segments complete the figure. 7 + 2 = 9.',
        id: '2 ruas garis dalam melengkapi gambar. 7 + 2 = 9.',
      },
    },
    {
      phase: 'result',
      highlightEdges: ['AB', 'BC', 'BD', 'BE', 'CF', 'FG', 'EG', 'DE', 'DF'],
      count: 9,
      caption: {
        en: 'Total: 9 line segments.',
        id: 'Total: 9 ruas garis.',
      },
    },
  ]
}
