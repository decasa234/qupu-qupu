/**
 * SEAMOX-22-A-Q9 — Beat-by-beat storyboard for the bead-counting explainer.
 *
 * Highlights each figure panel in turn, accumulating a running total
 * that lands on 1 + 8 + 16 + 24 = 49.
 *
 * Phase legend:
 *  'show'   — initial display, no panel highlighted
 *  'count'  — highlighting one figure, running total accumulating
 *  'result' — final answer revealed
 */

export type BeadsX22A9Phase = 'show' | 'count' | 'result'

export interface BeadsX22A9Step {
  phase: BeadsX22A9Phase
  /** Index (0–3) of the highlighted figure panel; null = none. */
  figIndex: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface BeadsX22A9Storyboard {
  total: number
  steps: BeadsX22A9Step[]
  finalIndex: number
}

const COUNTS = [1, 8, 16, 24] as const
export const TOTAL_BEADS = 49

export function buildBeadsX22A9Steps(lang: 'en' | 'id'): BeadsX22A9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const labelsEn = ['Fig 1', 'Fig 2', 'Fig 3', 'Fig 4']
  const labelsId = ['Gambar 1', 'Gambar 2', 'Gambar 3', 'Gambar 4']

  const steps: BeadsX22A9Step[] = [
    {
      phase: 'show',
      figIndex: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count the beads in each figure, then add them all together!',
        'Hitung manik di setiap gambar, lalu jumlahkan semuanya!',
      ),
    },
  ]

  let running = 0
  for (let fi = 0; fi < 4; fi++) {
    const count = COUNTS[fi]
    const prev  = running
    running    += count
    const lbl   = lang === 'id' ? labelsId[fi] : labelsEn[fi]
    const bead  = lang === 'id' ? 'manik' : count === 1 ? 'bead' : 'beads'
    const expr  = prev === 0 ? `${count}` : `${prev} + ${count}`

    steps.push({
      phase: 'count',
      figIndex: fi,
      running,
      hold: 1300,
      result: false,
      caption: t(
        `${lbl}: ${count} ${bead}. Running total: ${expr} = ${running}.`,
        `${lbl}: ${count} ${bead}. Total sejauh ini: ${expr} = ${running}.`,
      ),
    })
  }

  steps.push({
    phase: 'result',
    figIndex: null,
    running: TOTAL_BEADS,
    hold: 0,
    result: true,
    caption: t(
      `1 + 8 + 16 + 24 = ${TOTAL_BEADS} beads in all!`,
      `1 + 8 + 16 + 24 = ${TOTAL_BEADS} manik seluruhnya!`,
    ),
  })

  return { total: TOTAL_BEADS, steps, finalIndex: steps.length - 1 }
}
