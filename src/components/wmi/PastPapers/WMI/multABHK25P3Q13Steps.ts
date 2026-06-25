// Beat storyboard for HKIMO-25-P3H-Q13 (AB × A = 96, find A−B).
// Bound to seed quantities: (10A+B)×A=96 → A=3,B=2, answer=1.

export type MultABPhase = 'show' | 'try' | 'verify' | 'result'

export interface MultABStep {
  phase: MultABPhase
  showValues: boolean
  aHighlight: string | undefined
  bHighlight: string | undefined
  showCheck: boolean
  caption: string
  hold: number
  result: boolean
}

export interface MultABStoryboard {
  steps: MultABStep[]
  finalIndex: number
}

type Lang = 'en' | 'id'

export function buildMultABHK25P3Q13Steps(lang: Lang): MultABStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MultABStep[] = [
    {
      phase: 'show',
      showValues: false,
      aHighlight: undefined,
      bHighlight: undefined,
      showCheck: false,
      caption: t(
        'AB × A = 96. Both A and B are digits 1–9 (A ≠ B).',
        'AB × A = 96. A dan B adalah digit 1–9 (A ≠ B).',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'try',
      showValues: false,
      aHighlight: '#FCD34D', // bright amber pulse
      bHighlight: undefined,
      showCheck: false,
      caption: t(
        'Equation: (10A + B) × A = 96. Try A = 3: (30 + B) × 3 = 96.',
        'Persamaan: (10A + B) × A = 96. Coba A = 3: (30 + B) × 3 = 96.',
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'verify',
      showValues: false,
      aHighlight: '#FCD34D',
      bHighlight: '#93C5FD', // bright blue pulse
      showCheck: false,
      caption: t(
        '30 + B = 32 → B = 2. Check: 32 × 3 = 96 ✓',
        '30 + B = 32 → B = 2. Cek: 32 × 3 = 96 ✓',
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'result',
      showValues: true,
      aHighlight: undefined,
      bHighlight: undefined,
      showCheck: true,
      caption: t(
        'A = 3, B = 2 → A − B = 3 − 2 = 1.',
        'A = 3, B = 2 → A − B = 3 − 2 = 1.',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
