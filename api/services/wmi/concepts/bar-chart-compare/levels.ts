// Level ladder for bar-chart-compare. Same param schema (3 bars of height 1..9
// plus the two bars the question names). Two things climb: how tall the bars get,
// and whether the asked pair is still the obvious tallest-vs-shortest:
//   L1: heights ≤ 5, tallest − shortest, gap ≥ 3   L2: heights ≤ 7, same pair
//   L3: heights ≤ 9, same pair                     L4: tallest − MIDDLE bar
//   L5: middle − shortest, i.e. the tallest bar is on the chart but not in the
//       question, and the two bars asked about are close together
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const FRUITS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍐'] as const

/**
 * Lays three distinct heights on the chart in a random order and asks for
 * `rank[rankA] − rank[rankB]`, where rank 0 is the tallest bar and rank 2 the
 * shortest. Randomising the positions stops the answer bar from always sitting
 * in the same slot.
 */
function build(rng: Rng, heights: number[], rankA: number, rankB: number): Params {
  const desc = [...heights].sort((a, b) => b - a)
  const emojis = rng.shuffle(FRUITS).slice(0, 3)
  const slot = rng.shuffle([0, 1, 2]) // slot[rank] = position on the chart
  const items: Params['items'] = [
    { emoji: emojis[0], value: 1 },
    { emoji: emojis[1], value: 1 },
    { emoji: emojis[2], value: 1 },
  ]
  desc.forEach((value, rank) => {
    items[slot[rank]] = { emoji: emojis[rank], value }
  })
  return { items, iA: slot[rankA], iB: slot[rankB] }
}

export function barChartCompareLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — short bars and a wide gap: the tallest and the shortest jump out.
    case 1: {
      const low = rng.int(1, 2)
      const high = rng.int(low + 3, 5)
      const mid = rng.int(low + 1, high - 1)
      return build(rng, [high, mid, low], 0, 2)
    }
    // L2 — same question, bars up to 7.
    case 2: return build(rng, rng.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 3), 0, 2)
    // L3 — same question, the full height range: bigger numbers to subtract.
    case 3: return build(rng, rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), 0, 2)
    // L4 — the pair is no longer the two extremes: tallest minus the MIDDLE bar,
    // so "biggest take smallest" now gives the wrong answer.
    case 4: return build(rng, rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), 0, 1)
    // L5 — the tallest bar is not even in the question, and the two bars that are
    // sit 1 or 2 apart: the child must find the named bars, not the striking ones.
    case 5: {
      const low = rng.int(2, 4)
      const mid = low + rng.int(1, 2)
      const high = rng.int(mid + 2, 9)
      return build(rng, [high, mid, low], 1, 2)
    }
  }
}
