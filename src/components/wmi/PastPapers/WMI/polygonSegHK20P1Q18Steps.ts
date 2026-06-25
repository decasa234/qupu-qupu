// HKIMO-20-P1H-Q18 — storyboard for the line-segment counting animation.
//
// Question: "How many line segment(s) is / are there in the polygon below?"
// Figure: 8-node graph with hub B, spike A-B, right branch B-C-D-E-F, left branch B-G-H.
// Answer = 7.
//
// Teaching walk (one idea per beat):
//   0. intro    — show the figure; ask students to count each segment.
//   1–7. seg-N  — highlight segment N, running count shown.
//   8. result   — all 7 segments lit; total = 7.
//
// Pure builder: (lang) → beats. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SegPhaseId =
  | 'intro'
  | 'seg-1' | 'seg-2' | 'seg-3' | 'seg-4'
  | 'seg-5' | 'seg-6' | 'seg-7'
  | 'result'

export interface SegBeat {
  phase: SegPhaseId
  /** 0 = no segment highlighted; 1-7 = that segment lit; 8 = all lit */
  highlightSeg: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  /** Running count to display (0 = hide) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildPolygonSegHK20P1Q18Steps(lang: Lang): SegBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightSeg: 0,
      count: 0,
      caption: en
        ? 'This figure has 8 vertices (dots). Count every straight line segment between them.'
        : 'Gambar ini memiliki 8 titik sudut (dot). Hitung setiap ruas garis lurus di antara mereka.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'seg-1',
      highlightSeg: 1,
      count: 1,
      caption: en
        ? 'Segment 1 — top spike (A to junction B).'
        : 'Ruas 1 — ujung atas (A ke persimpangan B).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-2',
      highlightSeg: 2,
      count: 2,
      caption: en
        ? 'Segment 2 — junction B to upper-right C.'
        : 'Ruas 2 — persimpangan B ke kanan atas C.',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-3',
      highlightSeg: 3,
      count: 3,
      caption: en
        ? 'Segment 3 — upper right (C to far-right D).'
        : 'Ruas 3 — kanan atas (C ke D paling kanan).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-4',
      highlightSeg: 4,
      count: 4,
      caption: en
        ? 'Segment 4 — right side (D down to E).'
        : 'Ruas 4 — sisi kanan (D turun ke E).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-5',
      highlightSeg: 5,
      count: 5,
      caption: en
        ? 'Segment 5 — lower right (E down to bottom F).'
        : 'Ruas 5 — kanan bawah (E turun ke bawah F).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-6',
      highlightSeg: 6,
      count: 6,
      caption: en
        ? 'Segment 6 — junction B down to left-centre G.'
        : 'Ruas 6 — persimpangan B turun ke tengah-kiri G.',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-7',
      highlightSeg: 7,
      count: 7,
      caption: en
        ? 'Segment 7 — lower-left spike (G to tip H).'
        : 'Ruas 7 — ujung kiri bawah (G ke ujung H).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'result',
      highlightSeg: 8,
      count: 7,
      caption: en
        ? 'All 7 segments counted → the figure contains 7 line segments.'
        : 'Semua 7 ruas terhitung → gambar ini memiliki 7 ruas garis.',
      hold: 0,
      result: true,
    },
  ]
}
