// Storyboard builder for WMI-22F3A-Q17 — Product Triangle.
//
// Method: each side = product of its two end vertices.
// Top vertex is shared by the 104-side and 72-side.
//   GCF(104, 72) = 8  →  top = 8
//   bottom-left  = 104 ÷ 8 = 13
//   bottom-right =  72 ÷ 8 =  9
//   check:  13 × 9 = 117 ✓
//   sum:  8 + 13 + 9 = 30

export type Lang = 'en' | 'id'

/** Vertex state: null = empty circle, number = revealed. */
export interface VertexState {
  top: number | null
  bottomLeft: number | null
  bottomRight: number | null
}

export interface ProductTriangleStep {
  vertices: [number, number, number] | null
  /** Which sides to highlight (colour change). */
  highlight: 'none' | 'topLeft' | 'topRight' | 'bottom' | 'topBoth'
  caption: string
  hold: number
  result: boolean
}

export interface ProductTriangleStoryboard {
  steps: ProductTriangleStep[]
  finalIndex: number
  answer: number
}

const TOP = 8
const BOT_L = 13
const BOT_R = 9
const ANSWER = TOP + BOT_L + BOT_R // 30

export { TOP, BOT_L, BOT_R, ANSWER }

export function buildProductTriangleSteps(lang: Lang): ProductTriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ProductTriangleStep[] = [
    // Beat 0 — state the puzzle rule
    {
      vertices: null,
      highlight: 'none',
      hold: 1800,
      result: false,
      caption: t(
        'Each side number = the product of its two corner numbers. We must find all three corners.',
        'Setiap sisi = hasil kali dua sudutnya. Kita perlu menemukan ketiga sudut.',
      ),
    },

    // Beat 1 — the top vertex is shared by both 104 and 72
    {
      vertices: null,
      highlight: 'topBoth',
      hold: 2200,
      result: false,
      caption: t(
        '104 and 72 both share the TOP corner. Factor: 104 = 8 × 13, 72 = 8 × 9 — the common factor 8 is the top corner.',
        '104 dan 72 sama-sama berbagi sudut ATAS. Faktorkan: 104 = 8 × 13, 72 = 8 × 9 — faktor persekutuan 8 adalah sudut atas.',
      ),
    },

    // Beat 2 — reveal top = 8
    {
      vertices: [TOP, null, null],
      highlight: 'topBoth',
      hold: 1900,
      result: false,
      caption: t(
        'Top corner = 8. ✓',
        'Sudut atas = 8. ✓',
      ),
    },

    // Beat 3 — derive bottom-left from top-left side
    {
      vertices: [TOP, BOT_L, null],
      highlight: 'topLeft',
      hold: 2000,
      result: false,
      caption: t(
        'Upper-left side: 104 ÷ 8 = 13, so bottom-left corner = 13.',
        'Sisi kiri atas: 104 ÷ 8 = 13, jadi sudut kiri bawah = 13.',
      ),
    },

    // Beat 4 — derive bottom-right from top-right side
    {
      vertices: [TOP, BOT_L, BOT_R],
      highlight: 'topRight',
      hold: 2000,
      result: false,
      caption: t(
        'Upper-right side: 72 ÷ 8 = 9, so bottom-right corner = 9.',
        'Sisi kanan atas: 72 ÷ 8 = 9, jadi sudut kanan bawah = 9.',
      ),
    },

    // Beat 5 — verify bottom side
    {
      vertices: [TOP, BOT_L, BOT_R],
      highlight: 'bottom',
      hold: 2100,
      result: false,
      caption: t(
        'Check the bottom side: 13 × 9 = 117 ✓',
        'Periksa sisi bawah: 13 × 9 = 117 ✓',
      ),
    },

    // Beat 6 — final answer (hold 0 = winner)
    {
      vertices: [TOP, BOT_L, BOT_R],
      highlight: 'none',
      hold: 0,
      result: true,
      caption: t(
        `Sum of corners = 8 + 13 + 9 = ${ANSWER}.`,
        `Jumlah sudut = 8 + 13 + 9 = ${ANSWER}.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: ANSWER,
  }
}
