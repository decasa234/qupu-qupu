// Level ladder for sort-count-by-attribute. Same param schema; three things
// climb together — how many objects are in the picture, how many kinds they have
// to be sorted into, and how much work the question asks for on top of counting:
//   L1: 3 kinds, small pile, already in rows, "how many X?"
//   L2: 3-4 kinds, mixed into a grid, "how many X?" / "how many kinds?"
//   L3: 3 kinds, bigger pile, scattered, "which is the most?" (count them all)
//   L4: 4 kinds, "most" or "how many more X than Y?"
//   L5: 4 kinds, biggest pile, and the difference is asked about the MIDDLE two
//       groups — the biggest and smallest piles are decoys
import type { Rng } from '../types.js'
import { CATEGORY_POOLS, MAX_TOTAL, type Params } from './index.js'

type Attribute = Params['attribute']

const ATTRS = ['shape', 'colour', 'fruit'] as const // every pool has >= 4 kinds

function catKeys(rng: Rng, attribute: Attribute, k: number): string[] {
  return rng.shuffle(CATEGORY_POOLS[attribute].map((c) => c.key)).slice(0, k)
}

/** k group sizes in [lo,hi], trimmed so the whole pile still fits MAX_TOTAL. */
function drawCounts(rng: Rng, k: number, lo: number, hi: number): number[] {
  const out = Array.from({ length: k }, () => rng.int(lo, hi))
  let total = out.reduce((a, b) => a + b, 0)
  while (total > MAX_TOTAL) {
    let big = 0
    out.forEach((v, i) => {
      if (v > out[big]) big = i
    })
    if (out[big] <= 3) break
    out[big] -= 1
    total -= 1
  }
  return out
}

/** Exactly one biggest group, so "which is the most?" has a single answer. */
function strictMax(rng: Rng, counts: number[]): number[] {
  const out = [...counts]
  const max = Math.max(...out)
  const tied = out.map((_, i) => i).filter((i) => out[i] === max)
  if (tied.length === 1) return out
  const keep = rng.pick(tied)
  const total = out.reduce((a, b) => a + b, 0)
  if (max < 12 && total < MAX_TOTAL) {
    out[keep] = max + 1
    return out
  }
  for (const i of tied) if (i !== keep) out[i] = Math.max(3, out[i] - 1)
  return out
}

/** Indices sorted biggest group first. */
function ranked(counts: number[]): number[] {
  return counts.map((_, i) => i).sort((i, j) => counts[j] - counts[i] || i - j)
}

export function sortCountByAttributeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const attribute = rng.pick(ATTRS)
  const seed = rng.int(0, 999)

  switch (level) {
    // L1 — the objects are already lined up in rows and only one group has to be
    // counted; nine to fifteen objects in total.
    case 1: {
      const counts = drawCounts(rng, 3, 3, 5)
      return {
        attribute,
        categories: catKeys(rng, attribute, 3),
        counts,
        layout: 'rows',
        ask: 'count-one',
        askIndices: [rng.int(0, 2)],
        seed,
      }
    }
    // L2 — the pile is jumbled into a grid, so the target group has to be picked
    // out first; "how many kinds?" joins in and a fourth kind can appear.
    case 2: {
      const ask = rng.pick(['count-one', 'how-many-kinds'] as const)
      const k = rng.int(3, 4)
      const counts = drawCounts(rng, k, 3, 6)
      return {
        attribute,
        categories: catKeys(rng, attribute, k),
        counts,
        layout: 'grid',
        ask,
        askIndices: ask === 'count-one' ? [rng.int(0, k - 1)] : [],
        seed,
      }
    }
    // L3 — "which is the most?" means every group must be counted, not just one,
    // and the groups are now 5-9 strong.
    case 3: {
      const counts = strictMax(rng, drawCounts(rng, 3, 5, 9))
      return {
        attribute,
        categories: catKeys(rng, attribute, 3),
        counts,
        layout: rng.pick(['grid', 'scatter'] as const),
        ask: 'most',
        askIndices: [],
        seed,
      }
    }
    // L4 — a fourth group to sort and count, plus subtraction on top of counting.
    case 4: {
      const counts = strictMax(rng, drawCounts(rng, 4, 4, 7))
      const ask = rng.pick(['most', 'difference'] as const)
      let askIndices: number[] = []
      if (ask === 'difference') {
        const pairs: number[][] = []
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) if (i !== j && counts[i] > counts[j]) pairs.push([i, j])
        }
        askIndices = rng.pick(pairs)
      }
      return {
        attribute,
        categories: catKeys(rng, attribute, 4),
        counts,
        layout: 'scatter',
        ask,
        askIndices,
        seed,
      }
    }
    // L5 — biggest pile, four scattered groups, and the two groups the question
    // names are the SECOND and THIRD biggest, only 1-2 apart. The eye-catching
    // biggest and smallest piles are not the answer.
    case 5: {
      const counts = drawCounts(rng, 4, 5, 8)
      const order = ranked(counts)
      const a = order[1]
      const b = order[2]
      counts[b] = Math.max(3, counts[a] - rng.int(1, 2))
      return {
        attribute,
        categories: catKeys(rng, attribute, 4),
        counts,
        layout: 'scatter',
        ask: 'difference',
        askIndices: [a, b],
        seed,
      }
    }
  }
}
