// SEAMO-17-A-Q18 — storyboard for the handkerchief / flower-count animation.
//
// The question: 5 flowers embroidered on each side of a square handkerchief,
// with a flower on each corner. How many flowers in total?
//
// Strategy: Multiply then subtract (4 × 5 = 20 overcounts corners by 4 → 20 − 4 = 16).
//
// Animation beats:
//   0. intro    — show handkerchief with all 16 flowers; state the two facts.
//   1. count-all — highlight 4 × 5 = 20 (as if corners counted twice).
//   2. corners  — spotlight the 4 corners; show the overcount.
//   3. subtract — 20 − 4 = 16.
//   4. result   — 16 flowers → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type HandkerchiefPhaseId = 'intro' | 'count-all' | 'corners' | 'subtract' | 'result'

export interface HandkerchiefBeat {
  /** Which animation phase this beat belongs to. */
  phase: HandkerchiefPhaseId
  /**
   * Which flowers to highlight:
   *   'all'     — show all 16 flowers (default / idle)
   *   'corners' — only the 4 amber corner flowers glow
   *   'inner'   — only the 12 inner flowers glow
   */
  flowerMode: 'all' | 'corners' | 'inner'
  /** Show a red "×2" badge on the corner flowers to indicate the overcount. */
  showDoubleCount: boolean
  /** Show the green "−4" subtraction overlay. */
  showSubtract: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface HandkerchiefStoryboard {
  steps: HandkerchiefBeat[]
  finalIndex: number
}

export function buildHandkerchief17A18Steps(lang: Lang): HandkerchiefStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HandkerchiefBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      flowerMode: 'all',
      showDoubleCount: false,
      showSubtract: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        '5 flowers on each side of the handkerchief. A flower at every corner.',
        '5 bunga di setiap sisi sapu tangan. Satu bunga di setiap sudut.',
      ),
    },

    // Beat 1 — count all as 4 × 5
    {
      phase: 'count-all',
      flowerMode: 'all',
      showDoubleCount: false,
      showSubtract: false,
      equation: '4 × 5 = 20',
      hold: 2200,
      result: false,
      caption: t(
        '4 sides × 5 flowers = 20 — but wait, the corner flowers are on two sides each!',
        '4 sisi × 5 bunga = 20 — tapi bunga sudut berada di dua sisi sekaligus!',
      ),
    },

    // Beat 2 — spotlight corners (overcount)
    {
      phase: 'corners',
      flowerMode: 'corners',
      showDoubleCount: true,
      showSubtract: false,
      equation: '4 × 5 = 20',
      hold: 2200,
      result: false,
      caption: t(
        'Each of the 4 corner flowers was counted twice — subtract the 4 extras.',
        'Setiap dari 4 bunga sudut dihitung dua kali — kurangi 4 yang lebih.',
      ),
    },

    // Beat 3 — subtract
    {
      phase: 'subtract',
      flowerMode: 'all',
      showDoubleCount: false,
      showSubtract: true,
      equation: '20 − 4 = 16',
      hold: 2200,
      result: false,
      caption: t(
        '20 − 4 = 16 unique flowers.',
        '20 − 4 = 16 bunga unik.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      flowerMode: 'all',
      showDoubleCount: false,
      showSubtract: true,
      equation: '16 → C',
      hold: 0,
      result: true,
      caption: t(
        '16 flowers embroidered in total — answer C.',
        'Total 16 bunga yang disulam — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
