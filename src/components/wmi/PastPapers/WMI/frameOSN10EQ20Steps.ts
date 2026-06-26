// OSN-10-SD-KEC-Q20 — storyboard for the stick-frame animation.
//
// Teaching walk — one idea per beat:
//   0. intro    — show the frame; pose the problem.
//   1. equil    — highlight equilateral triangle (all 3 sides blue); 3 × 10 = 30 cm.
//   2. pythagor — highlight right triangle; reveal missing leg via Pythagoras → 8 cm.
//   3. right    — show the 2 unique right-triangle sticks (6 + 8); grey out equilateral.
//   4. result   — all sticks green; 30 + 14 = 44 cm.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'equil' | 'pythagor' | 'right' | 'result'

export interface FrameBeat {
  phase: PhaseId
  equilColor:  string
  sharedColor: string
  rightColor:  string
  showHypoLabel: boolean
  equation: string
  caption:  string
  hold:   number
  result: boolean
}

export interface FrameStoryboard {
  steps: FrameBeat[]
  finalIndex: number
}

const DARK  = '#374151'
const GREY  = '#9CA3AF'
const BLUE  = '#2563EB'
const AMBER = '#D97706'
const GREEN = '#10B981'

export function buildFrameOSN10EQ20Steps(lang: Lang): FrameStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FrameBeat[] = [

    // Beat 0 — intro
    {
      phase: 'intro',
      equilColor:  DARK,
      sharedColor: DARK,
      rightColor:  DARK,
      showHypoLabel: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The frame has an equilateral triangle (10 cm sides) and a right triangle (6 cm base) sharing one side. What is the total stick length?',
        'Kerangka ini terdiri dari segitiga sama sisi (sisi 10 cm) dan segitiga siku-siku (kaki 6 cm) yang berbagi satu sisi. Berapa total panjang tongkat?',
      ),
    },

    // Beat 1 — highlight equilateral: 3 × 10 = 30 cm
    {
      phase: 'equil',
      equilColor:  BLUE,
      sharedColor: BLUE,
      rightColor:  GREY,
      showHypoLabel: false,
      equation: t('3 × 10 cm = 30 cm', '3 × 10 cm = 30 cm'),
      hold: 2400,
      result: false,
      caption: t(
        'The equilateral triangle has 3 equal sides of 10 cm each. Total for the equilateral: 3 × 10 = 30 cm.',
        'Segitiga sama sisi memiliki 3 sisi yang sama, masing-masing 10 cm. Total untuk segitiga ini: 3 × 10 = 30 cm.',
      ),
    },

    // Beat 2 — find missing leg via Pythagoras
    {
      phase: 'pythagor',
      equilColor:  GREY,
      sharedColor: BLUE,
      rightColor:  AMBER,
      showHypoLabel: true,
      equation: t('√(10²−6²) = √64 = 8 cm', '√(10²−6²) = √64 = 8 cm'),
      hold: 2800,
      result: false,
      caption: t(
        'The shared side is the hypotenuse of the right triangle (10 cm). By Pythagoras: missing leg = √(10²−6²) = √64 = 8 cm.',
        'Sisi bersama adalah hipotenusa segitiga siku-siku (10 cm). Teorema Pythagoras: kaki yang hilang = √(10²−6²) = √64 = 8 cm.',
      ),
    },

    // Beat 3 — unique right-triangle sticks: 6 + 8 = 14 cm
    {
      phase: 'right',
      equilColor:  GREY,
      sharedColor: GREY,
      rightColor:  GREEN,
      showHypoLabel: true,
      equation: t('6 + 8 = 14 cm', '6 + 8 = 14 cm'),
      hold: 2400,
      result: false,
      caption: t(
        'The right triangle adds 2 unique sticks not shared with the equilateral: 6 cm + 8 cm = 14 cm.',
        'Segitiga siku-siku menambahkan 2 tongkat unik yang tidak dibagi: 6 cm + 8 cm = 14 cm.',
      ),
    },

    // Beat 4 — result: 30 + 14 = 44 cm
    {
      phase: 'result',
      equilColor:  GREEN,
      sharedColor: GREEN,
      rightColor:  GREEN,
      showHypoLabel: true,
      equation: t('30 + 14 = 44 cm', '30 + 14 = 44 cm'),
      hold: 0,
      result: true,
      caption: t(
        'Total stick length = 30 cm (equilateral) + 14 cm (right triangle unique sides) = 44 cm.',
        'Total panjang tongkat = 30 cm (segitiga sama sisi) + 14 cm (sisi unik siku-siku) = 44 cm.',
      ),
    },

  ]

  return { steps, finalIndex: steps.length - 1 }
}
