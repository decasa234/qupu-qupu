import type { Lang } from '../concepts/explainers/makeTenSteps'
import { DAY_BARS, MON_FRI_TOTAL } from './P21G3Q9Illustration'

export type Q9Phase = 'show' | 'window' | 'add' | 'result'

export interface Q9Step {
  phase: Q9Phase
  highlightWindow: boolean
  /** Indices into DAY_BARS that are counted so far (chips shown). */
  countedIdx: number[]
  runningTotal: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q9Storyboard {
  answer: number
  steps: Q9Step[]
  finalIndex: number
}

// Mon..Fri indices in DAY_BARS order (Sun=0, Mon=1, ... Sat=6).
const WINDOW_IDX = DAY_BARS.map((d, i) => (d.inWindow ? i : -1)).filter((i) => i >= 0)

export function buildP21G3Q9Steps(lang: Lang): Q9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Build the cumulative-add beats: reveal one Mon..Fri bar at a time.
  const addSteps: Q9Step[] = []
  let running = 0
  WINDOW_IDX.forEach((idx, k) => {
    running += DAY_BARS[idx].hits
    const d = DAY_BARS[idx]
    const counted = WINDOW_IDX.slice(0, k + 1)
    addSteps.push({
      phase: 'add',
      highlightWindow: true,
      countedIdx: counted,
      runningTotal: running,
      hold: 1500,
      result: false,
      caption: t(
        `${d.day} = ${d.hits}. Running total: ${running}.`,
        `${d.day} = ${d.hits}. Total berjalan: ${running}.`,
      ),
    })
  })

  const steps: Q9Step[] = [
    {
      phase: 'show',
      highlightWindow: false,
      countedIdx: [],
      runningTotal: null,
      hold: 1700,
      result: false,
      caption: t(
        'Read each bar as a number of hits.',
        'Baca setiap batang sebagai banyaknya pukulan.',
      ),
    },
    {
      phase: 'window',
      highlightWindow: true,
      countedIdx: [],
      runningTotal: null,
      hold: 1800,
      result: false,
      caption: t(
        'Only Mon–Fri count. Ignore Sun & Sat.',
        'Hanya Sen–Jum yang dihitung. Abaikan Min & Sab.',
      ),
    },
    ...addSteps,
    {
      phase: 'result',
      highlightWindow: true,
      countedIdx: WINDOW_IDX,
      runningTotal: MON_FRI_TOTAL,
      hold: 0,
      result: true,
      caption: t(
        `1 + 4 + 2 + 0 + 1 = ${MON_FRI_TOTAL} hits — answer C.`,
        `1 + 4 + 2 + 0 + 1 = ${MON_FRI_TOTAL} pukulan — jawaban C.`,
      ),
    },
  ]

  return { answer: MON_FRI_TOTAL, steps, finalIndex: steps.length - 1 }
}
