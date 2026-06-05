export type Lang = 'en' | 'id'

export interface ChainStep {
  op: '+' | '-'
  n: number
}
export interface WalkParams {
  start: number
  steps: ChainStep[]
}

export interface WalkBeat {
  /** Marker position along the track, 0..1. */
  frac: number
  /** Running total at this beat. */
  total: number
  /** The hop just taken, e.g. "+12" / "−7"; null on the start beat. */
  hop: string | null
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface WalkStoryboard {
  start: number
  min: number
  max: number
  answer: number
  steps: WalkBeat[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

// Walks the running total along a number line: + hops right, − hops left. The
// track is scaled to the visited range so the marker always stays in view.
export function buildWalkSteps(p: WalkParams, lang: Lang): WalkStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const positions: number[] = [p.start]
  for (const s of p.steps) {
    const prev = positions[positions.length - 1]
    positions.push(s.op === '+' ? prev + s.n : prev - s.n)
  }
  const min = Math.min(...positions)
  const max = Math.max(...positions)
  const span = max - min || 1
  const frac = (v: number) => (v - min) / span

  const steps: WalkBeat[] = [
    {
      frac: frac(p.start), total: p.start, hop: null,
      caption: t(`start at ${p.start}`, `mulai di ${p.start}`),
      hold: 1300, result: false,
    },
  ]
  p.steps.forEach((s, i) => {
    const prev = positions[i]
    const cur = positions[i + 1]
    const sym = s.op === '+' ? '+' : '−'
    const last = i === p.steps.length - 1
    steps.push({
      frac: frac(cur), total: cur, hop: `${sym}${s.n}`,
      caption: `${prev} ${sym} ${s.n} = ${cur}`,
      hold: last ? 0 : 1500, result: last,
    })
  })

  return { start: p.start, min, max, answer: positions[positions.length - 1], steps, finalIndex: steps.length - 1 }
}
