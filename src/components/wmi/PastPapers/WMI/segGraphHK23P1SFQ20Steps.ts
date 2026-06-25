// HKIMO-23-P1SF-Q20 — storyboard for the line-segment counting animation.
//
// Question: "How many line segment(s) is / are there in the figure below?"
// Figure: 9-node connected graph with 10 edges. Answer = 10.
//
// Teaching walk (one idea per beat):
//   0. intro   — show the graph; invite students to find and count each segment.
//   1–10. seg-N — highlight segment N in order, running count shown.
//   11. result — all 10 segments lit; total = 10.

export type Lang = 'en' | 'id'

export type SegPhaseId =
  | 'intro'
  | 'seg-1' | 'seg-2' | 'seg-3' | 'seg-4' | 'seg-5'
  | 'seg-6' | 'seg-7' | 'seg-8' | 'seg-9' | 'seg-10'
  | 'result'

export interface SegBeat {
  phase: SegPhaseId
  /** 0 = nothing highlighted; 1–10 = that segment lit; 11 = all lit */
  highlightSeg: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  /** Running count to display (0 = hide badge) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildSegGraphHK23P1SFQ20Steps(lang: Lang): SegBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightSeg: 0,
      count: 0,
      caption: en
        ? 'This figure has 9 dots (vertices). Find and count every straight line segment connecting them.'
        : 'Gambar ini memiliki 9 titik. Temukan dan hitung setiap ruas garis lurus yang menghubungkan titik-titik tersebut.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'seg-1',
      highlightSeg: 1,
      count: 1,
      caption: en
        ? 'Segment 1 — short upper-left edge (UL1 to UL2).'
        : 'Ruas 1 — sisi pendek kiri atas (UL1 ke UL2).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-2',
      highlightSeg: 2,
      count: 2,
      caption: en
        ? 'Segment 2 — upper-left top to hub (UL1 to HUB).'
        : 'Ruas 2 — sudut kiri atas ke pusat (UL1 ke HUB).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-3',
      highlightSeg: 3,
      count: 3,
      caption: en
        ? 'Segment 3 — upper-left lower to hub (UL2 to HUB).'
        : 'Ruas 3 — titik kiri atas bawah ke pusat (UL2 ke HUB).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-4',
      highlightSeg: 4,
      count: 4,
      caption: en
        ? 'Segment 4 — hub to top-right (HUB to TR1).'
        : 'Ruas 4 — pusat ke kanan atas (HUB ke TR1).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-5',
      highlightSeg: 5,
      count: 5,
      caption: en
        ? 'Segment 5 — top-right pair (TR1 to TR2).'
        : 'Ruas 5 — pasangan kanan atas (TR1 ke TR2).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-6',
      highlightSeg: 6,
      count: 6,
      caption: en
        ? 'Segment 6 — top-right to right-centre (TR2 to RC).'
        : 'Ruas 6 — kanan atas ke tengah kanan (TR2 ke RC).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-7',
      highlightSeg: 7,
      count: 7,
      caption: en
        ? 'Segment 7 — right-centre back to hub (RC to HUB).'
        : 'Ruas 7 — tengah kanan kembali ke pusat (RC ke HUB).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-8',
      highlightSeg: 8,
      count: 8,
      caption: en
        ? 'Segment 8 — hub to left-centre (HUB to LC).'
        : 'Ruas 8 — pusat ke tengah kiri (HUB ke LC).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-9',
      highlightSeg: 9,
      count: 9,
      caption: en
        ? 'Segment 9 — left-centre to bottom-left arm (LC to BL).'
        : 'Ruas 9 — tengah kiri ke ujung kiri bawah (LC ke BL).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'seg-10',
      highlightSeg: 10,
      count: 10,
      caption: en
        ? 'Segment 10 — left-centre to bottom-centre (LC to BC).'
        : 'Ruas 10 — tengah kiri ke bawah tengah (LC ke BC).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'result',
      highlightSeg: 11,
      count: 10,
      caption: en
        ? 'All 10 segments counted → the figure contains 10 line segments.'
        : 'Semua 10 ruas terhitung → gambar ini memiliki 10 ruas garis.',
      hold: 0,
      result: true,
    },
  ]
}
