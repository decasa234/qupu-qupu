// polygonAnglesHK20P1Q19Steps — HKIMO 2020 Heat Primary-1 Q19
// Beat-by-beat steps for counting each interior angle of the heptagon.
//
// The question: "How many interior angle(s) is / are there in the polygon below?"
// The polygon is an irregular concave heptagon. Answer = 7.
//
// Teaching walk, one idea per beat:
//   0. intro       — show the polygon; note every corner has one interior angle.
//   1–7. angle-N   — highlight vertex N and its interior angle arc.
//   8. result      — all 7 angles lit; total = 7.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type AnglePhaseId =
  | 'intro'
  | 'angle-1' | 'angle-2' | 'angle-3' | 'angle-4'
  | 'angle-5' | 'angle-6' | 'angle-7'
  | 'result'

export interface AngleBeat {
  phase: AnglePhaseId
  /** 0 = none highlighted; 1–7 = that vertex lit; 8 = all lit */
  highlightVertex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  /** Running count to display (0 = hide) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildPolygonAnglesHK20P1Q19Steps(lang: Lang): AngleBeat[] {
  const en = lang === 'en'

  return [
    {
      phase: 'intro',
      highlightVertex: 0,
      count: 0,
      caption: en
        ? 'This polygon has corners. Each corner has exactly one interior angle.'
        : 'Poligon ini memiliki sudut. Setiap sudut memiliki tepat satu sudut dalam.',
      hold: 2000,
      result: false,
    },
    {
      phase: 'angle-1',
      highlightVertex: 1,
      count: 1,
      caption: en ? 'Angle 1 — bottom-left corner.' : 'Sudut 1 — pojok kiri bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-2',
      highlightVertex: 2,
      count: 2,
      caption: en ? 'Angle 2 — upper-left corner.' : 'Sudut 2 — pojok kiri atas.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-3',
      highlightVertex: 3,
      count: 3,
      caption: en ? 'Angle 3 — step corner (top left of step).' : 'Sudut 3 — pojok tangga (kiri atas tangga).',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-4',
      highlightVertex: 4,
      count: 4,
      caption: en ? 'Angle 4 — step inner corner.' : 'Sudut 4 — pojok dalam tangga.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-5',
      highlightVertex: 5,
      count: 5,
      caption: en ? 'Angle 5 — far top-right corner.' : 'Sudut 5 — pojok kanan atas.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-6',
      highlightVertex: 6,
      count: 6,
      caption: en ? 'Angle 6 — bottom-right corner.' : 'Sudut 6 — pojok kanan bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-7',
      highlightVertex: 7,
      count: 7,
      caption: en ? 'Angle 7 — bottom V-notch (pointing inward).' : 'Sudut 7 — lekukan V bawah (mengarah ke dalam).',
      hold: 1200,
      result: false,
    },
    {
      phase: 'result',
      highlightVertex: 8,
      count: 7,
      caption: en
        ? '7 interior angles counted — this polygon has 7 interior angles!'
        : '7 sudut dalam terhitung — poligon ini memiliki 7 sudut dalam!',
      hold: 0,
      result: true,
    },
  ]
}
