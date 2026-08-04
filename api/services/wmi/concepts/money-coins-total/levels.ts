// Level ladder for money-coins-total. Same param schema ({coins}); difficulty
// climbs by how many denominations are in the pocket, how many coins there are,
// and how many 1c pennies make the complement to 100 stop being a round number:
//   L1: 5c + 10c only, total a multiple of 5   L2: quarters join in
//   L3: one or two pennies appear              L4: more coins, 2-4 pennies
//   L5: 6-7 coins, all four denominations, 3+ pennies, total near a dollar
//
// Coins are emitted sorted high-to-low: render() groups by denomination, so
// order carries no information and sorting keeps distinct params == distinct
// questions. Every level keeps the total <= 95 so the answer stays positive.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Spec = {
  count: [number, number]
  denoms: readonly number[]
  pennies: [number, number]
  sum: [number, number]
  require?: readonly number[] // denominations that must appear at least once
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { count: [4, 7], denoms: [5, 10], pennies: [0, 0], sum: [20, 70] },
  2: { count: [4, 6], denoms: [5, 10, 25], pennies: [0, 0], sum: [30, 75] },
  3: { count: [4, 6], denoms: [5, 10, 25], pennies: [1, 2], sum: [26, 76] },
  4: { count: [5, 7], denoms: [5, 10, 25], pennies: [2, 4], sum: [45, 90], require: [25] },
  5: { count: [6, 7], denoms: [5, 10, 25], pennies: [3, 6], sum: [40, 95], require: [25] },
}

const FALLBACK: Record<1 | 2 | 3 | 4 | 5, number[]> = {
  1: [10, 10, 5, 5],
  2: [25, 10, 10, 5],
  3: [25, 10, 10, 5, 1],
  4: [25, 10, 10, 5, 1, 1],
  5: [25, 25, 10, 5, 1, 1, 1],
}

export function moneyCoinsTotalLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  for (let attempt = 0; attempt < 200; attempt++) {
    const pennies = rng.int(spec.pennies[0], spec.pennies[1])
    const count = rng.int(spec.count[0], spec.count[1])
    if (count - pennies < 2) continue
    const rest = Array.from({ length: count - pennies }, () => rng.pick(spec.denoms))
    if (spec.require && !spec.require.every((d) => rest.includes(d))) continue
    const coins = [...rest, ...Array.from({ length: pennies }, () => 1)]
    const sum = coins.reduce((s, v) => s + v, 0)
    if (sum < spec.sum[0] || sum > spec.sum[1]) continue
    return { coins: coins.sort((a, b) => b - a) }
  }
  return { coins: [...FALLBACK[level]] }
}
