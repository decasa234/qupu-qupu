// OSN-20-SD-KAB-Q9 — step storyboard for the polygon-area animation.
//
// Problem: ABCDEF with FE ∥ CD, right angles at F and E.
//   Given: FE=9, FA=25, AB=15, BC=13, area=366 cm². Find CD.
//
// Solution walk:
//   0. intro       — static figure, all labels visible.
//   1. pythagorean — derive height of B: √(15²−9²)=12, so EB=25−12=13.
//   2. trapezoid   — highlight trapezoid FABE, area=(25+13)/2×9=171 cm².
//   3. remainder   — right part area = 366−171 = 195 cm².
//   4. solve-cd    — coordinate step: xD × 25 + 57 = 2 × 366 → CD = 13 cm.
//   5. result      — CD = 13 cm ✓
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'pythagorean' | 'trapezoid' | 'remainder' | 'solve-cd' | 'result'

export interface PolyBeat {
  phase: PhaseId
  /** Show the dashed EB construction line. */
  showEB: boolean
  /** Highlight the left trapezoid FABE (light orange fill). */
  showTrapezoid: boolean
  /** Highlight the right quadrilateral BCDE (light green fill). */
  showRemainder: boolean
  /** Show the green CD answer label. */
  showAnswer: boolean
  /** Equation displayed below the figure. */
  equation: string
  /** Caption in the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = last beat / manual only). */
  hold: number
  /** True only on the final beat. */
  result: boolean
}

export interface PolyStoryboard {
  steps: PolyBeat[]
  finalIndex: number
}

export function buildPolygonAreaOSN20KQ9Steps(lang: Lang): PolyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PolyBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showEB: false,
      showTrapezoid: false,
      showRemainder: false,
      showAnswer: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Hexagon ABCDEF: FE ∥ CD, right angles at F and E. Known sides: FE=9, FA=25, AB=15, BC=13. Area = 366 cm². Find CD.',
        'Segi enam ABCDEF: FE ∥ CD, sudut siku-siku di F dan E. Sisi diketahui: FE=9, FA=25, AB=15, BC=13. Luas = 366 cm². Cari CD.',
      ),
    },

    // Beat 1 — Pythagorean to find EB
    {
      phase: 'pythagorean',
      showEB: true,
      showTrapezoid: false,
      showRemainder: false,
      showAnswer: false,
      equation: 'EB = FA − √(AB² − FE²) = 25 − √(225−81) = 25 − 12 = 13',
      hold: 2400,
      result: false,
      caption: t(
        'Draw dashed EB (perpendicular from E). Horizontal A→B = FE = 9. By Pythagoras: height of B = √(15²−9²) = 12 cm. So EB = 25−12 = 13 cm.',
        'Tarik garis putus-putus EB (tegak lurus dari E). Jarak horizontal A→B = FE = 9. Teorema Pythagoras: tinggi B = √(15²−9²) = 12 cm. Maka EB = 25−12 = 13 cm.',
      ),
    },

    // Beat 2 — trapezoid FABE area
    {
      phase: 'trapezoid',
      showEB: true,
      showTrapezoid: true,
      showRemainder: false,
      showAnswer: false,
      equation: 'Luas FABE = (FA + EB) / 2 × FE = (25+13)/2 × 9 = 19 × 9 = 171 cm²',
      hold: 2400,
      result: false,
      caption: t(
        'Left piece FABE is a trapezoid with parallel vertical sides FA=25 and EB=13, and width FE=9. Area = (25+13)/2 × 9 = 171 cm².',
        'Bagian kiri FABE adalah trapesium dengan sisi vertikal sejajar FA=25 dan EB=13, lebar FE=9. Luas = (25+13)/2 × 9 = 171 cm².',
      ),
    },

    // Beat 3 — remainder area
    {
      phase: 'remainder',
      showEB: true,
      showTrapezoid: false,
      showRemainder: true,
      showAnswer: false,
      equation: 'Luas BCDE = 366 − 171 = 195 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'The right piece BCDE must account for the rest: 366 − 171 = 195 cm².',
        'Bagian kanan BCDE sisanya: 366 − 171 = 195 cm².',
      ),
    },

    // Beat 4 — solve for CD
    {
      phase: 'solve-cd',
      showEB: true,
      showTrapezoid: false,
      showRemainder: true,
      showAnswer: false,
      equation: '25 × xD + 57 = 2 × 366 → xD = 27 → CD = 27 − 14 = 13',
      hold: 2600,
      result: false,
      caption: t(
        'Using the Shoelace formula for ABCDEF: 2×Area = 25×xD + 57. So 25×xD = 732−57 = 675 → xD = 27. AC = 14 cm (from coordinates), so CD = 27−14 = 13 cm.',
        'Menggunakan rumus Shoelace untuk ABCDEF: 2×Luas = 25×xD + 57. Jadi 25×xD = 732−57 = 675 → xD = 27. AC = 14 cm (dari koordinat), sehingga CD = 27−14 = 13 cm.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      showEB: true,
      showTrapezoid: false,
      showRemainder: false,
      showAnswer: true,
      equation: 'CD = 13 cm',
      hold: 0,
      result: true,
      caption: t(
        'CD = 13 cm ✓',
        'CD = 13 cm ✓',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
