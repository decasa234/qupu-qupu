// IKMC-22-PE-Q12 — storyboard for the "unique shape" explainer.
//
// The question: five tangram animal pictures. In one of them a shape is used
// that cannot be seen in the others. Answer: D (purple dog).
//
// Key insight:
//   - Pictures A, B, C, E are made from right triangles, 45°-diamond squares,
//     and/or slanted parallelograms — the standard tangram pieces.
//   - Picture D (the dog) uniquely contains a RECTANGLE (horizontal, right-
//     angled corners, wider than tall) used as the dog's body. A rectangle
//     is not found in any of the other four pictures.
//
// Teaching walk, one beat per idea:
//   0. intro     — "Look at each picture and name the shapes."
//   1. scanABCE  — "A, B, C, E all use triangles, diamonds, and parallelograms."
//   2. spotD     — "Picture D (dog) has a wide rectangle as its body."
//   3. compare   — "A rectangle (4 right angles, not equal sides) is missing in A/B/C/E."
//   4. result    — "Only D has the rectangle → answer D."
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ShapeOddPhase =
  | 'intro'
  | 'scanABCE'
  | 'spotD'
  | 'compare'
  | 'result'

export interface ShapeOddBeat {
  phase: ShapeOddPhase
  /** Which option labels are highlighted ('A'–'E', or null = none). */
  highlight: string[]
  /** True when this is the answer-reveal beat. */
  result: boolean
  /** Hold time in ms (0 = final / manual). */
  hold: number
  /** Caption text for the explanation box. */
  caption: string
  /** Short equation/tag shown in the pill chip; '' to hide. */
  tag: string
}

export interface ShapeOddStoryboard {
  steps: ShapeOddBeat[]
  finalIndex: number
}

export function buildShapeOdd12PESteps(lang: Lang): ShapeOddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeOddBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: [],
      result: false,
      hold: 2200,
      tag: '',
      caption: t(
        'Each picture is a tangram animal made from flat shapes. Find the picture with a shape missing from all the others.',
        'Setiap gambar adalah hewan tangram dari bentuk-bentuk datar. Temukan gambar yang memiliki bentuk yang tidak ada di gambar lainnya.',
      ),
    },

    // Beat 1 — scan A, B, C, E
    {
      phase: 'scanABCE',
      highlight: ['A', 'B', 'C', 'E'],
      result: false,
      hold: 2600,
      tag: t('▲ ◇ ⬡', '▲ ◇ ⬡'),
      caption: t(
        'A, B, C, E all use right triangles, 45° diamond-squares, and parallelograms.',
        'A, B, C, E semuanya menggunakan segitiga siku-siku, belah ketupat 45°, dan jajargenjang.',
      ),
    },

    // Beat 2 — spot D
    {
      phase: 'spotD',
      highlight: ['D'],
      result: false,
      hold: 2400,
      tag: t('rectangle?', 'persegi panjang?'),
      caption: t(
        'Picture D (the dog) has a wide horizontal rectangle as its body — 4 right angles, but not a square.',
        'Gambar D (anjing) memiliki persegi panjang horizontal lebar sebagai tubuhnya — 4 sudut siku-siku, tapi bukan persegi.',
      ),
    },

    // Beat 3 — compare
    {
      phase: 'compare',
      highlight: ['D'],
      result: false,
      hold: 2400,
      tag: t('□ not in A/B/C/E', '□ tidak ada di A/B/C/E'),
      caption: t(
        'A rectangle with right angles appears only in picture D. None of A, B, C, E use this shape.',
        'Persegi panjang bersudut siku-siku hanya muncul di gambar D. Tidak ada di A, B, C, atau E.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: ['D'],
      result: true,
      hold: 0,
      tag: t('Answer: D', 'Jawaban: D'),
      caption: t(
        'Only picture D contains a rectangle — the shape not seen in any of the others. Answer: D.',
        'Hanya gambar D yang memiliki persegi panjang — bentuk yang tidak ada di gambar lainnya. Jawaban: D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
