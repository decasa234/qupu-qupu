// HKIMO-18-P1H-Q18 — storyboard for the polygon side-counting animation.
//
// The question: "How many sides is / are there in the polygon below?"
// The polygon is an irregular hexagon (right-pointing arrow shape). Answer = 6.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the polygon; ask students to trace its outline.
//   1. side-1    — highlight top edge (side 1).
//   2. side-2    — highlight upper-right diagonal (side 2).
//   3. side-3    — highlight lower-right diagonal (side 3).
//   4. side-4    — highlight short right vertical (side 4).
//   5. side-5    — highlight bottom edge (side 5).
//   6. side-6    — highlight left edge (side 6).
//   7. result    — all sides lit; total = 6.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PolyPhaseId =
  | 'intro'
  | 'side-1' | 'side-2' | 'side-3'
  | 'side-4' | 'side-5' | 'side-6'
  | 'result'

export interface PolyBeat {
  phase: PolyPhaseId
  /** 0 = no side highlighted; 1–6 = that side lit; 7 = all sides lit */
  highlightSide: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  /** Running count to display (0 = hide) */
  count: number
  /** Caption text */
  caption: string
  /** Auto-hold in ms (0 = final / manual) */
  hold: number
  result: boolean
}

export function buildPolygonHK18P1Q18Steps(lang: Lang): PolyBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightSide: 0,
      count: 0,
      caption: en
        ? 'This is a polygon. Trace its outline — count each straight edge.'
        : 'Ini adalah poligon. Telusuri garisnya — hitung setiap sisi lurus.',
      hold: 2000,
      result: false,
    },
    {
      phase: 'side-1',
      highlightSide: 1,
      count: 1,
      caption: en ? 'Side 1 — top edge.' : 'Sisi 1 — sisi atas.',
      hold: 1500,
      result: false,
    },
    {
      phase: 'side-2',
      highlightSide: 2,
      count: 2,
      caption: en ? 'Side 2 — upper-right diagonal (top of the arrow).' : 'Sisi 2 — diagonal kanan atas (bagian atas panah).',
      hold: 1500,
      result: false,
    },
    {
      phase: 'side-3',
      highlightSide: 3,
      count: 3,
      caption: en ? 'Side 3 — lower-right diagonal (bottom of the arrow).' : 'Sisi 3 — diagonal kanan bawah (bagian bawah panah).',
      hold: 1500,
      result: false,
    },
    {
      phase: 'side-4',
      highlightSide: 4,
      count: 4,
      caption: en ? 'Side 4 — short right vertical.' : 'Sisi 4 — sisi tegak kanan pendek.',
      hold: 1500,
      result: false,
    },
    {
      phase: 'side-5',
      highlightSide: 5,
      count: 5,
      caption: en ? 'Side 5 — bottom edge.' : 'Sisi 5 — sisi bawah.',
      hold: 1500,
      result: false,
    },
    {
      phase: 'side-6',
      highlightSide: 6,
      count: 6,
      caption: en ? 'Side 6 — left edge.' : 'Sisi 6 — sisi kiri.',
      hold: 1500,
      result: false,
    },
    {
      phase: 'result',
      highlightSide: 7,
      count: 6,
      caption: en
        ? '6 straight sides in total → the polygon has 6 sides.'
        : '6 sisi lurus seluruhnya → poligon ini memiliki 6 sisi.',
      hold: 0,
      result: true,
    },
  ]
}
