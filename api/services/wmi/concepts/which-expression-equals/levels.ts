// Level ladder for which-expression-equals. Same param schema (target 3..40,
// exactly 4 options, each x ± y with operands 1..99). Difficulty climbs on
// three staged axes: the size of the operands the child must actually compute,
// whether subtraction (and so a two-digit minuend) is in play, and how close
// the three wrong options sit to the target:
//   L1: target 3–9, every option is a small addition, distractors ±1/±2
//   L2: target 8–15, subtraction appears (minuend ≤ 20)
//   L3: target 12–25, mixed + and −, minuend ≤ 34
//   L4: target 20–34, mixed, minuend ≤ 59, distractors ±1..±3
//   L5: target 26–40, EVERY option is a two-digit subtraction (minuend ≤ 90)
//       and all three distractors are ±1/±2 near-misses, so all four have to
//       be worked out exactly — no option can be ruled out by size
// Difficulty proxy: LARGEST OPERAND appearing among the four options.
//
// Exactly one option evaluates to the target by construction: the correct
// expression is built for `target`, and every distractor is built for a value
// that is recorded in `used` first, so no two options ever share a value.
import type { Rng } from '../types.js'
import type { Expr, Params } from './index.js'

type Style = 'add' | 'sub'

function makeExpr(rng: Rng, v: number, style: Style, yMin: number, yMax: number): Expr {
  if (style === 'add' && v >= 2) {
    const x = rng.int(1, v - 1)
    return { op: '+', x, y: v - x }
  }
  const y = rng.int(yMin, Math.max(yMin, Math.min(yMax, 99 - v)))
  return { op: '-', x: v + y, y }
}

function buildSet(
  rng: Rng,
  target: number,
  offsets: readonly number[],
  styleFor: () => Style,
  yMin: number,
  yMax: number,
): Params {
  const used = new Set<number>([target])
  const exprs: Expr[] = [makeExpr(rng, target, styleFor(), yMin, yMax)]
  for (const off of rng.shuffle(offsets)) {
    if (exprs.length === 4) break
    const v = target + off
    if (v < 2 || used.has(v)) continue
    used.add(v)
    exprs.push(makeExpr(rng, v, styleFor(), yMin, yMax))
  }
  // Safety net: widen the gap until four distinct option values exist.
  for (let off = 3; exprs.length < 4; off++) {
    const v = target + off
    if (used.has(v)) continue
    used.add(v)
    exprs.push(makeExpr(rng, v, styleFor(), yMin, yMax))
  }
  return { target, exprs: rng.shuffle(exprs) }
}

export function whichExpressionEqualsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const mixed = (): Style => (rng.int(0, 1) === 0 ? 'add' : 'sub')
  switch (level) {
    case 1: return buildSet(rng, rng.int(3, 9), [1, -1, 2, -2], () => 'add', 1, 5)
    case 2: return buildSet(rng, rng.int(8, 15), [1, -1, 2, -2, 3], mixed, 1, 5)
    case 3: return buildSet(rng, rng.int(12, 25), [1, -1, 2, -2, 3, -3], mixed, 3, 9)
    case 4: return buildSet(rng, rng.int(20, 34), [1, -1, 2, -2, 3, -3], mixed, 10, 25)
    case 5: return buildSet(rng, rng.int(26, 40), [1, -1, 2, -2], () => 'sub', 20, 50)
  }
}
