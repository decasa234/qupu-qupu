// polyominoOSN24NEKQ5Steps.ts — storyboard for OSN-24-SD-NAS-EKSPERIMEN-Q5 explainer.
// "Dalam petak 4×5, hubungkan 10 petak satuan menjadi satu daerah poliomino
// yang terhubung. Berapa perimeter maksimum?" — answer: 22.
//
// METHOD (perimeter-maximisation, 5 beats):
//   Beat 0 (intro)    — problem setup: blank 4×5 grid.
//   Beat 1 (isolated) — 10 isolated cells: 10 × 4 = 40 total perimeter.
//   Beat 2 (tree)     — spanning tree: minimum 9 shared edges.
//   Beat 3 (edges)    — each shared edge costs 2: 9 × 2 = 18.
//   Beat 4 (result)   — 40 − 18 = 22.
//
// Pure builder: (lang) => storyboard. SSR-safe — no Math.random / no Date.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PerimeterPhase = 'intro' | 'isolated' | 'tree' | 'edges' | 'result'

export interface PerimeterBeat {
  phase: PerimeterPhase
  caption: string
  hold: number
}

export interface PerimeterStoryboard {
  steps: PerimeterBeat[]
  finalIndex: number
}

export function buildPolyominoOSN24NEKQ5Steps(lang: Lang): PerimeterStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PerimeterBeat[] = [
    {
      phase: 'intro',
      caption: t(
        'In a 4×5 grid, choose 10 unit squares forming one connected polyomino. What is the maximum perimeter?',
        'Dalam petak 4×5, pilih 10 petak satuan yang membentuk satu poliomino terhubung. Berapa keliling maksimumnya?',
      ),
      hold: 2400,
    },
    {
      phase: 'isolated',
      caption: t(
        'If the 10 cells were isolated, each has perimeter 4. Total = 10 × 4 = 40.',
        'Jika 10 sel terpisah, masing-masing berkeliling 4. Total = 10 × 4 = 40.',
      ),
      hold: 2400,
    },
    {
      phase: 'tree',
      caption: t(
        'To stay connected, 10 cells need at least 9 shared edges — a spanning tree (no cycles).',
        'Agar terhubung, 10 sel perlu minimal 9 sisi bersama — pohon rentang (tanpa siklus).',
      ),
      hold: 2400,
    },
    {
      phase: 'edges',
      caption: t(
        'Each shared edge removes 2 from the perimeter. Minimum: 9 × 2 = 18 lost.',
        'Setiap sisi bersama mengurangi keliling 2 unit. Minimum: 9 × 2 = 18 hilang.',
      ),
      hold: 2400,
    },
    {
      phase: 'result',
      caption: t(
        'Maximum perimeter = 40 − 18 = 22 ✓',
        'Keliling maksimum = 40 − 18 = 22 ✓',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
