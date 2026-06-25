// SEAMO-22-A-Q6 — Perimeter of 6-rectangle arrangements.
//
// Question: Four figures each made of 6 small rectangles.
// Which statement is TRUE about their perimeters?
// Answer C: Figure 1 has the largest perimeter.
//
// Teaching walk, one idea per beat:
//   0. intro     — show all four arrangements; state the problem.
//   1. principle — more linear = more outer edges exposed = larger perimeter.
//   2. fig1      — Figure 1 is a 1×6 row: most spread-out → highlight as largest.
//   3. fig4      — Figure 4 is a 6×1 col: same shape as Fig1 rotated → same perimeter.
//   4. compact   — Figure 2 & 3 are more compact blocks → smaller perimeters.
//   5. result    — Figure 1 has the largest perimeter → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type RectPerimPhase =
  | 'intro'
  | 'principle'
  | 'fig1'
  | 'fig4'
  | 'compact'
  | 'result'

export interface RectPerimBeat {
  phase: RectPerimPhase
  /** Which figure to highlight (1-based). 0 = none. */
  highlight: 0 | 1 | 2 | 3 | 4
  /** Show the "most linear" callout arrow on Figure 1. */
  showFig1Arrow: boolean
  /** Show equality note between Figure 1 and Figure 4. */
  showFig14Equal: boolean
  /** Equation / arithmetic line below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface RectPerimStoryboard {
  steps: RectPerimBeat[]
  finalIndex: number
}

export function buildRectPerim22A6Steps(lang: Lang): RectPerimStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectPerimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 0,
      showFig1Arrow: false,
      showFig14Equal: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Each figure is made of 6 small identical rectangles. Compare their perimeters.',
        'Setiap gambar terbuat dari 6 persegi panjang kecil yang identik. Bandingkan kelilingnya.',
      ),
    },

    // Beat 1 — principle
    {
      phase: 'principle',
      highlight: 0,
      showFig1Arrow: false,
      showFig14Equal: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Key idea: the more spread-out (linear) the arrangement, the more outer edges are exposed, so the larger the perimeter.',
        'Ide utama: semakin linear susunannya, semakin banyak tepi luar yang terekspos, sehingga keliling semakin besar.',
      ),
    },

    // Beat 2 — highlight Figure 1
    {
      phase: 'fig1',
      highlight: 1,
      showFig1Arrow: true,
      showFig14Equal: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Figure 1 is a single row of 6 — the most spread-out arrangement. It exposes the most outer edges.',
        'Gambar 1 adalah satu baris dari 6 — susunan paling linear. Paling banyak tepi luar yang terekspos.',
      ),
    },

    // Beat 3 — Figure 4 comparison
    {
      phase: 'fig4',
      highlight: 4,
      showFig1Arrow: false,
      showFig14Equal: true,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Figure 4 is a single column of 6 — the same linear shape rotated 90°. It has the same perimeter as Figure 1.',
        'Gambar 4 adalah satu kolom dari 6 — bentuk linear yang sama diputar 90°. Kelilingnya sama dengan Gambar 1.',
      ),
    },

    // Beat 4 — compact figures
    {
      phase: 'compact',
      highlight: 0,
      showFig1Arrow: false,
      showFig14Equal: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Figures 2 and 3 are compact blocks — more shared internal edges, fewer outer edges. Their perimeters are smaller.',
        'Gambar 2 dan 3 adalah blok kompak — lebih banyak tepi bersama, lebih sedikit tepi luar. Kelilingnya lebih kecil.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlight: 1,
      showFig1Arrow: true,
      showFig14Equal: false,
      equation: 'Figure 1 → largest perimeter → C',
      hold: 0,
      result: true,
      caption: t(
        'Figure 1 has the largest perimeter — answer C.',
        'Gambar 1 memiliki keliling terbesar — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
