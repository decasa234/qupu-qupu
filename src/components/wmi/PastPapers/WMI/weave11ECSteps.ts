// IKMC-19-EC-Q11 — storyboard for the woven-strips animation.
//
// The question: Six strips (3 cyan vertical + 3 yellow horizontal) are woven
// into a 3×3 alternating pattern. What does the pattern look like from the back?
// → Answer C (opposite checkerboard).
//
// From the front:
//   V, H, V      (cyan, yellow, cyan on top — TL, TM, TR)
//   H, V, H      (ML, MM, MR)
//   V, H, V      (BL, BM, BR)
//
// When flipped to the back:
//   (1) Left↔right mirror: columns reverse (but a symmetric 3-col pattern stays
//       visually symmetric in column layout).
//   (2) Over/under swap at every crossing: every V → H, every H → V.
//
// Back result:
//   H, V, H      (yellow, cyan, yellow on top — TL, TM, TR)
//   V, H, V      (ML, MM, MR)
//   H, V, H      (BL, BM, BR)
// → matches option C.
//
// Teaching walk:
//   0. intro  — show front (stem), label "cyan on top at corners and centre."
//   1. mirror — show mirrored view (columns swap); caption: "Flip to back: left ↔ right."
//   2. swap   — show back result (crossings inverted); caption: "Over/under also swaps."
//   3. result — green highlight; caption: "Answer C matches the back view."
//
// Pure builder — no Math.random, no Date, SSR-safe.

import type { CrossingMatrix9 } from './Weave11ECIllustration'

export type Lang = 'en' | 'id'

export type WeavePhase = 'intro' | 'mirror' | 'swap' | 'result'

export interface WeaveBeat11EC {
  phase: WeavePhase
  /**
   * 9-element crossing matrix [TL, TM, TR, ML, MM, MR, BL, BM, BR].
   * true = cyan (vertical) on top.
   */
  crossings: CrossingMatrix9
  /** Mirror the panel horizontally (simulate the left↔right flip). */
  mirrored: boolean
  /** True on the result beat — triggers green highlight. */
  result: boolean
  /** Equation chip text; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
}

export interface WeaveStoryboard11EC {
  steps: WeaveBeat11EC[]
  finalIndex: number
}

// Crossing matrices
const FRONT: CrossingMatrix9 = [
  true,  false, true,
  false, true,  false,
  true,  false, true,
]

const BACK: CrossingMatrix9 = [
  false, true,  false,
  true,  false, true,
  false, true,  false,
]

export function buildWeave11ECSteps(lang: Lang): WeaveStoryboard11EC {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: WeaveBeat11EC[] = [
    // Beat 0 — intro: show front view
    {
      phase: 'intro',
      crossings: FRONT,
      mirrored: false,
      result: false,
      equation: '',
      hold: 2400,
      caption: t(
        'Front view: cyan vertical strips are on top at the corners and centre; yellow strips on top at the edges.',
        'Tampak depan: strip cyan vertikal berada di atas di sudut dan pusat; strip kuning di atas di tepi.',
      ),
    },

    // Beat 1 — mirror: flip left↔right
    {
      phase: 'mirror',
      crossings: FRONT,
      mirrored: true,
      result: false,
      equation: t('flip: left ↔ right', 'balik: kiri ↔ kanan'),
      hold: 2200,
      caption: t(
        'Flip to the back: left and right swap sides.',
        'Balik ke belakang: kiri dan kanan bertukar posisi.',
      ),
    },

    // Beat 2 — swap: over/under inverts at every crossing
    {
      phase: 'swap',
      crossings: BACK,
      mirrored: true,
      result: false,
      equation: t('over ↔ under', 'atas ↔ bawah'),
      hold: 2200,
      caption: t(
        'Over/under also swaps at every crossing: yellow strips are now on top at the corners and centre.',
        'Atas/bawah juga bertukar di setiap persilangan: strip kuning kini berada di atas di sudut dan pusat.',
      ),
    },

    // Beat 3 — result: highlight option C
    {
      phase: 'result',
      crossings: BACK,
      mirrored: true,
      result: true,
      equation: t('Answer: C', 'Jawaban: C'),
      hold: 0,
      caption: t(
        'This matches option C — the opposite checkerboard pattern.',
        'Ini sesuai pilihan C — pola papan catur yang berlawanan.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
