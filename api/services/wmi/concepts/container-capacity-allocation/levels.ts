// Level ladder for container-capacity-allocation. Same param schema
// ({total, capacity}); every rung re-proves the two invariants generate() proves,
// so the four options stay distinct and the leftover stays a real leftover.
// Difficulty climbs on the division itself:
//   L1: capacity 5 or 10, small stock — a ×10 / ×5 table fact
//   L2: capacity 3, 4 or 6 — many boxes, but still a memorised fact
//   L3: two-digit capacity (8, 12, 15, 20) and a stock past 100
//   L4: capacity 7, 9, 11 or 13 — a divisor nobody has memorised
//   L5: biggest stock, capacity 14–19, AND the last box comes out nearly full,
//       which is exactly when dropping the leftover feels right
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/**
 * The two rules generate() enforces: a genuine leftover (an exact fit teaches
 * nothing), and a leftover that cannot collide with the answer or either
 * off-by-one, so `distractors` never has to fall back to a spare option.
 */
function usable(total: number, capacity: number): boolean {
  const remainder = total % capacity
  if (remainder === 0) return false
  const answer = Math.ceil(total / capacity)
  return remainder < answer - 1 || remainder > answer + 1
}

function draw(
  rng: Rng,
  caps: readonly number[],
  lo: number,
  hi: number,
  fallback: Params,
  extra?: (total: number, capacity: number) => boolean,
): Params {
  for (let tries = 0; tries < 400; tries++) {
    const capacity = rng.pick(caps)
    const total = rng.int(lo, hi)
    if (!usable(total, capacity)) continue
    if (extra && !extra(total, capacity)) continue
    return { total, capacity }
  }
  return fallback
}

export function containerCapacityAllocationLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return draw(rng, [5, 10], 20, 60, { total: 53, capacity: 5 })
    case 2:
      return draw(rng, [3, 4, 6], 30, 90, { total: 85, capacity: 3 })
    case 3:
      return draw(rng, [8, 12, 15, 20], 60, 140, { total: 100, capacity: 8 })
    case 4:
      return draw(rng, [7, 9, 11, 13], 90, 170, { total: 100, capacity: 7 })
    case 5:
      // Leftover within 3 of a full box: the "it basically fits" trap.
      return draw(rng, [14, 16, 17, 18, 19], 130, 200, { total: 151, capacity: 17 }, (t, c) => t % c >= c - 3)
  }
}
