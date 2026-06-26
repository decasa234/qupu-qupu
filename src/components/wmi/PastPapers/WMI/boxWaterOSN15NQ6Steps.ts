// OSN-15-SD-NAS-Q6 — animation storyboard: box + water tipping problem.
// Phased beat sequence: intro → volume conservation → new base area → new height → result.
// Pure builder, SSR-safe, no random/Date.

export type Lang = 'en' | 'id'
export type BoxWaterPhase = 'intro' | 'volume' | 'base' | 'height' | 'result'

export interface BoxWaterBeat {
  phase: BoxWaterPhase
  /** Amber glow over water in the upright box. */
  highlightUprightWater: boolean
  /** Amber overlay on the lying box to show base area. */
  highlightLieBase: boolean
  /** Show the water fill (8 cm) in the lying box. */
  showLieWater: boolean
  /** Green accent on the revealed answer. */
  showResult: boolean
  equation: string
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface BoxWaterStoryboard {
  steps: BoxWaterBeat[]
  finalIndex: number
}

export function buildBoxWaterOSN15NQ6Steps(lang: Lang): BoxWaterStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxWaterBeat[] = [
    {
      phase: 'intro',
      highlightUprightWater: false,
      highlightLieBase: false,
      showLieWater: false,
      showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A 10×10×40 cm box holds water at 32 cm. Tip it on its side — what is the new water height?',
        'Wadah 10×10×40 cm berisi air setinggi 32 cm. Saat direbahkan, berapa ketinggian air sekarang?',
      ),
    },
    {
      phase: 'volume',
      highlightUprightWater: true,
      highlightLieBase: false,
      showLieWater: false,
      showResult: false,
      equation: '10 × 10 × 32 = 3.200 cm³',
      hold: 2400,
      result: false,
      caption: t(
        'Volume of water is conserved when the box tips: 10 × 10 × 32 = 3,200 cm³.',
        'Volume air tetap saat wadah direbahkan: 10 × 10 × 32 = 3.200 cm³.',
      ),
    },
    {
      phase: 'base',
      highlightUprightWater: false,
      highlightLieBase: true,
      showLieWater: false,
      showResult: false,
      equation: '10 × 40 = 400 cm²',
      hold: 2400,
      result: false,
      caption: t(
        'When on its side the new base is 10 cm × 40 cm = 400 cm².',
        'Saat direbahkan, luas alas baru adalah 10 cm × 40 cm = 400 cm².',
      ),
    },
    {
      phase: 'height',
      highlightUprightWater: false,
      highlightLieBase: false,
      showLieWater: true,
      showResult: false,
      equation: '3.200 ÷ 400 = 8 cm',
      hold: 2400,
      result: false,
      caption: t(
        'New height = Volume ÷ base area = 3,200 ÷ 400 = 8 cm.',
        'Tinggi baru = Volume ÷ luas alas = 3.200 ÷ 400 = 8 cm.',
      ),
    },
    {
      phase: 'result',
      highlightUprightWater: false,
      highlightLieBase: false,
      showLieWater: true,
      showResult: true,
      equation: '8 cm',
      hold: 0,
      result: true,
      caption: t(
        'The water height when the box is on its side is 8 cm.',
        'Ketinggian air saat wadah direbahkan adalah 8 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
