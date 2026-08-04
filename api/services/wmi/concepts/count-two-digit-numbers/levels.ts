// Level ladder for count-two-digit-numbers. Same param schema; difficulty climbs
// by how far the rule reaches and how many operations the ask needs:
//   1 plain run inside one decade → 1 digit rule over the whole 10–99 board →
//   a digit-sum rule (answers scattered across every decade) → two rules crossed
//   → two rules PLUS a second operation (largest − smallest).
// Every level is built to land a qualifying set of 3–20 numbers, the same
// listable-by-hand window the concept's own generate() enforces.
import type { Rng } from '../types.js'
import type { Constraint, Params } from './index.js'

/**
 * A tens band crossed with a ones band, sized so the qualifying set is
 * `decades × ones` numbers (4–16). This is the classic WMI two-rule shape.
 */
function bandPair(rng: Rng): Constraint[] {
  const decades = rng.int(2, 4)
  const ones = rng.int(2, 4)
  const tens: Constraint =
    rng.int(0, 1) === 0
      ? { kind: 'tens', cmp: 'gt', v: 9 - decades } // decades 9−v … 9
      : { kind: 'tens', cmp: 'lt', v: decades + 1 } // decades 1 … v−1
  const units: Constraint =
    rng.int(0, 1) === 0
      ? { kind: 'units', cmp: 'gt', v: 9 - ones } // 9−v ones values
      : { kind: 'units', cmp: 'lt', v: ones } // v ones values
  return [tens, units]
}

export function countTwoDigitNumbersLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: one short run inside a single decade — just count the fenceposts.
    case 1: {
      const lo = rng.int(1, 9) * 10 + rng.int(0, 4)
      return { constraints: [{ kind: 'between', lo, hi: lo + rng.int(2, 5) }], ask: 'how-many' }
    }
    // L2: one digit rule over the whole 10–99 board — every decade must be checked.
    case 2: {
      const roll = rng.int(0, 5)
      const c: Constraint =
        roll === 0
          ? { kind: 'tens', cmp: 'eq', v: rng.int(1, 9) }
          : roll === 1
            ? { kind: 'units', cmp: 'eq', v: rng.int(0, 9) }
            : roll === 2
              ? { kind: 'tens', cmp: 'lt', v: 2 }
              : roll === 3
                ? { kind: 'tens', cmp: 'gt', v: 8 }
                : roll === 4
                  ? { kind: 'units', cmp: 'lt', v: 1 }
                  : { kind: 'units', cmp: 'gt', v: 8 }
      return { constraints: [c], ask: 'how-many' }
    }
    // L3: a digit-sum rule — the answers sit one per decade, and "0k" tempts.
    case 3:
      return { constraints: [{ kind: 'digit-sum', v: rng.int(3, 16) }], ask: 'how-many' }
    // L4: two rules at once — a tens band crossed with a ones band.
    case 4:
      return { constraints: bandPair(rng), ask: 'how-many' }
    // L5: the same two rules, plus a second operation on the set you found.
    case 5:
      return { constraints: bandPair(rng), ask: 'largest-minus-smallest' }
  }
}
