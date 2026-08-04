// Level ladder for range-count-evaluate. Same param schema ({lo, hi, exprs});
// difficulty climbs on decision load = how many sums to work out, PLUS how many
// of their results sit within 2 of a range bound (those are the ones a child
// cannot eyeball — they have to compute and then compare carefully).
//   L1: 4 additions, small operands, wide range, every result clearly in or out
//   L2: 5 sums, additions and subtractions, still no borderline result
//   L3: 5 sums, one result lands exactly ON a bound — "inclusive" now matters
//   L4: 6 sums, one on a bound and one just outside it, tighter range
//   L5: 6 sums, three-digit-ish operands, a range only 5–10 wide, one on a bound
//       and two just outside, and at least one subtraction that needs a borrow
// The schema allows hi < lo and allows `x − y` with y > x (a negative result on a
// grade-3 sheet); every level here keeps hi > lo and every result ≥ 0.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Expr = { op: '+' | '-'; x: number; y: number }
const valueOf = (e: Expr): number => (e.op === '+' ? e.x + e.y : e.x - e.y)

type Spec = {
  count: number
  maxOperand: number
  minus: boolean
  loRange: [number, number]
  span: [number, number]
  onBound: number
  nearMiss: number
  needBorrow: boolean
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { count: 4, maxOperand: 20, minus: false, loRange: [12, 22], span: [14, 22], onBound: 0, nearMiss: 0, needBorrow: false },
  2: { count: 5, maxOperand: 40, minus: true, loRange: [18, 32], span: [12, 20], onBound: 0, nearMiss: 0, needBorrow: false },
  3: { count: 5, maxOperand: 60, minus: true, loRange: [22, 40], span: [10, 18], onBound: 1, nearMiss: 0, needBorrow: false },
  4: { count: 6, maxOperand: 90, minus: true, loRange: [25, 45], span: [8, 14], onBound: 1, nearMiss: 1, needBorrow: false },
  5: { count: 6, maxOperand: 99, minus: true, loRange: [30, 55], span: [5, 10], onBound: 1, nearMiss: 2, needBorrow: true },
}

// An expression with 1..99 operands, no negative result, evaluating to exactly v.
function exprFor(rng: Rng, v: number, allowMinus: boolean): Expr | null {
  const canPlus = v >= 2 && v <= 198
  const canMinus = allowMinus && v >= 1 && v <= 98
  if (canMinus && (!canPlus || rng.int(0, 1) === 1)) {
    const x = rng.int(v + 1, 99)
    return { op: '-', x, y: x - v }
  }
  if (!canPlus) return null
  const x = rng.int(Math.max(1, v - 99), Math.min(99, v - 1))
  return { op: '+', x, y: v - x }
}

function randomExpr(rng: Rng, maxOperand: number, allowMinus: boolean): Expr {
  if (allowMinus && rng.int(0, 1) === 1) {
    const x = rng.int(Math.min(20, maxOperand), maxOperand)
    return { op: '-', x, y: rng.int(1, x) }
  }
  return { op: '+', x: rng.int(3, maxOperand), y: rng.int(3, maxOperand) }
}

export function rangeCountEvaluateLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  let last: Params | null = null

  for (let attempt = 0; attempt < 400; attempt++) {
    const lo = rng.int(spec.loRange[0], spec.loRange[1])
    const hi = lo + rng.int(spec.span[0], spec.span[1])

    const exprs: Expr[] = []
    let broken = false
    for (let i = 0; i < spec.onBound; i++) {
      const e = exprFor(rng, rng.int(0, 1) === 0 ? lo : hi, spec.minus)
      if (!e) { broken = true; break }
      exprs.push(e)
    }
    for (let i = 0; i < spec.nearMiss && !broken; i++) {
      const target = rng.pick([lo - 1, lo - 2, hi + 1, hi + 2])
      const e = exprFor(rng, target, spec.minus)
      if (!e) { broken = true; break }
      exprs.push(e)
    }
    if (broken) continue
    while (exprs.length < spec.count) exprs.push(randomExpr(rng, spec.maxOperand, spec.minus))

    const shuffled = rng.shuffle(exprs)
    const params: Params = { lo, hi, exprs: shuffled }
    last = params

    const values = shuffled.map(valueOf)
    const inRange = values.filter((v) => v >= lo && v <= hi).length
    // Both a hit and a miss, so the count is never trivially 0 or "all of them".
    if (inRange < 1 || inRange >= spec.count) continue
    // The borderline count has to be EXACTLY what the level promises — a filler
    // that accidentally lands next to a bound would move the rung.
    const borderline = values.filter((v) => Math.abs(v - lo) <= 2 || Math.abs(v - hi) <= 2).length
    if (borderline !== spec.onBound + spec.nearMiss) continue
    if (spec.needBorrow && !shuffled.some((e) => e.op === '-' && e.x % 10 < e.y % 10)) continue

    return params
  }
  return last ?? { lo: 20, hi: 40, exprs: [
    { op: '+', x: 12, y: 15 }, { op: '+', x: 30, y: 25 },
    { op: '+', x: 8, y: 9 }, { op: '+', x: 20, y: 18 },
  ] }
}
