import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { HighlightGroup } from './CrownFanSASMO20G3Q18Illustration'

export interface CrownFanSASMO20G3Q18Step {
  highlightGroup: HighlightGroup
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CrownFanSASMO20G3Q18Storyboard {
  total: number
  steps: CrownFanSASMO20G3Q18Step[]
  finalIndex: number
}

const TOTAL = 30

// Breakdown: 1-part=7, 2-part=10, 3-part=6, 4-part=5, 6-part=2
export function buildCrownFanSASMO20G3Q18Steps(
  lang: Lang,
): CrownFanSASMO20G3Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CrownFanSASMO20G3Q18Step[] = [
    {
      highlightGroup: null,
      running: 0,
      hold: 1400,
      result: false,
      caption: t(
        'Count ALL triangles systematically — by size, small to large.',
        'Hitung SEMUA segitiga secara sistematis — dari ukuran kecil ke besar.',
      ),
    },
    {
      highlightGroup: 'small',
      running: 7,
      hold: 1800,
      result: false,
      caption: t(
        'Step 1 — Smallest (1-part) triangles: 7',
        'Langkah 1 — Segitiga terkecil (1 bagian): 7',
      ),
    },
    {
      highlightGroup: 'medium',
      running: 17,
      hold: 1800,
      result: false,
      caption: t(
        'Step 2 — 2-part composites: 10  →  7 + 10 = 17',
        'Langkah 2 — Gabungan 2 segitiga: 10  →  7 + 10 = 17',
      ),
    },
    {
      highlightGroup: 'large',
      running: 28,
      hold: 1800,
      result: false,
      caption: t(
        'Step 3 — 3-part (6) + 4-part (5): 11  →  17 + 11 = 28',
        'Langkah 3 — Gabungan 3 bagian (6) + 4 bagian (5): 11  →  17 + 11 = 28',
      ),
    },
    {
      highlightGroup: 'xlarge',
      running: 30,
      hold: 1800,
      result: false,
      caption: t(
        'Step 4 — Largest (6-part) triangles: 2  →  28 + 2 = 30',
        'Langkah 4 — Segitiga terbesar (6 bagian): 2  →  28 + 2 = 30',
      ),
    },
    {
      highlightGroup: null,
      running: TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `Total: 7 + 10 + 6 + 5 + 2 = ${TOTAL} triangles.`,
        `Total: 7 + 10 + 6 + 5 + 2 = ${TOTAL} segitiga.`,
      ),
    },
  ]

  return { total: TOTAL, steps, finalIndex: steps.length - 1 }
}
