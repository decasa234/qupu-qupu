// Beat storyboard for OSN-07-SD-KAB-Q14 (circle-area from square corner).
//
// Seed answer: 2π
// Seed quantities (bound for anti-drift):
//   Side of square    : √4 = 2 units
//   F                 : vertex of square AND centre of circle
//   Radius            : √2 (distance from F to centre of square)
//   Area              : π × (√2)² = 2π square units

type Lang = 'en' | 'id'

export interface CSStep {
  /** Show dashed radius line from F to centre of square. */
  showRadiusLine: boolean
  /** Highlight circle stroke in red. */
  highlightCircle: boolean
  /** Highlight side of square (to label "side = 2"). */
  highlightSide: 'EF' | 'FG' | null
  /** Beat caption. */
  caption: string
  /** Equation badge (empty = hidden). */
  equation: string
  /** Is this the final/answer beat? */
  result: boolean
  /** Auto-advance hold (ms). 0 = wait for user. */
  hold: number
}

export interface CSStory {
  steps: CSStep[]
  finalIndex: number
}

export function buildCircleSquareOSN07KQ14Steps(lang: Lang): CSStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CSStep[] = [
    // 0 — intro
    {
      showRadiusLine: false,
      highlightCircle: false,
      highlightSide: null,
      hold: 1600,
      equation: '',
      result: false,
      caption: t(
        'F is the centre of the circle. Square DEFG has area 4 — find the side length.',
        'F adalah pusat lingkaran. Persegi DEFG luasnya 4 — cari panjang sisinya.',
      ),
    },
    // 1 — side = 2
    {
      showRadiusLine: false,
      highlightCircle: false,
      highlightSide: 'EF',
      hold: 1800,
      equation: 'sisi = √4 = 2',
      result: false,
      caption: t(
        'Area = side² = 4  →  side = √4 = 2 units.',
        'Luas = sisi² = 4  →  sisi = √4 = 2 satuan.',
      ),
    },
    // 2 — radius = √2
    {
      showRadiusLine: true,
      highlightCircle: true,
      highlightSide: null,
      hold: 2000,
      equation: 'r = √2',
      result: false,
      caption: t(
        'F is at one corner. The radius equals the distance from F to the centre of the square: r = √(1² + 1²) = √2 units.',
        'F berada di satu sudut. Jari-jari = jarak dari F ke pusat persegi: r = √(1² + 1²) = √2 satuan.',
      ),
    },
    // 3 — area = 2π
    {
      showRadiusLine: true,
      highlightCircle: true,
      highlightSide: null,
      hold: 0,
      equation: 'L = π × (√2)² = 2π',
      result: true,
      caption: t(
        'Area of circle = π × r² = π × (√2)² = π × 2 = 2π square units.',
        'Luas lingkaran = π × r² = π × (√2)² = π × 2 = 2π satuan luas.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
