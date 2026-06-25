// HKIMO-21-P1H-Q13 — storyboard for the line-segment counting animation.
//
// Question: "How many line segment(s) is / are there in the polygon below?"
// Figure: 5-node graph with 4 outer edges + 4 internal edges from hub C. Answer = 8.
//
// Teaching walk (one idea per beat):
//   0. intro    — show the figure; ask students to count each segment.
//   1–8. seg-N  — highlight segment N, running count shown.
//   9. result   — all 8 segments lit; total = 8.
//
// Pure builder: (lang) → beats. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SegPhaseId =
  | 'intro'
  | 'seg-1' | 'seg-2' | 'seg-3' | 'seg-4'
  | 'seg-5' | 'seg-6' | 'seg-7' | 'seg-8'
  | 'result'

export interface SegBeat {
  phase: SegPhaseId
  /** 0 = no segment highlighted; 1-8 = that segment lit; 9 = all lit */
  highlightSeg: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  /** Running count to display (0 = hide) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildPolygonSegHK21P1Q13Steps(lang: Lang): SegBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightSeg: 0,
      count: 0,
      caption: en
        ? 'This figure has 5 vertices (dots). Count every straight line segment between them.'
        : 'Gambar ini memiliki 5 titik sudut (dot). Hitung setiap ruas garis lurus di antara mereka.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'seg-1',
      highlightSeg: 1,
      count: 1,
      caption: en ? 'Segment 1 — top outer edge (A to B).' : 'Ruas 1 — sisi luar atas (A ke B).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-2',
      highlightSeg: 2,
      count: 2,
      caption: en ? 'Segment 2 — left outer edge (A to E).' : 'Ruas 2 — sisi luar kiri (A ke E).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-3',
      highlightSeg: 3,
      count: 3,
      caption: en ? 'Segment 3 — inner diagonal (A to centre C).' : 'Ruas 3 — diagonal dalam (A ke pusat C).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-4',
      highlightSeg: 4,
      count: 4,
      caption: en ? 'Segment 4 — inner diagonal (B to centre C).' : 'Ruas 4 — diagonal dalam (B ke pusat C).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-5',
      highlightSeg: 5,
      count: 5,
      caption: en ? 'Segment 5 — right outer edge (B to D).' : 'Ruas 5 — sisi luar kanan (B ke D).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-6',
      highlightSeg: 6,
      count: 6,
      caption: en ? 'Segment 6 — inner diagonal (centre C to D).' : 'Ruas 6 — diagonal dalam (pusat C ke D).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-7',
      highlightSeg: 7,
      count: 7,
      caption: en ? 'Segment 7 — inner diagonal (centre C to E).' : 'Ruas 7 — diagonal dalam (pusat C ke E).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-8',
      highlightSeg: 8,
      count: 8,
      caption: en ? 'Segment 8 — bottom outer edge (D to E).' : 'Ruas 8 — sisi luar bawah (D ke E).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'result',
      highlightSeg: 9,
      count: 8,
      caption: en
        ? 'All 8 segments counted → the polygon contains 8 line segments.'
        : 'Semua 8 ruas terhitung → poligon ini memiliki 8 ruas garis.',
      hold: 0,
      result: true,
    },
  ]
}
