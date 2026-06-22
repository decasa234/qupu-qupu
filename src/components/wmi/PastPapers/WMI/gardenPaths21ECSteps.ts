// gardenPaths21ECSteps.ts
//
// Storyboard builder for IKMC-22-EC-Q21: garden laps (LCM problem).
//
// Setup: square garden perimeter = 4 × 5 = 20 m; rectangle perimeter = 2 × (10 + 5) = 30 m.
// Both walk at the same speed. They meet at A when both have completed whole-number laps.
// LCM(20, 30) = 60 m  →  Ahmad: 60 ÷ 20 = 3 laps, Zhaleh: 60 ÷ 30 = 2 laps.
// Minimum laps for Ahmad = 3 → answer C.

export type Lang = 'en' | 'id'

export type GardenPhase =
  | 'intro'           // show both gardens with walkers
  | 'squarePerim'     // calculate square perimeter 4 × 5 = 20
  | 'rectPerim'       // calculate rectangle perimeter 2 × (10 + 5) = 30
  | 'lcmSetup'        // they meet when both reach a multiple of their perimeter
  | 'lcmCalc'         // LCM(20, 30) = 60
  | 'lapsAhmad'       // 60 ÷ 20 = 3 laps for Ahmad
  | 'answer'          // answer = C = 3

export interface GardenStep {
  phase: GardenPhase
  /** Highlight the square perimeter border in amber. */
  highlightSquare: boolean
  /** Highlight the rectangle perimeter border in amber. */
  highlightRect: boolean
  /** Show Ahmad's lap count inside the square. */
  ahmadLaps: number | null
  /** Show Zhaleh's lap count inside the rectangle. */
  zhalehLaps: number | null
  /** Hide the walker glyphs (cleaner for perim calculation beats). */
  hideWalkers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface GardenStoryboard {
  steps: GardenStep[]
  finalIndex: number
}

export function buildGardenPaths21ECSteps(lang: Lang): GardenStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GardenStep[] = [
    {
      phase: 'intro',
      highlightSquare: false,
      highlightRect: false,
      ahmadLaps: null,
      zhalehLaps: null,
      hideWalkers: false,
      hold: 2400,
      result: false,
      caption: t(
        'Ahmad loops the square, Zhaleh loops the rectangle — both start at A with the same speed.',
        'Ahmad mengelilingi persegi, Zhaleh mengelilingi persegi panjang — keduanya mulai di A dengan kecepatan yang sama.',
      ),
    },
    {
      phase: 'squarePerim',
      highlightSquare: true,
      highlightRect: false,
      ahmadLaps: null,
      zhalehLaps: null,
      hideWalkers: true,
      hold: 2400,
      result: false,
      caption: t(
        "Square perimeter: 4 × 5 m = 20 m — Ahmad's one lap = 20 m.",
        'Keliling persegi: 4 × 5 m = 20 m — satu putaran Ahmad = 20 m.',
      ),
    },
    {
      phase: 'rectPerim',
      highlightSquare: false,
      highlightRect: true,
      ahmadLaps: null,
      zhalehLaps: null,
      hideWalkers: true,
      hold: 2400,
      result: false,
      caption: t(
        'Rectangle perimeter: 2 × (10 + 5) m = 30 m — Zhaleh\'s one lap = 30 m.',
        'Keliling persegi panjang: 2 × (10 + 5) m = 30 m — satu putaran Zhaleh = 30 m.',
      ),
    },
    {
      phase: 'lcmSetup',
      highlightSquare: false,
      highlightRect: false,
      ahmadLaps: null,
      zhalehLaps: null,
      hideWalkers: false,
      hold: 2400,
      result: false,
      caption: t(
        'They return to A together when both finish whole-number laps. Find the smallest distance that is a multiple of BOTH 20 m and 30 m.',
        'Mereka tiba di A bersama saat keduanya menyelesaikan putaran bulat. Cari jarak terkecil yang merupakan kelipatan dari 20 m DAN 30 m.',
      ),
    },
    {
      phase: 'lcmCalc',
      highlightSquare: true,
      highlightRect: true,
      ahmadLaps: null,
      zhalehLaps: null,
      hideWalkers: true,
      hold: 2600,
      result: false,
      caption: t(
        'Multiples of 20: 20, 40, 60 … — Multiples of 30: 30, 60 … — First common value: 60 m = LCM(20, 30).',
        'Kelipatan 20: 20, 40, 60 … — Kelipatan 30: 30, 60 … — Nilai pertama yang sama: 60 m = KPK(20, 30).',
      ),
    },
    {
      phase: 'lapsAhmad',
      highlightSquare: true,
      highlightRect: false,
      ahmadLaps: 3,
      zhalehLaps: 2,
      hideWalkers: true,
      hold: 2600,
      result: false,
      caption: t(
        'Ahmad: 60 ÷ 20 = 3 laps around the square. Zhaleh: 60 ÷ 30 = 2 laps around the rectangle.',
        'Ahmad: 60 ÷ 20 = 3 putaran mengelilingi persegi. Zhaleh: 60 ÷ 30 = 2 putaran mengelilingi persegi panjang.',
      ),
    },
    {
      phase: 'answer',
      highlightSquare: true,
      highlightRect: false,
      ahmadLaps: 3,
      zhalehLaps: null,
      hideWalkers: false,
      hold: 0,
      result: true,
      caption: t(
        'The smallest number of laps Ahmad can do is 3 → answer C.',
        'Jumlah putaran minimum yang dapat dilakukan Ahmad adalah 3 → jawaban C.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
