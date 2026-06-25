// HKIMO-24-P2H-Q20 — "How many interior angle(s) is / are there in the polygon below?"
//
// The polygon has 12 vertices → 12 sides → 12 interior angles.
// Strategy: trace the outline; every corner is one interior angle.
// The beat sequence reveals the numbered vertices in three waves (4 at a time)
// then lands on the answer.

export type Lang = 'en' | 'id'

export interface PolygonAnglesHK24P2Q20Step {
  /** how many vertex markers (1-indexed) to render on the polygon (0 = none) */
  highlightCount: number
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export function buildPolygonAnglesHK24P2Q20Steps(lang: Lang): {
  steps: PolygonAnglesHK24P2Q20Step[]
  finalIndex: number
} {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PolygonAnglesHK24P2Q20Step[] = [
    {
      highlightCount: 0,
      equationLine: null,
      hold: 2200,
      result: false,
      caption: t(
        'Count the interior angles of this polygon by tracing each corner.',
        'Hitung sudut dalam poligon ini dengan menelusuri setiap sudut.',
      ),
    },
    {
      highlightCount: 4,
      equationLine: null,
      hold: 2200,
      result: false,
      caption: t(
        'Start at the top tip — each corner along the outline is one interior angle.',
        'Mulai dari puncak atas — setiap sudut pada garis tepi adalah satu sudut dalam.',
      ),
    },
    {
      highlightCount: 8,
      equationLine: null,
      hold: 2200,
      result: false,
      caption: t(
        'Continue around: the staircase and the bottom edge give more corners.',
        'Teruskan mengelilingi: anak tangga dan sisi bawah memberikan lebih banyak sudut.',
      ),
    },
    {
      highlightCount: 12,
      equationLine: 'Interior angles = sides = 12',
      hold: 0,
      result: true,
      caption: t(
        'All 12 corners counted — the polygon has 12 interior angles.',
        'Semua 12 sudut terhitung — poligon ini memiliki 12 sudut dalam.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
