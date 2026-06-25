// HKIMO-22-P2H-Q17 — storyboard for the line-segment counting animation.
//
// Question: "How many line segment(s) is / are there in the polygon below?"
// Figure: 8-node connected graph (tree) with 7 edges. Answer = 7.
//
// Teaching walk (one idea per beat):
//   0. intro   — show the graph; invite students to find and count each segment.
//   1–7. seg-N — highlight segment N in order, running count shown.
//   8. result  — all 7 segments lit; total = 7.

export type Lang = 'en' | 'id'

export type SegPhaseId =
  | 'intro'
  | 'seg-1' | 'seg-2' | 'seg-3' | 'seg-4'
  | 'seg-5' | 'seg-6' | 'seg-7'
  | 'result'

export interface SegBeat {
  phase: SegPhaseId
  /** 0 = nothing highlighted; 1–7 = that segment lit; 8 = all lit */
  highlightSeg: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  /** Running count to display (0 = hide badge) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildGraphSegmentsHK22P2Q17Steps(lang: Lang): SegBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightSeg: 0,
      count: 0,
      caption: en
        ? 'This figure has 8 dots (vertices). Find and count every straight line segment connecting them.'
        : 'Gambar ini memiliki 8 titik. Temukan dan hitung setiap ruas garis lurus yang menghubungkan titik-titik tersebut.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'seg-1',
      highlightSeg: 1,
      count: 1,
      caption: en
        ? 'Segment 1 — long bottom arm (A to B).'
        : 'Ruas 1 — lengan bawah panjang (A ke B).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-2',
      highlightSeg: 2,
      count: 2,
      caption: en
        ? 'Segment 2 — short far-left arm (B to C).'
        : 'Ruas 2 — lengan kiri pendek (B ke C).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-3',
      highlightSeg: 3,
      count: 3,
      caption: en
        ? 'Segment 3 — junction to centre (B to E).'
        : 'Ruas 3 — simpul ke pusat (B ke E).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-4',
      highlightSeg: 4,
      count: 4,
      caption: en
        ? 'Segment 4 — top arm (E to F).'
        : 'Ruas 4 — lengan atas (E ke F).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-5',
      highlightSeg: 5,
      count: 5,
      caption: en
        ? 'Segment 5 — centre to right fork (E to G).'
        : 'Ruas 5 — pusat ke garpu kanan (E ke G).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-6',
      highlightSeg: 6,
      count: 6,
      caption: en
        ? 'Segment 6 — upper-right arm (G to H).'
        : 'Ruas 6 — lengan kanan atas (G ke H).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-7',
      highlightSeg: 7,
      count: 7,
      caption: en
        ? 'Segment 7 — lower-right arm (G to I).'
        : 'Ruas 7 — lengan kanan bawah (G ke I).',
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
