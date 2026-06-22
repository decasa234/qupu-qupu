// IKMC-19-EC-Q3 — storyboard for the layered-shapes explainer.
//
// Question: Sus puts 3 cubes on the table, 2 cylinders on top, then 1 cube
// on top of the cylinders. Which figure (A–E) matches?  Answer: A.
//
// Teaching walk:
//   0. intro    — Read layer by layer: bottom, middle, top.
//   1. layer1   — Bottom = exactly 3 cubes.
//   2. layer2   — Middle = exactly 2 cylinders.
//   3. layer3   — Top = exactly 1 cube.
//   4. checkA   — Only A has: 3 cubes → 2 cylinders → 1 cube. Answer A!
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Figures3ECPhase =
  | 'intro'
  | 'layer1'
  | 'layer2'
  | 'layer3'
  | 'result'

export interface Figures3ECBeat {
  phase: Figures3ECPhase
  /** Which option label to highlight (A–E), or null for all-dim. */
  highlight: string | null
  /** Caption text */
  caption: string
  /** Equation/tally chip text; '' to hide */
  equation: string
  /** Auto-hold in ms (0 = final / manual) */
  hold: number
  /** True only on the result beat */
  result: boolean
}

export interface Figures3ECStoryboard {
  steps: Figures3ECBeat[]
  finalIndex: number
}

export function buildFigures3ECSteps(lang: Lang): Figures3ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Figures3ECBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: null,
      equation: '3 + 2 + 1',
      hold: 2200,
      result: false,
      caption: t(
        'Read the description layer by layer: bottom, middle, then top.',
        'Baca deskripsi lapis per lapis: bawah, tengah, lalu atas.',
      ),
    },

    // Beat 1 — bottom layer
    {
      phase: 'layer1',
      highlight: null,
      equation: t('bottom = 3 cubes', 'bawah = 3 kubus'),
      hold: 2400,
      result: false,
      caption: t(
        'Bottom layer: exactly 3 cubes placed side by side on the table.',
        'Lapisan bawah: tepat 3 kubus diletakkan berdampingan di atas meja.',
      ),
    },

    // Beat 2 — middle layer
    {
      phase: 'layer2',
      highlight: null,
      equation: t('middle = 2 cylinders', 'tengah = 2 silinder'),
      hold: 2400,
      result: false,
      caption: t(
        'Middle layer: exactly 2 cylinders placed on top of the 3 cubes.',
        'Lapisan tengah: tepat 2 silinder diletakkan di atas 3 kubus.',
      ),
    },

    // Beat 3 — top layer
    {
      phase: 'layer3',
      highlight: null,
      equation: t('top = 1 cube', 'atas = 1 kubus'),
      hold: 2400,
      result: false,
      caption: t(
        'Top layer: exactly 1 cube placed on top of the 2 cylinders.',
        'Lapisan atas: tepat 1 kubus diletakkan di atas 2 silinder.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlight: 'A',
      equation: t('3 cubes → 2 cyl → 1 cube = A', '3 kubus → 2 sil → 1 kubus = A'),
      hold: 0,
      result: true,
      caption: t(
        'Only figure A shows 3 cubes at the bottom, 2 cylinders in the middle, and 1 cube on top — answer A.',
        'Hanya gambar A yang menunjukkan 3 kubus di bawah, 2 silinder di tengah, dan 1 kubus di atas — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
