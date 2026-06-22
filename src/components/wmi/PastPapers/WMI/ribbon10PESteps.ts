// IKMC-21-PE-Q10 — storyboard for the folded-ribbon cut animation.
//
// Question: "Edmund cut a ribbon as shown in the picture. How many pieces?"
// The ribbon is folded into 6 serpentine rows. A single vertical cut goes
// through all 6 layers. Answer: D = 12.
//
// Teaching walk, one idea per beat:
//   0. intro      — show the static ribbon + cut line; state the setup.
//   1. count-rows — highlight all 6 rows; one vertical cut crosses all 6 layers.
//   2. per-row    — one cut through ONE layer → 2 pieces. So 6 layers → 6 × 2.
//   3. compute    — 6 × 2 = 12.
//   4. result     — 12 pieces → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type RibbonPhase = 'intro' | 'count-rows' | 'per-row' | 'compute' | 'result'

export interface RibbonBeat {
  phase: RibbonPhase
  /** Rows to highlight in the diagram (0-indexed). Empty = all normal. */
  highlightRows: number[]
  /** Show the cut dashed line. */
  showCut: boolean
  /** Show scissors glyph. */
  showScissors: boolean
  /** Equation string displayed below figure; '' to hide. */
  equation: string
  /** Caption text for the explanation card. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface RibbonStoryboard {
  answer: number
  answerLabel: string
  steps: RibbonBeat[]
  finalIndex: number
}

export function buildRibbon10PESteps(lang: Lang): RibbonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ALL_ROWS = [0, 1, 2, 3, 4, 5]

  const steps: RibbonBeat[] = [
    // Beat 0 — intro: show the ribbon as-is
    {
      phase: 'intro',
      highlightRows: [],
      showCut: true,
      showScissors: true,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Edmund folded a ribbon into a snake shape and made ONE straight cut. How many pieces does he get?',
        'Edmund melipat pita menjadi bentuk ular dan membuat SATU potongan lurus. Berapa banyak potongan yang didapat?',
      ),
    },

    // Beat 1 — count layers: the cut crosses 6 rows
    {
      phase: 'count-rows',
      highlightRows: ALL_ROWS,
      showCut: true,
      showScissors: true,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The ribbon is folded into 6 horizontal layers. The single cut passes through ALL 6 layers at once.',
        'Pita dilipat menjadi 6 lapisan horisontal. Satu potongan menembus semua 6 lapisan sekaligus.',
      ),
    },

    // Beat 2 — one cut through one layer makes 2 pieces
    {
      phase: 'per-row',
      highlightRows: [2],   // focus on one middle row as example
      showCut: true,
      showScissors: false,
      equation: t('1 cut on 1 layer → 2 pieces', '1 potongan pada 1 lapisan → 2 bagian'),
      hold: 2400,
      result: false,
      caption: t(
        'One cut through a single layer of ribbon makes 2 pieces. So 6 layers give 6 × 2 pieces.',
        'Satu potongan pada satu lapisan pita menghasilkan 2 bagian. Jadi 6 lapisan menghasilkan 6 × 2 bagian.',
      ),
    },

    // Beat 3 — compute 6 × 2 = 12
    {
      phase: 'compute',
      highlightRows: ALL_ROWS,
      showCut: true,
      showScissors: false,
      equation: '6 × 2 = 12',
      hold: 2400,
      result: false,
      caption: t(
        '6 layers cut through → 6 × 2 = 12 separate pieces.',
        '6 lapisan dipotong → 6 × 2 = 12 potongan terpisah.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightRows: ALL_ROWS,
      showCut: true,
      showScissors: false,
      equation: '12 → D',
      hold: 0,
      result: true,
      caption: t(
        'Edmund finishes with 12 pieces — answer D.',
        'Edmund mendapatkan 12 potongan — jawaban D.',
      ),
    },
  ]

  return { answer: 12, answerLabel: 'D', steps, finalIndex: steps.length - 1 }
}
