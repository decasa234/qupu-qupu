// HKIMO-25-P2H-Q19 — beat definitions for the explainer.
//
// Strategy: every vertex of a polygon is one interior angle.
// Reveal vertices in two groups; show total 6 at the end.

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'first' | 'all' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Indices into VERTICES that should show a dot. */
  highlighted: number[]
  /** Running vertex count; -1 = not shown. */
  count: number
  caption: { en: string; id: string }
}

export function buildPolygonCountHK25P2Q19Steps(_lang: Lang): AnimBeat[] {
  return [
    {
      phase: 'intro',
      highlighted: [],
      count: -1,
      caption: {
        en: 'Count the corners (vertices) of the polygon. Each corner = one interior angle.',
        id: 'Hitung titik-titik sudut poligon ini. Setiap titik sudut = satu sudut dalam.',
      },
    },
    {
      phase: 'first',
      highlighted: [0, 1, 2],
      count: 3,
      caption: {
        en: 'Mark the first 3 corners — 3 interior angles so far.',
        id: 'Tandai 3 titik sudut pertama — sudah ada 3 sudut dalam.',
      },
    },
    {
      phase: 'all',
      highlighted: [0, 1, 2, 3, 4, 5],
      count: 6,
      caption: {
        en: '3 more corners (including 2 concave ones). 3 + 3 = 6 interior angles.',
        id: '3 titik sudut lagi (termasuk 2 sudut cekung). 3 + 3 = 6 sudut dalam.',
      },
    },
    {
      phase: 'result',
      highlighted: [0, 1, 2, 3, 4, 5],
      count: 6,
      caption: {
        en: 'The polygon has 6 vertices → 6 interior angles.',
        id: 'Poligon ini memiliki 6 titik sudut → 6 sudut dalam.',
      },
    },
  ]
}
