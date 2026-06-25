// OSN 2010 SD Kabupaten Q22 — explainer storyboard.
// Figure: square s = 4r = 40 cm; two semicircular notches on left/right (r = 10 cm).
// Answer: shaded area = s² − π r² = 1600 − 314 = 1286 cm².

import type { ConcavePhase } from './ConcaveSquareOSN10KQ22Illustration'

export interface ConcaveStep {
  phase: ConcavePhase
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '1.286 cm²'
export const ANSWER_EN = '1,286 cm²'

export function buildConcaveSquareOSN10KQ22Steps(lang: 'en' | 'id'): ConcaveStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      phase: 'problem',
      hold: 2200,
      result: false,
      caption: t(
        'A square (side s = 4r) has two semicircular notches cut into its left and right sides. Find the shaded area. (r = 10 cm, π = 3.14)',
        'Persegi dengan sisi s = 4r punya dua cekungan setengah lingkaran di sisi kiri dan kanan. Cari luas daerah yang diarsir. (r = 10 cm, π = 3,14)',
      ),
    },
    {
      phase: 'square',
      hold: 2400,
      result: false,
      caption: t(
        'Step 1 — Square area: s = 4r = 4 × 10 = 40 cm. Area = s² = 40 × 40 = 1,600 cm².',
        'Langkah 1 — Luas persegi: s = 4r = 4 × 10 = 40 cm. Luas = s² = 40 × 40 = 1.600 cm².',
      ),
    },
    {
      phase: 'circles',
      hold: 2400,
      result: false,
      caption: t(
        'Step 2 — Circle area: the two semicircles together equal one full circle (r = 10). Area = π r² = 3.14 × 100 = 314 cm².',
        'Langkah 2 — Luas lingkaran: dua setengah lingkaran = satu lingkaran penuh (r = 10). Luas = π r² = 3,14 × 100 = 314 cm².',
      ),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Shaded area = Square − Circles = 1,600 − 314 = 1,286 cm².',
        'Luas arsiran = Persegi − Lingkaran = 1.600 − 314 = 1.286 cm².',
      ),
    },
  ]
}
