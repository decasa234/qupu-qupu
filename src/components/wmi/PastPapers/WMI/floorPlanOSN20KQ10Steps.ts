// OSN 2020 SD Kabupaten Q10 — explainer storyboard.
// Figure: house floor plans — LT 1 = 4.5 m × 8 m = 36 m² (given); LT 2 = 4.5 m × 6 m = 27 m².
// Answer: 36 × (6/8) = 36 × ¾ = 27 m².

import type { FloorPlanPhase } from './FloorPlanOSN20KQ10Illustration'

export interface FloorPlanStep {
  phase: FloorPlanPhase
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '27 m²'
export const ANSWER_EN = '27 m²'

export function buildFloorPlanOSN20KQ10Steps(lang: 'en' | 'id'): FloorPlanStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      phase: 'problem',
      hold: 2200,
      result: false,
      caption: t(
        'Two floor plans are shown. Floor 1 = 36 m² (given). Both floors have the same width (4.5 m) — compare their heights.',
        'Dua denah ditunjukkan. Lantai 1 = 36 m² (diketahui). Kedua lantai memiliki lebar sama (4,5 m) — bandingkan tingginya.',
      ),
    },
    {
      phase: 'ratio',
      hold: 2600,
      result: false,
      caption: t(
        'Step 1 — Find the ratio. Height LT 1 = 8 m, height LT 2 = 6 m. Ratio = 6 ÷ 8 = ¾. So Floor 2 is ¾ of Floor 1.',
        'Langkah 1 — Cari rasio. Tinggi LT 1 = 8 m, tinggi LT 2 = 6 m. Rasio = 6 ÷ 8 = ¾. Jadi luas lantai 2 = ¾ × lantai 1.',
      ),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Floor 2 area = 36 × ¾ = 27 m².',
        'Luas lantai 2 = 36 × ¾ = 27 m².',
      ),
    },
  ]
}
