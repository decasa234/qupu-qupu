// HKIMO-24-P1H-Q18 — storyboard for the line-segment counting animation.
//
// The question: count ALL line segments in the compound figure.
// Left pentagon (5 outer) + 2 crossing diagonals = 7
// Right hexagon (6 outer) + 2 internal lines from junction = 8
// Total = 15
//
// Teaching walk, one group per beat:
//   0. intro      — show full figure; prompt to count.
//   1. left-outer — amber: 5 outer edges of the left pentagon.
//   2. left-diag  — orange: 2 crossing diagonals inside left shape. Subtotal 7.
//   3. right-outer — blue: 6 outer edges of the hexagon. Subtotal 13.
//   4. right-diag — purple: 2 internal lines in hexagon. Total 15.
//   5. result     — green: answer = 15.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type LSPhase =
  | 'intro'
  | 'left-outer'
  | 'left-diag'
  | 'right-outer'
  | 'right-diag'
  | 'result'

export interface LSBeat {
  phase: LSPhase
  showLeftOuter: boolean
  showLeftDiag: boolean
  showRightOuter: boolean
  showRightDiag: boolean
  /** Running count of segments shown so far (0 = none yet). */
  count: number
  /** Arithmetic label to show below the figure. */
  equation: string
  caption: string
  /** Auto-advance hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface LSStoryboard {
  steps: LSBeat[]
  finalIndex: number
}

export function buildLineSegsHK24P1Q18Steps(lang: Lang): LSStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LSBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showLeftOuter: false,
      showLeftDiag: false,
      showRightOuter: false,
      showRightDiag: false,
      count: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Count every line segment in the figure. A line segment is a straight line from one point to another.',
        'Hitung setiap segmen garis pada gambar. Segmen garis adalah garis lurus dari satu titik ke titik lain.',
      ),
    },
    // Beat 1 — left pentagon outer (5 segments)
    {
      phase: 'left-outer',
      showLeftOuter: true,
      showLeftDiag: false,
      showRightOuter: false,
      showRightDiag: false,
      count: 5,
      equation: '5',
      hold: 2400,
      result: false,
      caption: t(
        'The left shape has 5 outer edges → 5 line segments so far.',
        'Bentuk kiri memiliki 5 sisi luar → 5 segmen garis sejauh ini.',
      ),
    },
    // Beat 2 — left diagonals (2 more)
    {
      phase: 'left-diag',
      showLeftOuter: true,
      showLeftDiag: true,
      showRightOuter: false,
      showRightDiag: false,
      count: 7,
      equation: '5 + 2 = 7',
      hold: 2400,
      result: false,
      caption: t(
        'Two lines cross inside the left shape: 5 + 2 = 7 segments so far.',
        'Dua garis bersilangan di dalam bentuk kiri: 5 + 2 = 7 segmen sejauh ini.',
      ),
    },
    // Beat 3 — right hexagon outer (6 more)
    {
      phase: 'right-outer',
      showLeftOuter: true,
      showLeftDiag: true,
      showRightOuter: true,
      showRightDiag: false,
      count: 13,
      equation: '7 + 6 = 13',
      hold: 2400,
      result: false,
      caption: t(
        'The right hexagon has 6 outer sides: 7 + 6 = 13 segments so far.',
        'Segi enam di kanan memiliki 6 sisi luar: 7 + 6 = 13 segmen sejauh ini.',
      ),
    },
    // Beat 4 — right hexagon internal lines (2 more)
    {
      phase: 'right-diag',
      showLeftOuter: true,
      showLeftDiag: true,
      showRightOuter: true,
      showRightDiag: true,
      count: 15,
      equation: '13 + 2 = 15',
      hold: 2400,
      result: false,
      caption: t(
        'Two lines fan out from the junction inside the hexagon: 13 + 2 = 15.',
        'Dua garis memanjang dari titik sambungan di dalam segi enam: 13 + 2 = 15.',
      ),
    },
    // Beat 5 — result
    {
      phase: 'result',
      showLeftOuter: true,
      showLeftDiag: true,
      showRightOuter: true,
      showRightDiag: true,
      count: 15,
      equation: '5 + 2 + 6 + 2 = 15',
      hold: 0,
      result: true,
      caption: t(
        'There are 15 line segments in total.',
        'Ada 15 segmen garis seluruhnya.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
