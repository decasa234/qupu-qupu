// TIMO-22-P4H-Q16 — storyboard for the tilted-square / Pythagorean proof figure.
//
// Question: 4 identical right-angled triangles form the figure below.
// Big square area = 64, small square area = 36. Find the perimeter of the triangle.
//
// Answer: big square side = √64 = 8 = a + b; small square side = √36 = 6 = c (hypotenuse).
// Perimeter of triangle = a + b + c = 8 + 6 = 14.
//
// Teaching walk — one idea per beat:
//   0. intro        — show the static figure; state the two given areas.
//   1. big-square   — √64 = 8 → the outer square side = a + b = 8.
//   2. small-square — √36 = 6 → the inner tilted square side = c (hypotenuse) = 6.
//   3. perimeter    — perimeter = (a+b) + c = 8 + 6 = 14.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TiltedPhaseId = 'intro' | 'big-square' | 'small-square' | 'perimeter'

export interface TiltedBeat {
  phase: TiltedPhaseId
  /** Highlight the outer big square side label (a+b = 8). */
  showBigSide: boolean
  /** Highlight the inner tilted square side label (c = 6). */
  showSmallSide: boolean
  /** Show the final perimeter formula + answer. */
  showResult: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface TiltedStoryboard {
  steps: TiltedBeat[]
  finalIndex: number
}

export function buildTiltedSquareTIMO22P4Q16Steps(lang: Lang): TiltedStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TiltedBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showBigSide: false,
      showSmallSide: false,
      showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Four identical right-angled triangles fit around an inner tilted square. ' +
          'Big square area = 64, small square area = 36. Find the triangle perimeter.',
        'Empat segitiga siku-siku identik mengisi sudut-sudut persegi luar. ' +
          'Luas persegi besar = 64, luas persegi kecil = 36. Temukan keliling segitiga.',
      ),
    },

    // Beat 1 — big square → side = a + b
    {
      phase: 'big-square',
      showBigSide: true,
      showSmallSide: false,
      showResult: false,
      equation: '√64 = 8',
      hold: 2200,
      result: false,
      caption: t(
        'The outer square has area 64, so its side = √64 = 8. ' +
          'This side equals a + b (the two legs of each triangle).',
        'Persegi luar memiliki luas 64, sehingga sisinya = √64 = 8. ' +
          'Sisi ini sama dengan a + b (dua kaki setiap segitiga).',
      ),
    },

    // Beat 2 — small square → side = c (hypotenuse)
    {
      phase: 'small-square',
      showBigSide: true,
      showSmallSide: true,
      showResult: false,
      equation: '√36 = 6',
      hold: 2200,
      result: false,
      caption: t(
        'The inner tilted square has area 36, so its side = √36 = 6. ' +
          'Each side of the inner square is the hypotenuse c of the triangle.',
        'Persegi kecil miring memiliki luas 36, sehingga sisinya = √36 = 6. ' +
          'Setiap sisi persegi dalam adalah hipotenusa c dari segitiga.',
      ),
    },

    // Beat 3 — perimeter = (a+b) + c = 14
    {
      phase: 'perimeter',
      showBigSide: true,
      showSmallSide: true,
      showResult: true,
      equation: 'Keliling = (a+b) + c = 8 + 6 = 14',
      hold: 0,
      result: true,
      caption: t(
        'Perimeter = a + b + c = (a+b) + c = 8 + 6 = 14.',
        'Keliling = a + b + c = (a+b) + c = 8 + 6 = 14.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
