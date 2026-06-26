// Beat storyboard for OSN-24-SD-NAS-TEORI1-Q18.
//
// Seed answer: 24 cm²
// Seed quantities (bound for anti-drift):
//   AT = TB           : 5 cm each (midpoint)
//   rA                : 4 cm  →  tangent from T to circle A = √(5²−4²) = 3 cm  (3-4-5)
//   rB                : 3 cm  →  tangent from T to circle B = √(5²−3²) = 4 cm  (3-4-5)
//   Tangent points    : form a rectangle 5 cm × 4.8 cm
//   Hatched area      : 5 × 4.8 = 24 cm²

type Lang = 'en' | 'id'

export interface TCTStep {
  showHatch: boolean
  showRadii: boolean
  showRightAngles: boolean
  showTangentLines: boolean
  highlightRect: boolean
  showDimensions: boolean
  showPointLabels: boolean
  highlightRadiiA: boolean
  highlightRadiiB: boolean
  highlightShaded: boolean
  caption: string
  equation: string
  result: boolean
  hold: number
}

export interface TCTStory {
  steps: TCTStep[]
  finalIndex: number
}

const base: Omit<TCTStep, 'caption' | 'equation' | 'result' | 'hold'> = {
  showHatch: false,
  showRadii: false,
  showRightAngles: false,
  showTangentLines: false,
  highlightRect: false,
  showDimensions: false,
  showPointLabels: true,
  highlightRadiiA: false,
  highlightRadiiB: false,
  highlightShaded: false,
}

export function buildTwoCirclesTangentOSN24NT1Q18Steps(lang: Lang): TCTStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TCTStep[] = [
    // 0 — intro: plain circles, labels A B T
    {
      ...base,
      showTangentLines: true,
      hold: 1600,
      equation: '',
      result: false,
      caption: t(
        'Two circles: A (radius 4 cm) and B (radius 3 cm), centres 10 cm apart. T is the midpoint of AB.',
        'Dua lingkaran: A (jari-jari 4 cm) dan B (jari-jari 3 cm), jarak pusat 10 cm. T titik tengah AB.',
      ),
    },
    // 1 — AT = BT = 5
    {
      ...base,
      showTangentLines: true,
      showDimensions: true,
      hold: 1800,
      equation: 'AT = BT = 5 cm',
      result: false,
      caption: t(
        'T is the midpoint of AB = 10 cm, so AT = BT = 5 cm.',
        'T titik tengah AB = 10 cm, jadi AT = BT = 5 cm.',
      ),
    },
    // 2 — 3-4-5 at circle A (right angle at P1/P4)
    {
      ...base,
      showTangentLines: true,
      showRadii: true,
      showRightAngles: true,
      highlightRadiiA: true,
      showDimensions: true,
      hold: 2200,
      equation: '√(5²−4²) = 3 cm',
      result: false,
      caption: t(
        'Tangent from T to circle A: AT=5, rA=4 → tangent = √(5²−4²) = 3 cm. (3-4-5 triangle!)',
        'Garis singgung dari T ke lingkaran A: AT=5, rA=4 → singgung = √(5²−4²) = 3 cm. (segitiga 3-4-5!)',
      ),
    },
    // 3 — 3-4-5 at circle B
    {
      ...base,
      showTangentLines: true,
      showRadii: true,
      showRightAngles: true,
      highlightRadiiB: true,
      showDimensions: true,
      hold: 2200,
      equation: '√(5²−3²) = 4 cm',
      result: false,
      caption: t(
        'Tangent from T to circle B: BT=5, rB=3 → tangent = √(5²−3²) = 4 cm. (another 3-4-5!)',
        'Garis singgung dari T ke lingkaran B: BT=5, rB=3 → singgung = √(5²−3²) = 4 cm. (3-4-5 lagi!)',
      ),
    },
    // 4 — rectangle of tangent points
    {
      ...base,
      showHatch: true,
      showTangentLines: true,
      showRadii: true,
      showRightAngles: true,
      highlightRect: true,
      showDimensions: true,
      hold: 2000,
      equation: t('Rectangle: 5 cm × 4.8 cm', 'Persegi panjang: 5 cm × 4,8 cm'),
      result: false,
      caption: t(
        'The 4 tangent points form a rectangle. Width = 5 cm (= AT). Height = 2 × 2.4 = 4.8 cm.',
        'Empat titik singgung membentuk persegi panjang. Lebar = 5 cm (= AT). Tinggi = 2 × 2,4 = 4,8 cm.',
      ),
    },
    // 5 — answer
    {
      ...base,
      showHatch: true,
      showTangentLines: true,
      showRightAngles: true,
      highlightShaded: true,
      showDimensions: true,
      hold: 0,
      equation: '5 × 4,8 = 24 cm²',
      result: true,
      caption: t(
        'Area of hatched region = 5 × 4.8 = 24 cm².',
        'Luas daerah yang diarsir = 5 × 4,8 = 24 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
