import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CAKE_TOTAL, CHEESE_TOTAL, COOKIE_TOTAL, type Dessert } from './P22G2Q7Illustration'

export type Q7Phase = 'show' | 'cookies' | 'cakes' | 'cheese' | 'chart' | 'result'

export interface Q7Step {
  phase: Q7Phase
  /** Which kind to spotlight on the tray (null = show everything / show chart). */
  highlight: Dessert | null
  /** Whether to show the bar chart instead of the tray. */
  showChart: boolean
  /** Bar heights so far on the chart [cookies, cakes, cheese]. */
  bars: [number, number, number]
  /** Which bar to outline as just-placed (or null). */
  activeBar: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q7Storyboard {
  cookies: number
  cakes: number
  cheese: number
  answer: string
  steps: Q7Step[]
  finalIndex: number
}

export function buildP22G2Q7Steps(lang: Lang): Q7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const C = COOKIE_TOTAL
  const K = CAKE_TOTAL
  const H = CHEESE_TOTAL

  const steps: Q7Step[] = [
    {
      phase: 'show',
      highlight: null,
      showChart: false,
      bars: [0, 0, 0],
      activeBar: null,
      hold: 1700,
      result: false,
      caption: t(
        'Count one kind at a time. Ignore the donuts — they are not in the chart.',
        'Hitung satu jenis dulu. Abaikan donat — donat tidak ada di diagram.',
      ),
    },
    {
      phase: 'cookies',
      highlight: 'cookie',
      showChart: false,
      bars: [0, 0, 0],
      activeBar: null,
      hold: 2100,
      result: false,
      caption: t(
        `Sandwich cookies only: 4 in the top row, 2 in the middle, 2 in the bottom → ${C}.`,
        `Hanya biskuit isi: 4 di baris atas, 2 di tengah, 2 di bawah → ${C}.`,
      ),
    },
    {
      phase: 'cakes',
      highlight: 'cake',
      showChart: false,
      bars: [C, 0, 0],
      activeBar: null,
      hold: 2100,
      result: false,
      caption: t(
        `Strawberry cakes only: 1 + 3 + 3 → ${K}.`,
        `Hanya kue stroberi: 1 + 3 + 3 → ${K}.`,
      ),
    },
    {
      phase: 'cheese',
      highlight: 'cheese',
      showChart: false,
      bars: [C, K, 0],
      activeBar: null,
      hold: 2100,
      result: false,
      caption: t(
        `Cheese wedges only: 2 + 2 + 2 → ${H}.`,
        `Hanya irisan keju: 2 + 2 + 2 → ${H}.`,
      ),
    },
    {
      phase: 'chart',
      highlight: null,
      showChart: true,
      bars: [C, K, H],
      activeBar: 2,
      hold: 2000,
      result: false,
      caption: t(
        `So the bars are green ${C}, pink ${K}, blue ${H}.`,
        `Jadi batangnya hijau ${C}, merah muda ${K}, biru ${H}.`,
      ),
    },
    {
      phase: 'result',
      highlight: null,
      showChart: true,
      bars: [C, K, H],
      activeBar: null,
      hold: 0,
      result: true,
      caption: t(
        `Only chart B has 🍪${C}, 🍰${K}, 🧀${H} — answer B.`,
        `Hanya diagram B yang 🍪${C}, 🍰${K}, 🧀${H} — jawaban B.`,
      ),
    },
  ]

  return { cookies: C, cakes: K, cheese: H, answer: 'B', steps, finalIndex: steps.length - 1 }
}
