// HKIMO-20-P1H-Q16 — beat-by-beat storyboard.
//
// Teaching walk:
//   0. intro       — show both figures; state the given (Figure 1 = 7 cubes).
//   1. fig1-count  — highlight Figure 1 cubes and confirm the count.
//   2. scale       — identify the ×3 extension from Figure 1 to Figure 2.
//   3. fig2-count  — highlight Figure 2 cubes; compute 7 × 3 = 21.
//   4. result      — confirm answer = 21.
//
// Pure builder: (lang) → beats. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CubeScalePhase = 'intro' | 'fig1-count' | 'scale' | 'fig2-count' | 'result'

export interface CubeScaleBeat {
  phase: CubeScalePhase
  /** Highlight (gold) the Figure 1 cubes. */
  highlightFig1: boolean
  /** Highlight (gold) the Figure 2 cubes. */
  highlightFig2: boolean
  /** Show the ×3 scale arrow between the two figures. */
  showScale: boolean
  /** Arithmetic line displayed below the figure; '' = hidden. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat (drives green styling). */
  result: boolean
}

export function buildCubeScaleHK20P1Q16Steps(lang: Lang): CubeScaleBeat[] {
  const id = lang === 'id'
  return [
    {
      phase: 'intro',
      highlightFig1: false,
      highlightFig2: false,
      showScale: false,
      equation: '',
      caption: id
        ? 'Bangun 1 terdiri atas 7 kubus. Berapa banyak kubus yang membentuk Bangun 2?'
        : 'Figure 1 is formed by 7 cubes. How many cubes are in Figure 2?',
      hold: 2200,
      result: false,
    },
    {
      phase: 'fig1-count',
      highlightFig1: true,
      highlightFig2: false,
      showScale: false,
      equation: id ? 'Bangun 1 = 7 kubus' : 'Figure 1 = 7 cubes',
      caption: id
        ? 'Hitung kubus pada Bangun 1: ada 7 kubus (diberikan).'
        : 'Count the cubes in Figure 1: 7 cubes (given).',
      hold: 2200,
      result: false,
    },
    {
      phase: 'scale',
      highlightFig1: false,
      highlightFig2: false,
      showScale: true,
      equation: id ? 'Faktor skala = ×3' : 'Scale factor = ×3',
      caption: id
        ? 'Bangun 2 adalah 3 kali lebih panjang dari Bangun 1 → faktor skala = 3.'
        : 'Figure 2 is 3× as long as Figure 1 → scale factor = 3.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'fig2-count',
      highlightFig1: false,
      highlightFig2: true,
      showScale: false,
      equation: id ? '7 × 3 = 21 kubus' : '7 × 3 = 21 cubes',
      caption: id
        ? 'Jumlah kubus Bangun 2 = 7 × 3 = 21.'
        : 'Cubes in Figure 2 = 7 × 3 = 21.',
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      highlightFig1: false,
      highlightFig2: true,
      showScale: false,
      equation: id ? '7 × 3 = 21 kubus ✓' : '7 × 3 = 21 cubes ✓',
      caption: id ? 'Jawabannya: 21 kubus.' : 'The answer is 21 cubes.',
      hold: 0,
      result: true,
    },
  ]
}
