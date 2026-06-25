// SEAMO-20-A-Q4 — storyboard for the U-shape rectilinear perimeter animation.
//
// Question: find the perimeter of the U-shaped figure below (20 × 20 outer
// square with a 10 × 10 rectangular slot cut from the top centre).
// Labeled: bottom = 20 cm, right outer = 20 cm, slot inner wall = 10 cm.
// Answer: B — 100 cm.
//
// Teaching walk (one idea per beat):
//   0. intro    — static figure; state the three labeled sides (20, 20, 10).
//   1. labeled  — highlight the three labeled sides; total = 50 cm.
//   2. deduced  — for rectilinear shapes, opposite sides match → unlabeled = 50 cm.
//   3. total    — perimeter = 50 + 50 = 100 cm → B.

export type Lang = 'en' | 'id'
export type RectPhase = 'labeled' | 'deduced' | 'total' | null

export interface RectBeat {
  phase: RectPhase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface RectStoryboard {
  steps: RectBeat[]
  finalIndex: number
}

export function buildRectilinear20A4Steps(lang: Lang): RectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectBeat[] = [
    {
      phase: null,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'A U-shaped figure. Three sides are labeled: 20 cm (bottom), 20 cm (right), 10 cm (inner slot wall).',
        'Bangun berbentuk U. Tiga sisi berlabel: 20 cm (bawah), 20 cm (kanan), 10 cm (dinding celah dalam).',
      ),
    },
    {
      phase: 'labeled',
      equation: '20 + 20 + 10 = 50 cm',
      hold: 2400,
      result: false,
      caption: t(
        'Add the labeled sides: 20 + 20 + 10 = 50 cm (blue).',
        'Jumlahkan sisi berlabel: 20 + 20 + 10 = 50 cm (biru).',
      ),
    },
    {
      phase: 'deduced',
      equation: '10 + 20 + 20 = 50 cm',
      hold: 2600,
      result: false,
      caption: t(
        'For a rectilinear shape, the unlabeled sides also total 50 cm — opposite sides always match up!',
        'Untuk bangun siku-siku, sisi tak berlabel juga berjumlah 50 cm — sisi berhadapan selalu sama panjang!',
      ),
    },
    {
      phase: 'total',
      equation: '50 + 50 = 100 cm',
      hold: 0,
      result: true,
      caption: t(
        'Perimeter = 50 + 50 = 100 cm — answer B.',
        'Keliling = 50 + 50 = 100 cm — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
