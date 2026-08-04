// Level ladder for alternating-chain-eval. Three dials the schema really has:
// how many steps the chain is (2–4), how big each term is, and how many of the
// steps are subtractions (a running total that goes down is harder to hold).
// Every partial total is kept ≥ 0, exactly as the concept's own generate does.
// Difficulty proxy: 10 × steps + mean term + 3 × subtractions.
//   L1: 2 steps, single-digit, both additions
//   L2: 2 steps, single-digit, at least one subtraction (direction changes)
//   L3: 3 steps, terms to 15 — the chain gets longer
//   L4: 4 steps, terms to 25 — longest chain, two-digit terms
//   L5: 4 steps, terms 10–40, at least two subtractions — most borrowing, biggest swings
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Step = { op: '+' | '-'; n: number }

/** Build a chain of `count` steps with terms in [lo, hi], never letting the running total go below 0. */
function chain(rng: Rng, start: number, count: number, lo: number, hi: number, minMinus: number): Step[] {
  const steps: Step[] = []
  let running = start
  for (let i = 0; i < count; i++) {
    const stillNeeded = minMinus - steps.filter((s) => s.op === '-').length
    const mustMinus = stillNeeded >= count - i
    let op: '+' | '-' = mustMinus ? '-' : rng.pick(['+', '-'] as const)
    if (op === '-' && running < lo) op = '+' // not enough left to subtract a legal term
    if (op === '-') {
      const n = rng.int(lo, Math.min(hi, running))
      running -= n
      steps.push({ op, n })
    } else {
      const n = rng.int(lo, hi)
      running += n
      steps.push({ op, n })
    }
  }
  return steps
}

export function alternatingChainEvalLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const start = rng.int(10, 20)
      return { start, steps: [{ op: '+', n: rng.int(2, 9) }, { op: '+', n: rng.int(2, 9) }] }
    }
    case 2: {
      const start = rng.int(15, 30)
      return { start, steps: chain(rng, start, 2, 2, 9, 1) }
    }
    case 3: {
      const start = rng.int(20, 50)
      return { start, steps: chain(rng, start, 3, 2, 15, 1) }
    }
    case 4: {
      const start = rng.int(25, 55)
      return { start, steps: chain(rng, start, 4, 2, 25, 1) }
    }
    case 5: {
      const start = rng.int(45, 75)
      return { start, steps: chain(rng, start, 4, 10, 40, 2) }
    }
  }
}
