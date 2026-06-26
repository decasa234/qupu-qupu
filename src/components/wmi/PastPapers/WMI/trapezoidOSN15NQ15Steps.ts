// Beat storyboard for OSN-15-SD-NAS-Q15 (trapezoid area ratio).
//
// Seed answer: 3:4
// Seed quantities (bound for anti-drift):
//   DC = 1, AB = 3 (AB = 3 × DC)
//   Height of trapezoid = h
//   Area △ABP = ½ × 3 × h = 3h/2
//   Area trap ABCD = ½ × (1+3) × h = 2h
//   Ratio = 3h/2 : 2h = 3:4

type Lang = 'en' | 'id'

export interface TrapStep {
  fillTriangle: boolean
  highlightAB:  boolean
  highlightDC:  boolean
  showHeight:   boolean
  caption:      string
  equation:     string
  result:       boolean
  hold:         number
}

export interface TrapStory {
  steps:      TrapStep[]
  finalIndex: number
}

export function buildTrapezoidOSN15NQ15Steps(lang: Lang): TrapStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrapStep[] = [
    // 0 — intro
    {
      fillTriangle: false, highlightAB: false, highlightDC: false, showHeight: false,
      hold: 1600, equation: '', result: false,
      caption: t(
        'Trapezoid ABCD: AB ∥ DC and AB = 3 × DC. P lies on DC. Find area(ABP) : area(ABCD).',
        'Trapesium ABCD: AB ∥ DC dan AB = 3 × DC. P terletak pada DC. Cari luas(ABP) : luas(ABCD).',
      ),
    },
    // 1 — assign side lengths
    {
      fillTriangle: false, highlightAB: true, highlightDC: true, showHeight: false,
      hold: 1800, equation: 'DC = 1,  AB = 3', result: false,
      caption: t(
        'Let DC = 1 and AB = 3. Let h be the perpendicular distance between the two parallel sides.',
        'Misalkan DC = 1 dan AB = 3. Misalkan h adalah jarak tegak lurus antara dua sisi sejajar.',
      ),
    },
    // 2 — show height
    {
      fillTriangle: false, highlightAB: false, highlightDC: false, showHeight: true,
      hold: 1800, equation: 'tinggi = h', result: false,
      caption: t(
        'P lies on DC, so △ABP shares the full height h with the trapezoid.',
        'P terletak pada DC, sehingga △ABP memiliki tinggi penuh h yang sama dengan trapesium.',
      ),
    },
    // 3 — triangle area
    {
      fillTriangle: true, highlightAB: false, highlightDC: false, showHeight: true,
      hold: 2000, equation: '½ × 3 × h = 3h/2', result: false,
      caption: t(
        'Area of △ABP = ½ × AB × h = ½ × 3 × h = 3h/2.',
        'Luas △ABP = ½ × AB × h = ½ × 3 × h = 3h/2.',
      ),
    },
    // 4 — trapezoid area
    {
      fillTriangle: false, highlightAB: false, highlightDC: false, showHeight: true,
      hold: 2000, equation: '½ × (1+3) × h = 2h', result: false,
      caption: t(
        'Area of trapezoid ABCD = ½ × (DC + AB) × h = ½ × 4 × h = 2h.',
        'Luas trapesium ABCD = ½ × (DC + AB) × h = ½ × 4 × h = 2h.',
      ),
    },
    // 5 — final ratio
    {
      fillTriangle: true, highlightAB: false, highlightDC: false, showHeight: false,
      hold: 0, equation: '3h/2 : 2h = 3 : 4', result: true,
      caption: t(
        'Ratio = (3h/2) ÷ 2h = 3/4 → area △ABP : area ABCD = 3 : 4.',
        'Rasio = (3h/2) ÷ 2h = 3/4 → luas △ABP : luas ABCD = 3 : 4.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
