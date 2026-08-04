// Level ladder for truth-order-clues. The five names are fixed by the schema and
// carry no difficulty, so the only honest lever is HOW SCRAMBLED the four clues
// are — measured by `linked`, the number of neighbouring clues that already join
// end-to-end (3 = the whole chain is readable straight off the page, 0 = every
// clue has to be hunted for).
//   L1: linked 3 — the chain shown backwards; read it bottom-up and you are done
//   L2: linked 2 — two clues still join; one jump to find
//   L3: linked 1 — only one pair joins
//   L4: linked 0 — no two neighbouring clues join; head clue sits in the top half
//   L5: linked 0 — same, but the clue naming the winner sits in the bottom half
// The name order comes from the concept's own `generate`, so it is always a legal
// permutation of the five names.
import type { Rng } from '../types.js'
import { generate, type Params } from './index.js'

function permutations(items: number[]): number[][] {
  if (items.length <= 1) return [items]
  const out: number[][] = []
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) out.push([items[i], ...tail])
  }
  return out
}

const ALL = permutations([0, 1, 2, 3])

// How many neighbouring clue slots hold consecutive links of the chain.
function linked(p: number[]): number {
  let n = 0
  for (let i = 0; i < p.length - 1; i++) if (Math.abs(p[i + 1] - p[i]) === 1) n += 1
  return n
}

// Never show the clues already in chain order — that gives the answer away.
function pool(pred: (p: number[]) => boolean): number[][] {
  return ALL.filter((p) => p.join(',') !== '0,1,2,3' && pred(p))
}

const POOLS: Record<1 | 2 | 3 | 4 | 5, number[][]> = {
  1: pool((p) => linked(p) === 3),
  2: pool((p) => linked(p) === 2),
  3: pool((p) => linked(p) === 1),
  4: pool((p) => linked(p) === 0 && p.indexOf(0) <= 1),
  5: pool((p) => linked(p) === 0 && p.indexOf(0) >= 2),
}

export function truthOrderCluesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const { order } = generate(rng)
  return { order, clueOrder: rng.pick(POOLS[level]) }
}
