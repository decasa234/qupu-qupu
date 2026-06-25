// HKIMO-25-P1H-Q19 — beat definitions for the explainer.
//
// Strategy: every vertex of a polygon is exactly one interior angle.
// Count vertices in two groups; reveal total at the end.

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'first' | 'all' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Indices into VERTICES array that should show a dot. */
  highlighted: number[]
  /** Running vertex count; -1 = not shown. */
  count: number
  caption: { en: string; id: string }
}

export function buildPolygonHK25P1Q19Steps(_lang: Lang): AnimBeat[] {
  return [
    {
      phase: 'intro',
      highlighted: [],
      count: -1,
      caption: {
        en: 'Count the corners (vertices) of the polygon. Each corner = one interior angle.',
        id: 'Hitung sudut-sudut (titik sudut) poligon ini. Setiap sudut = satu sudut dalam.',
      },
    },
    {
      phase: 'first',
      highlighted: [0, 1, 2, 3],
      count: 4,
      caption: {
        en: 'Mark the first 4 corners — 4 interior angles so far.',
        id: 'Tandai 4 titik sudut pertama — sudah ada 4 sudut dalam.',
      },
    },
    {
      phase: 'all',
      highlighted: [0, 1, 2, 3, 4, 5, 6],
      count: 7,
      caption: {
        en: '3 more corners. 4 + 3 = 7 interior angles.',
        id: '3 titik sudut lagi. 4 + 3 = 7 sudut dalam.',
      },
    },
    {
      phase: 'result',
      highlighted: [0, 1, 2, 3, 4, 5, 6],
      count: 7,
      caption: {
        en: 'The polygon has 7 vertices → 7 interior angles.',
        id: 'Poligon ini memiliki 7 titik sudut → 7 sudut dalam.',
      },
    },
  ]
}
