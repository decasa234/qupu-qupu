// Beat storyboard for IKMC-22-EC-Q8 (John's block tower — top view).
//
// Strategy: mentally "flatten" the tower from above, layer by layer from
// bottom to top.  At each beat we highlight the layer being projected
// downward and narrate what its footprint contributes to the top view.
// The final beat shows the correct answer: option C (3 nested squares).
//
// Layers (matching BlockTower8ECIllustration.tsx IsoTower):
//   0 — base slab  (outermost square in the top view)
//   1 — medium slab (middle ring)
//   2 — three bricks (same width as medium slab → hidden by it; its footprint
//         is the same rectangle as layer 1 from above; its visual effect is nil)
//   3 — top brick  (innermost tiny square)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface TowerStep {
  /** Which tower layer to highlight (passed to IsoTower.highlightLayer). undefined = all normal */
  highlightLayer?: number
  caption: string
  hold: number
  result: boolean
}

export interface TowerStoryboard {
  steps: TowerStep[]
  finalIndex: number
  answer: string
}

export function buildBlockTower8ECSteps(lang: Lang): TowerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TowerStep[] = [
    {
      highlightLayer: undefined,
      hold: 1600,
      result: false,
      caption: t(
        "John's tower has 4 layers. Imagine looking straight down from above — what shapes do you see?",
        'Menara John memiliki 4 lapisan. Bayangkan melihat tepat dari atas — bentuk apa yang terlihat?',
      ),
    },
    {
      highlightLayer: 0,
      hold: 2000,
      result: false,
      caption: t(
        'The BASE slab is the widest — from above it is the outermost (biggest) square.',
        'ALAS menara adalah yang paling lebar — dari atas tampak sebagai persegi terluar (terbesar).',
      ),
    },
    {
      highlightLayer: 1,
      hold: 2000,
      result: false,
      caption: t(
        'The MEDIUM slab sits centred on the base. From above it makes a smaller square inside.',
        'LEMPENGAN TENGAH terletak di tengah alas. Dari atas membentuk persegi lebih kecil di dalam.',
      ),
    },
    {
      highlightLayer: 2,
      hold: 1800,
      result: false,
      caption: t(
        'The THREE BRICKS span the same width as the medium slab — from above they are hidden behind it.',
        'TIGA BATU BATA selebar lempengan tengah — dari atas tersembunyi di baliknya.',
      ),
    },
    {
      highlightLayer: 3,
      hold: 2000,
      result: false,
      caption: t(
        'The TOP BRICK is the smallest — from above it appears as a tiny square in the centre.',
        'BATU BATA PUNCAK paling kecil — dari atas tampak sebagai persegi kecil di tengah.',
      ),
    },
    {
      highlightLayer: undefined,
      hold: 0,
      result: true,
      caption: t(
        'Top view: 3 nested squares — biggest (base), medium, tiny (top brick). That is choice C.',
        'Tampak atas: 3 persegi bertingkat — terbesar (alas), sedang, kecil (batu bata puncak). Itu pilihan C.',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: 'C',
  }
}
