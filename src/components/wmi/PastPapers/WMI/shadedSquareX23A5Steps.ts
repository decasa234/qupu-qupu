// SEAMO-X 2023 Paper A Q5 — nested-squares shaded area steps.
// Outer 12×12 cm. Diamond (rotated 45°) inscribed at midpoints → area 72.
// Shaded inner square inscribed in diamond at midpoints → area 36.
// Each nesting halves the area: 144 → 72 → 36.
//
// Beat 0 — intro: full figure, no emphasis
// Beat 1 — outer: highlight outer square, show 12×12=144
// Beat 2 — diamond: highlight diamond, ½×144=72
// Beat 3 — shaded: highlight inner square, ½×72=36
// Beat 4 — result: answer confirmed

export type Lang = 'en' | 'id'

// Bound to seed quantities
export const OUTER_SIDE = 12
export const ANSWER = 36

export type ShadedSquareX23A5Phase = 'intro' | 'outer' | 'diamond' | 'shaded' | 'result'

export interface ShadedSquareX23A5Step {
  phase: ShadedSquareX23A5Phase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface ShadedSquareX23A5Storyboard {
  answer: number
  steps: ShadedSquareX23A5Step[]
  finalIndex: number
}

export function buildShadedSquareX23A5Steps(lang: Lang): ShadedSquareX23A5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShadedSquareX23A5Step[] = [
    {
      phase: 'intro',
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'Find the area of the shaded square inside the diamond, which sits inside a 12 cm × 12 cm outer square.',
        'Temukan luas persegi diarsir di dalam belah ketupat, yang berada di dalam persegi luar 12 cm × 12 cm.',
      ),
    },
    {
      phase: 'outer',
      equation: t('Outer area = 12 × 12 = 144 cm²', 'Luas luar = 12 × 12 = 144 cm²'),
      hold: 2200,
      result: false,
      caption: t(
        'The outer square has side 12 cm. Its area = 12 × 12 = 144 cm².',
        'Persegi luar memiliki sisi 12 cm. Luasnya = 12 × 12 = 144 cm².',
      ),
    },
    {
      phase: 'diamond',
      equation: t('Diamond area = ½ × 144 = 72 cm²', 'Luas belah ketupat = ½ × 144 = 72 cm²'),
      hold: 2600,
      result: false,
      caption: t(
        'The diamond's vertices are at the midpoints of the outer square's sides. Its area is half the outer area: ½ × 144 = 72 cm².',
        'Titik sudut belah ketupat berada di titik tengah sisi persegi luar. Luasnya setengah luas luar: ½ × 144 = 72 cm².',
      ),
    },
    {
      phase: 'shaded',
      equation: t('Shaded area = ½ × 72 = 36 cm²', 'Luas diarsir = ½ × 72 = 36 cm²'),
      hold: 2600,
      result: false,
      caption: t(
        'The shaded square's vertices are at the midpoints of the diamond's sides. Its area is half the diamond: ½ × 72 = 36 cm².',
        'Titik sudut persegi diarsir berada di titik tengah sisi belah ketupat. Luasnya setengah belah ketupat: ½ × 72 = 36 cm².',
      ),
    },
    {
      phase: 'result',
      equation: t('Shaded area = 36 cm² ✓', 'Luas diarsir = 36 cm² ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Each nesting halves the area: 144 → 72 → 36. The shaded region is 36 cm².',
        'Setiap lapisan membagi luas menjadi setengah: 144 → 72 → 36. Daerah yang diarsir adalah 36 cm².',
      ),
    },
  ]

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
