// OSN-11-SD-KAB-Q12 — storyboard for the parallelogram diagonal explainer.
//
// Parallelogram ABCD: AB = 3 cm, AD = 5 cm.
// The altitude from D meets AB perpendicularly AT B (right-angle mark at B).
// Find AC (a diagonal).
//
// Solution path:
//   0. intro   — show the figure; state the two given sides + altitude.
//   1. triangle — ABD is a 3-4-5 right triangle → DB = 4 cm.
//   2. coords  — place coordinates A(0,0) B(3,0) D(3,4) C(6,4).
//   3. diagonal — AC² = 6² + 4² = 52.
//   4. result  — AC = √52 = 2√13 cm.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ParaPhaseId = 'intro' | 'triangle' | 'coords' | 'diagonal' | 'result'

export interface ParaBeat {
  phase: ParaPhaseId
  showAltitude: boolean
  highlightTriangle: boolean
  showCoords: boolean
  showDiagonal: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface ParaStoryboard {
  steps: ParaBeat[]
  finalIndex: number
}

export function buildParallelogramOSN11KQ12Steps(lang: Lang): ParaStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ParaBeat[] = [
    {
      phase: 'intro',
      showAltitude: true,
      highlightTriangle: false,
      showCoords: false,
      showDiagonal: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Parallelogram ABCD: AB = 3 cm, AD = 5 cm. The altitude from D is perpendicular to AB at point B.',
        'Jajar genjang ABCD: AB = 3 cm, AD = 5 cm. Garis tinggi dari D tegak lurus AB di titik B.',
      ),
    },
    {
      phase: 'triangle',
      showAltitude: true,
      highlightTriangle: true,
      showCoords: false,
      showDiagonal: false,
      equation: 'DB = √(5² − 3²) = √16 = 4 cm',
      hold: 2400,
      result: false,
      caption: t(
        'Triangle ABD is right-angled at B. By the Pythagorean theorem: DB = √(25 − 9) = 4 cm.',
        'Segitiga ABD siku-siku di B. Teorema Pythagoras: DB = √(25 − 9) = 4 cm.',
      ),
    },
    {
      phase: 'coords',
      showAltitude: true,
      highlightTriangle: false,
      showCoords: true,
      showDiagonal: false,
      equation: 'A(0,0)  B(3,0)  D(3,4)  C(6,4)',
      hold: 2400,
      result: false,
      caption: t(
        'Place A at the origin; B is 3 to the right; D is directly above B by 4; C = D + vector AB = (6, 4).',
        'Tempatkan A di titik asal; B sejauh 3 ke kanan; D tepat di atas B sejauh 4; C = D + vektor AB = (6, 4).',
      ),
    },
    {
      phase: 'diagonal',
      showAltitude: false,
      highlightTriangle: false,
      showCoords: true,
      showDiagonal: true,
      equation: 'AC² = 6² + 4² = 36 + 16 = 52',
      hold: 2400,
      result: false,
      caption: t(
        'Diagonal AC connects A(0,0) to C(6,4): AC² = 6² + 4² = 52.',
        'Diagonal AC dari A(0,0) ke C(6,4): AC² = 6² + 4² = 52.',
      ),
    },
    {
      phase: 'result',
      showAltitude: false,
      highlightTriangle: false,
      showCoords: false,
      showDiagonal: true,
      equation: 'AC = √52 = 2√13 cm',
      hold: 0,
      result: true,
      caption: t(
        'AC = √52 = 2√13 cm — the length of diagonal AC.',
        'AC = √52 = 2√13 cm — panjang diagonal AC.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
