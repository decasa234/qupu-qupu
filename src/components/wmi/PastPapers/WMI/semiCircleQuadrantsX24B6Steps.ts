import type { SquareArcSceneProps } from './SemiCircleQuadrantsX24B6Illustration'

type Lang = 'en' | 'id'

export interface SemiCircleQuadrantsX24B6Step {
  /** Scene prop overrides for this beat. */
  scene: SquareArcSceneProps
  /** Short equation/tally shown in the badge (empty string = hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** True on the final "answer confirmed" beat. */
  result: boolean
  /** Auto-advance hold duration in ms. */
  hold: number
}

export interface SemiCircleQuadrantsX24B6Story {
  steps: SemiCircleQuadrantsX24B6Step[]
  finalIndex: number
}

/**
 * Beat storyboard for SEAMOX-24-B-Q6.
 *
 * Logic (bound to seed breakdown.quantities):
 *   Square side = 50 cm → area = 2 500 cm²; right half = 1 250 cm²
 *   Semi-circle  r = 25  → area = π × 25² / 2 = 625π/2
 *   Two quadrants r = 25  → area = 2 × (π × 25² / 4) = 625π/2  ← same as semi-circle
 *   Outside quadrants     = 1 250 − 625π/2
 *   Total shaded          = 625π/2 + (1 250 − 625π/2) = 1 250 cm²
 */
export function buildSemiCircleQuadrantsX24B6Steps(lang: Lang): SemiCircleQuadrantsX24B6Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SemiCircleQuadrantsX24B6Step[] = [
    // Beat 0 — intro: show the square frame and arcs, no shading yet
    {
      scene: { shadeSemi: false, shadeMiddle: false, highlightQuadrants: false },
      equation: '',
      result: false,
      hold: 1800,
      caption: t(
        'A 50 cm square has a shaded semi-circle and another shaded region outside two quarter-circle arcs (quadrants).',
        'Persegi sisi 50 cm memiliki setengah lingkaran berarsir dan daerah berarsir lain di luar dua busur kuadran.',
      ),
    },

    // Beat 1 — shade the semi-circle and compute its area
    {
      scene: { shadeSemi: true, shadeMiddle: false, highlightQuadrants: false },
      equation: t('Semi-circle = 625π/2', 'Setengah lingkaran = 625π/2'),
      result: false,
      hold: 2200,
      caption: t(
        'The semi-circle has radius r = 25 cm. Area = π × 25² ÷ 2 = 625π/2 cm².',
        'Setengah lingkaran memiliki jari-jari r = 25 cm. Luas = π × 25² ÷ 2 = 625π/2 cm².',
      ),
    },

    // Beat 2 — highlight the two quadrant corner areas (equal area!)
    {
      scene: { shadeSemi: true, shadeMiddle: false, highlightQuadrants: true },
      equation: t('2 quadrants = 625π/2', '2 kuadran = 625π/2'),
      result: false,
      hold: 2400,
      caption: t(
        'Each quadrant (quarter-circle, r = 25) has area π×25²÷4. Two together = 2×(π×25²÷4) = 625π/2 — the same as the semi-circle!',
        'Setiap kuadran (seperempat lingkaran, r = 25) luasnya π×25²÷4. Dua bersama = 2×(π×25²÷4) = 625π/2 — sama dengan setengah lingkaran!',
      ),
    },

    // Beat 3 — shade the outside-quadrant middle strip
    {
      scene: { shadeSemi: true, shadeMiddle: true, highlightQuadrants: false },
      equation: t('Middle = 1250 − 625π/2', 'Tengah = 1250 − 625π/2'),
      result: false,
      hold: 2200,
      caption: t(
        'The right half has area 25 × 50 = 1 250 cm². Outside the two quadrants = 1 250 − 625π/2 cm².',
        'Sisi kanan memiliki luas 25 × 50 = 1 250 cm². Di luar dua kuadran = 1 250 − 625π/2 cm².',
      ),
    },

    // Beat 4 — final: π terms cancel, reveal 1 250 cm²
    {
      scene: { shadeSemi: true, shadeMiddle: true, highlightQuadrants: false },
      equation: t('Total = 1250 cm²', 'Total = 1250 cm²'),
      result: true,
      hold: 0,
      caption: t(
        'Total = 625π/2 + (1 250 − 625π/2) = 1 250 cm². The π terms cancel exactly — the shaded area is exactly half the square!',
        'Total = 625π/2 + (1 250 − 625π/2) = 1 250 cm². Suku π saling menghilangkan — luas berarsir tepat setengah persegi!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
