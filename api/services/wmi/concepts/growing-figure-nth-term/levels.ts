// Level ladder for growing-figure-nth-term. Same param schema. The load-bearing
// rule — no OTHER rule that reproduces the drawn pictures may give a different
// answer — is re-proved on every rung with the concept's own `solve().rivals`
// before the params are returned, and the schema checks it again.
//
// Difficulty climbs on two axes, the shape's growth and what the question asks:
//   L1: fixed-jump shape, count the picture just past the drawings
//   L2: fixed-jump shape, count a picture far out (20…60)
//   L3: fixed-jump shape, but run the rule BACKWARDS (which picture holds N?) or
//       across two undrawn pictures (how many more?)
//   L4: growing-jump shape (staircase / square / oblong) — the jumps themselves grow,
//       so "keep adding the last jump" stops working
//   L5: growing-jump shape AND the backwards / difference ask together
import type { Rng } from '../types.js'
import {
  MAX_COUNT,
  MAX_INDEX,
  SHAPES,
  SHAPE_KIND,
  countAt,
  solve,
  stemNumbers,
} from './index.js'
import type { Ask, Params, Shape } from './index.js'

const LINEAR = SHAPES.filter((s) => SHAPE_KIND[s] === 'linear')
const QUADRATIC = SHAPES.filter((s) => SHAPE_KIND[s] === 'quadratic')

/** The last picture of this shape that still fits inside MAX_COUNT squares. */
function maxIndex(shape: Shape, height: number): number {
  let n = 1
  while (n < MAX_INDEX && countAt(shape, height, n + 1) <= MAX_COUNT) n++
  return n
}

/**
 * The concept's own quality filter, restated here because it is module-private:
 * the answer must not be a number the stem already printed, the drawn pictures
 * must stay countable at a glance, and a difference worth walking must be ≥ 5.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (s.rivals.length > 0) return false
  if (stemNumbers(p, s.targetCount).has(s.answer)) return false
  if (s.shown[s.shown.length - 1] > 20) return false
  if (p.ask === 'difference-between-two' && Number(s.answer) < 5) return false
  return Number(s.answer) > 0
}

function draft(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params | null {
  const growing = level >= 4
  const shape = rng.pick(growing ? QUADRATIC : LINEAR)
  const height = shape === 'bar-rows' ? rng.int(2, 3) : 1
  // A pattern whose jumps are still growing needs a fourth picture before its
  // rule is pinned down — with only three, "the jumps take turns" fits too.
  const shownCount = growing ? 4 : rng.pick([3, 4] as const)
  const ask: Ask =
    level === 3 || level === 5
      ? rng.pick(['n-where-count-is', 'difference-between-two'] as const)
      : 'count-at-n'

  const top = maxIndex(shape, height)
  const lo = shownCount + 3
  if (top < lo) return null

  if (ask === 'difference-between-two') {
    if (top < lo + 2) return null
    const targetIndex = rng.int(lo + 2, top)
    if (targetIndex - 2 < shownCount + 2) return null
    const secondIndex = rng.int(shownCount + 2, targetIndex - 2)
    return { shape, height, shownCount, ask, targetIndex, secondIndex }
  }

  // L1 keeps the asked-for picture just past the drawings; L2 pushes it far out.
  const from = level === 2 ? Math.min(top, Math.max(lo, 20)) : lo
  const to = level === 1 ? Math.min(top, lo + 5) : top
  return { shape, height, shownCount, ask, targetIndex: rng.int(from, to), secondIndex: 0 }
}

/** One verified figure per rung, used only if every draft missed. */
const FALLBACK: Record<1 | 2 | 3 | 4 | 5, Params> = {
  1: { shape: 'l-corner', height: 1, shownCount: 3, ask: 'count-at-n', targetIndex: 8, secondIndex: 0 },
  2: { shape: 'l-corner', height: 1, shownCount: 3, ask: 'count-at-n', targetIndex: 30, secondIndex: 0 },
  3: { shape: 'l-corner', height: 1, shownCount: 3, ask: 'n-where-count-is', targetIndex: 20, secondIndex: 0 },
  4: { shape: 'staircase', height: 1, shownCount: 4, ask: 'count-at-n', targetIndex: 12, secondIndex: 0 },
  5: { shape: 'staircase', height: 1, shownCount: 4, ask: 'n-where-count-is', targetIndex: 12, secondIndex: 0 },
}

export function growingFigureNthTermLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 300; attempt++) {
    const candidate = draft(rng, level)
    if (candidate === null) continue
    // No rival rule may fit the drawn pictures and land somewhere else.
    if (solve(candidate).rivals.length > 0) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first ?? FALLBACK[level]
}
