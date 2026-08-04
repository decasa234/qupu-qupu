// Level ladder for table-lookup-combine. Same param schema (apples 5..30,
// oranges 5..30, mode sum|diff). Difficulty climbs on three staged axes: the
// size of the two table values, which operation the question needs, and whether
// the child has to regroup (carry / borrow):
//   L1: sum of two single-digit values                     (5–9 + 5–9)
//   L2: difference, no borrow — introduces the extra "which row is bigger /
//       how many more" step, but the digits stay easy      (12–18 − 5–12)
//   L3: sum of two-digit values WITH a carry               (12–20 + 8–16)
//   L4: difference WITH a borrow                           (20–27 − 10–19)
//   L5: either operation, largest values the schema allows, always regrouping
//       — the child cannot pre-guess the operation         (24–30 ∘ 18–24)
// Difficulty proxy: SUM OF THE TWO TABLE VALUES (apples + oranges).
//
// oranges never exceeds apples, so a 'diff' question always has a positive
// whole answer (the invariant the concept's own generate keeps).
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const ones = (n: number) => n % 10

function draw(
  rng: Rng,
  aMin: number,
  aMax: number,
  oMin: number,
  oMax: number,
  ok: (apples: number, oranges: number) => boolean,
  fallback: [number, number],
): [number, number] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const apples = rng.int(aMin, aMax)
    const oranges = rng.int(oMin, oMax)
    if (oranges <= apples && ok(apples, oranges)) return [apples, oranges]
  }
  return fallback
}

export function tableLookupCombineLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const [apples, oranges] = draw(rng, 5, 9, 5, 9, () => true, [8, 6])
      return { apples, oranges, mode: 'sum' }
    }
    case 2: {
      // no borrow: the ones digit of the bigger row is not smaller
      const [apples, oranges] = draw(rng, 12, 18, 5, 12, (a, o) => ones(a) >= ones(o), [17, 5])
      return { apples, oranges, mode: 'diff' }
    }
    case 3: {
      // carry: the ones digits cross ten
      const [apples, oranges] = draw(rng, 12, 20, 8, 16, (a, o) => ones(a) + ones(o) >= 10, [17, 15])
      return { apples, oranges, mode: 'sum' }
    }
    case 4: {
      // borrow: the ones digit being taken away is the bigger one
      const [apples, oranges] = draw(rng, 20, 27, 10, 19, (a, o) => ones(a) < ones(o), [24, 18])
      return { apples, oranges, mode: 'diff' }
    }
    case 5: {
      const mode = rng.pick(['sum', 'diff'] as const)
      const needs = mode === 'sum'
        ? (a: number, o: number) => ones(a) + ones(o) >= 10
        : (a: number, o: number) => ones(a) < ones(o)
      const [apples, oranges] = draw(rng, 24, 30, 18, 24, needs, mode === 'sum' ? [26, 24] : [24, 18])
      return { apples, oranges, mode }
    }
  }
}
