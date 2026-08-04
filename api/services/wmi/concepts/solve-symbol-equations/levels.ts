// Level ladder for solve-symbol-equations. Same param schema ({s, c, n, slip,
// totalKind}); difficulty climbs on the share-out step — first HOW MANY stars the
// first total must be split between (halving < thirds < quarters), then how big
// that total is, and finally how big the circle you subtract out at the end is.
//   L1: 2 stars, star worth 2–5  — halve a total of at most 10
//   L2: 2 stars, star worth 6–9  — halve a total of up to 18
//   L3: 3 stars, star worth 2–6  — share three ways
//   L4: 3 stars, star worth 7–9  — share three ways, total in the twenties
//   L5: 4 stars, star worth 5–9  — share four ways, and the circle is 7–12
// The schema on its own admits params whose four options collapse (c === s, or
// c === n·s), leaving a multiple-choice question with two identical answers; every
// level here re-checks the concept's own `optionValues` for four distinct,
// non-negative options and aims the correct one evenly across A–D.
import type { Rng } from '../types.js'
import { LABELS, answerLabel, optionValues, type Params } from './index.js'

type Spec = { n: 2 | 3 | 4; s: [number, number]; c: [number, number]; fallback: Params }

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { n: 2, s: [2, 5], c: [2, 7], fallback: { s: 2, c: 7, n: 2, slip: -1, totalKind: 'second' } },
  2: { n: 2, s: [6, 9], c: [3, 9], fallback: { s: 6, c: 9, n: 2, slip: -1, totalKind: 'second' } },
  3: { n: 3, s: [2, 6], c: [4, 10], fallback: { s: 2, c: 10, n: 3, slip: -1, totalKind: 'second' } },
  4: { n: 3, s: [7, 9], c: [5, 11], fallback: { s: 7, c: 11, n: 3, slip: -1, totalKind: 'second' } },
  5: { n: 4, s: [5, 9], c: [7, 12], fallback: { s: 5, c: 12, n: 4, slip: -1, totalKind: 'second' } },
}

// Four distinct, non-negative options, and no number quoted before the last beat
// of the explainer coincides with the answer.
function usable(p: Params): boolean {
  const vals = optionValues(p)
  return (
    new Set(vals).size === 4 &&
    vals.every((v) => v >= 0) &&
    p.c !== p.s &&
    p.c !== p.n &&
    p.c !== p.n * p.s
  )
}

export function solveSymbolEquationsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  const target = rng.pick(LABELS) // aim at a slot so the answer is not always C/D
  let fallback: Params | null = null

  for (let attempt = 0; attempt < 80; attempt++) {
    const s = rng.int(spec.s[0], spec.s[1])
    const c = rng.int(spec.c[0], spec.c[1])
    const recipes: Params[] = []
    for (const slip of [-1, 1] as const) {
      for (const totalKind of ['first', 'second'] as const) {
        const candidate: Params = { s, c, n: spec.n, slip, totalKind }
        if (usable(candidate)) recipes.push(candidate)
      }
    }
    if (recipes.length === 0) continue
    if (fallback === null) fallback = recipes[0]
    const onTarget = recipes.filter((r) => answerLabel(r) === target)
    if (onTarget.length > 0) return rng.pick(onTarget)
  }
  return fallback ?? spec.fallback
}
