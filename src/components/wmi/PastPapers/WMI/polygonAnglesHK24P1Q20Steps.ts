// polygonAnglesHK24P1Q20Steps — HKIMO 2024 Heat Primary-1 Q20
// Beat-by-beat steps for counting each interior angle of the 12-gon.
//
// The question: "How many interior angle(s) is / are there in the polygon below?"
// The polygon is an irregular concave 12-gon. Answer = 12.
//
// Teaching walk, one idea per beat:
//   0.   intro      — show the polygon; note every corner has one interior angle.
//   1–12. angle-N   — highlight vertex N and its interior angle arc.
//   13.  result     — all 12 angles lit; total = 12.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type AnglePhaseId =
  | 'intro'
  | 'angle-1'  | 'angle-2'  | 'angle-3'  | 'angle-4'
  | 'angle-5'  | 'angle-6'  | 'angle-7'  | 'angle-8'
  | 'angle-9'  | 'angle-10' | 'angle-11' | 'angle-12'
  | 'result'

export interface AngleBeat {
  phase: AnglePhaseId
  /** 0 = none highlighted; 1–12 = that vertex lit; 13 = all lit */
  highlightVertex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
  /** Running count to display (0 = hide) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export function buildPolygonAnglesHK24P1Q20Steps(lang: Lang): AngleBeat[] {
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
      caption: en ? 'Angle 1 — upper-left corner.' : 'Sudut 1 — pojok kiri atas.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-2',
      highlightVertex: 2,
      count: 2,
      caption: en ? 'Angle 2 — top-left shoulder.' : 'Sudut 2 — bahu kiri atas.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-3',
      highlightVertex: 3,
      count: 3,
      caption: en ? 'Angle 3 — top-right corner.' : 'Sudut 3 — pojok kanan atas.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-4',
      highlightVertex: 4,
      count: 4,
      caption: en ? 'Angle 4 — step before the notch.' : 'Sudut 4 — langkah sebelum lekukan.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-5',
      highlightVertex: 5,
      count: 5,
      caption: en
        ? 'Angle 5 — reflex notch tip (points inward).'
        : 'Sudut 5 — ujung lekukan refleks (mengarah ke dalam).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'angle-6',
      highlightVertex: 6,
      count: 6,
      caption: en ? 'Angle 6 — step after the notch.' : 'Sudut 6 — langkah setelah lekukan.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-7',
      highlightVertex: 7,
      count: 7,
      caption: en ? 'Angle 7 — far-right tip.' : 'Sudut 7 — ujung kanan jauh.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-8',
      highlightVertex: 8,
      count: 8,
      caption: en ? 'Angle 8 — lower-right corner.' : 'Sudut 8 — pojok kanan bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-9',
      highlightVertex: 9,
      count: 9,
      caption: en ? 'Angle 9 — bottom centre.' : 'Sudut 9 — tengah bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-10',
      highlightVertex: 10,
      count: 10,
      caption: en
        ? 'Angle 10 — reflex step inner corner (points inward).'
        : 'Sudut 10 — pojok dalam tangga refleks (mengarah ke dalam).',
      hold: 1400,
      result: false,
    },
    {
      phase: 'angle-11',
      highlightVertex: 11,
      count: 11,
      caption: en ? 'Angle 11 — lower-left step end.' : 'Sudut 11 — ujung tangga kiri bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'angle-12',
      highlightVertex: 12,
      count: 12,
      caption: en ? 'Angle 12 — lower-left corner.' : 'Sudut 12 — pojok kiri bawah.',
      hold: 1200,
      result: false,
    },
    {
      phase: 'result',
      highlightVertex: 13,
      count: 12,
      caption: en
        ? '12 interior angles counted — this polygon has 12 interior angles!'
        : '12 sudut dalam terhitung — poligon ini memiliki 12 sudut dalam!',
      hold: 0,
      result: true,
    },
  ]
}
