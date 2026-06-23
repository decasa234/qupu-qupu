// SEAMO-17-B-Q24 — storyboard for the triangle-area-ratio animation.
//
// In △ABC: AD = (1/2)DB  →  AD:DB = 1:2, so D divides AB at 1/3 from A.
//          CE = (1/4)CB   →  E divides CB at 1/4 from C.
// Area △CDE = 9 cm².  Find area △ABC.
//
// Key insight: scale areas through two ratio steps.
//   Step 1 — △CDB and △ABC share the SAME height from C.
//             Area ratio = base ratio = DB/AB = 2/3.
//             Area(CDB) = (2/3) × Area(ABC).
//   Step 2 — △CDE and △CDB share the SAME height from D.
//             Area ratio = CE/CB = 1/4.
//             Area(CDE) = (1/4) × Area(CDB).
//   Combine: Area(CDE) = (1/4)(2/3) Area(ABC) = (1/6) Area(ABC) = 9.
//             Area(ABC) = 54 cm².
//
// Beats (one idea each):
//   0. intro   — show the figure; state the given values.
//   1. step1   — highlight CDB; show DB/AB = 2/3 ratio.
//   2. step2   — highlight CDE inside CDB; show CE/CB = 1/4 ratio.
//   3. combine — show the combined fraction: Area(CDE) = (1/6) Area(ABC).
//   4. result  — Area(ABC) = 9 × 6 = 54 cm².
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { HighlightRegion } from './TriangleArea17B24Illustration'

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'step1' | 'step2' | 'combine' | 'result'

export interface TriangleAreaBeat {
  phase: PhaseId
  highlight: HighlightRegion
  areaLabel: { region: HighlightRegion; text: string } | null
  unshade: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface TriangleAreaStoryboard {
  steps: TriangleAreaBeat[]
  finalIndex: number
}

export function buildTriangleArea17B24Steps(lang: Lang): TriangleAreaStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleAreaBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 'CDE',
      areaLabel: { region: 'CDE', text: '9 cm²' },
      unshade: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'In △ABC: D divides AB with AD:DB = 1:2 (D is 1/3 from A). E divides CB with CE:CB = 1/4. The shaded △CDE has area 9 cm². Find area △ABC.',
        'Dalam △ABC: D membagi AB dengan AD:DB = 1:2 (D berada 1/3 dari A). E membagi CB dengan CE:CB = 1/4. △CDE yang diarsir luasnya 9 cm². Temukan luas △ABC.',
      ),
    },

    // Beat 1 — highlight CDB and show DB/AB = 2/3
    {
      phase: 'step1',
      highlight: 'CDB',
      areaLabel: { region: 'CDB', text: '2/3 △ABC' },
      unshade: true,
      equation: t('DB/AB = 2/3', 'DB/AB = 2/3'),
      hold: 2600,
      result: false,
      caption: t(
        '△CDB and △ABC share the same height from C. Their areas are in the ratio of their bases: DB/AB = 2/3. So Area(CDB) = (2/3) × Area(ABC).',
        '△CDB dan △ABC memiliki tinggi yang sama dari C. Luas mereka sebanding dengan alasnya: DB/AB = 2/3. Jadi Luas(CDB) = (2/3) × Luas(ABC).',
      ),
    },

    // Beat 2 — highlight CDE inside CDB, CE/CB = 1/4
    {
      phase: 'step2',
      highlight: 'CDE',
      areaLabel: { region: 'CDE', text: '1/4 △CDB' },
      unshade: false,
      equation: t('CE/CB = 1/4', 'CE/CB = 1/4'),
      hold: 2600,
      result: false,
      caption: t(
        '△CDE and △CDB share the same height from D. Their areas are in the ratio CE/CB = 1/4. So Area(CDE) = (1/4) × Area(CDB).',
        '△CDE dan △CDB memiliki tinggi yang sama dari D. Luas mereka sebanding CE/CB = 1/4. Jadi Luas(CDE) = (1/4) × Luas(CDB).',
      ),
    },

    // Beat 3 — combine the two ratios
    {
      phase: 'combine',
      highlight: 'ABC',
      areaLabel: { region: 'CDE', text: '9 cm²' },
      unshade: false,
      equation: t('(1/4) × (2/3) = 1/6', '(1/4) × (2/3) = 1/6'),
      hold: 2600,
      result: false,
      caption: t(
        'Combining: Area(CDE) = (1/4) × (2/3) × Area(ABC) = (1/6) × Area(ABC). Since Area(CDE) = 9, we get Area(ABC) = 9 × 6.',
        'Menggabungkan: Luas(CDE) = (1/4) × (2/3) × Luas(ABC) = (1/6) × Luas(ABC). Karena Luas(CDE) = 9, maka Luas(ABC) = 9 × 6.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: 'ABC',
      areaLabel: { region: 'ABC', text: '54 cm²' },
      unshade: false,
      equation: t('9 × 6 = 54 cm²', '9 × 6 = 54 cm²'),
      hold: 0,
      result: true,
      caption: t(
        'Area △ABC = 9 × 6 = 54 cm².',
        'Luas △ABC = 9 × 6 = 54 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
