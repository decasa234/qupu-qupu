import type { Lang } from './makeTenSteps'

export interface ChainStep {
  op: '+' | '-'
  n: number
}
export interface ChainParams {
  start: number
  steps: ChainStep[]
}

export interface ChainEvalBeat {
  /** Index of the step being applied (-1 on the start beat). */
  active: number
  /** Running total after applying steps[0..active]. */
  total: number
  caption: string
  result: boolean
}

export interface ChainEvalStoryboard {
  start: number
  chain: ChainStep[]
  answer: number
  beats: ChainEvalBeat[]
  finalIndex: number
}

// Evaluates an add/subtract chain left to right, one step at a time, keeping the
// running total at each beat (no number line — a plain worked computation).
export function buildChainEvalSteps(p: ChainParams, lang: Lang): ChainEvalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  // Defensive: the proofreading page can momentarily pass stale params.
  const start = typeof p?.start === 'number' ? p.start : 0
  const chain = Array.isArray(p?.steps) ? p.steps : []

  const totals: number[] = [start]
  for (const s of chain) {
    const prev = totals[totals.length - 1]
    totals.push(s.op === '+' ? prev + s.n : prev - s.n)
  }
  const answer = totals[totals.length - 1]

  const beats: ChainEvalBeat[] = [
    {
      active: -1,
      total: start,
      caption: t(
        `Start at ${start}. Work left to right, one step at a time.`,
        `Mulai dari ${start}. Kerjakan dari kiri ke kanan, satu langkah demi satu.`,
      ),
      result: false,
    },
  ]
  chain.forEach((s, i) => {
    const prev = totals[i]
    const cur = totals[i + 1]
    const sym = s.op === '+' ? '+' : '−'
    beats.push({
      active: i,
      total: cur,
      caption: `${prev} ${sym} ${s.n} = ${cur}`,
      result: i === chain.length - 1,
    })
  })

  return { start, chain, answer, beats, finalIndex: beats.length - 1 }
}
