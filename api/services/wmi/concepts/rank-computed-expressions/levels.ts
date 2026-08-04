// Level ladder for rank-computed-expressions. Three dials: which operations the
// four options may use (× costs the most work), how big the values get, and how
// close the top two values sit — a near-tie means you cannot stop at a glance,
// every option has to be computed exactly.
// Difficulty proxy: 4 × (multiplications) + max value / 4 + max(0, 8 − gap between top two).
// The invariant render() relies on — one strictly largest value — is preserved:
// every rung resamples until all four values are DISTINCT.
//   L1: four additions, small numbers, winner clear by ≥ 4
//   L2: additions and subtractions mixed
//   L3: all three operations may appear, numbers to 30
//   L4: at least two multiplications with a table fact ≥ 4, winner clear by ≥ 3
//   L5: the same arithmetic, but the top two are within 2 — no shortcuts left
import type { Rng } from '../types.js'
import { evalExpr, type Expr, type Params } from './index.js'

type Op = '+' | '-' | '×'

function oneExpr(rng: Rng, ops: readonly Op[], aHi: number, bLo: number, bHi: number): Expr {
  const op = rng.pick(ops)
  if (op === '-') {
    const b = rng.int(bLo, Math.min(bHi, 12))
    return { a: rng.int(b + 1, Math.max(b + 1, aHi)), op, b }
  }
  if (op === '×') {
    return { a: rng.int(bLo, Math.min(12, aHi)), op, b: rng.int(bLo, Math.min(12, bHi)) }
  }
  return { a: rng.int(1, aHi), op, b: rng.int(bLo, Math.min(12, bHi)) }
}

function build(
  rng: Rng,
  ops: readonly Op[],
  aHi: number,
  bLo: number,
  bHi: number,
  minMul: number,
  gapLo: number,
  gapHi: number,
  minTop = 0,
): Params {
  let fallback: Params | null = null
  for (let attempt = 0; attempt < 1500; attempt++) {
    const exprs = [
      oneExpr(rng, ops, aHi, bLo, bHi),
      oneExpr(rng, ops, aHi, bLo, bHi),
      oneExpr(rng, ops, aHi, bLo, bHi),
      oneExpr(rng, ops, aHi, bLo, bHi),
    ]
    const values = exprs.map(evalExpr)
    if (new Set(values).size !== 4) continue // one strictly largest value
    fallback ??= { exprs }
    if (exprs.filter((e) => e.op === '×').length < minMul) continue
    const sorted = [...values].sort((x, y) => y - x)
    const gap = sorted[0] - sorted[1]
    if (gap < gapLo || gap > gapHi) continue
    if (sorted[0] < minTop) continue // keep the near-tie rung from drifting small
    return { exprs }
  }
  // Never returns a duplicate-value set: the fallback already passed that check.
  return fallback ?? { exprs: [
    { a: 3, op: '+', b: 1 },
    { a: 5, op: '+', b: 2 },
    { a: 9, op: '+', b: 3 },
    { a: 12, op: '+', b: 4 },
  ] }
}

export function rankComputedExpressionsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return build(rng, ['+'], 10, 1, 9, 0, 4, 99)
    case 2:
      return build(rng, ['+', '-'], 20, 1, 12, 0, 3, 99)
    case 3:
      return build(rng, ['+', '-', '×'], 30, 1, 12, 1, 2, 99)
    case 4:
      return build(rng, ['+', '-', '×'], 30, 4, 12, 2, 3, 99)
    case 5:
      // …and the winner still has to be a big product, so the near-tie is not
      // bought by shrinking the numbers.
      return build(rng, ['+', '-', '×'], 30, 4, 12, 2, 1, 2, 50)
  }
}
