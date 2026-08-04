// Level ladder for balance-substitution. Same param schema (two level scales,
// hidden shape weights, ask = value-of-one | balance-group). Difficulty is
// staged by HOW MANY SUBSTITUTION STEPS the child must make, not by number
// size — every level keeps the cube counts inside a countable 1–8 per pan.
//
// steps = share-scale-1 + share-scale-2 + swap + group-conversion, where
// "share" is a scale that shows 2 copies of a shape (so it must be halved
// before one shape is known) and "group-conversion" is turning the asked
// group into cubes and then refilling it with the other shape.
//   L1 (1 step): 1 shape = n cubes, then swap that shape into the 2nd scale
//   L2 (2 steps): the 1st scale shows 2 shapes — halve it, then swap
//   L3 (3 steps): halve the 1st scale, read the 2nd, refill one shape's worth
//   L4 (4 steps): same, but the asked group is 2 shapes (repeated addition)
//   L5 (5 steps): BOTH scales show 2 shapes (two halvings) and the asked group
//                 is 2–3 shapes — the most substitution the schema allows
// Difficulty proxy: SUBSTITUTION STEPS (1, 2, 3, 4, 5 by construction).
//
// Solvability is preserved the way index.ts's generate() does it: scale 1
// always anchors a shape against cubes, scale 2 either links the two shapes
// (value-of-one) or anchors the second shape against cubes (balance-group),
// and every weight pair is chosen so solve() lands on a whole number.
import type { Rng } from '../types.js'
import type { Params, ScaleData } from './index.js'
import { SHAPE_KINDS } from './index.js'

// value-of-one: 1 A = wA cubes, then c copies of A balance d copies of B, so
// wB = c * wA / d. c !== d keeps the trap value (wA) distinct from the answer.
type Link = { wA: number; c: 2 | 3 }
const LINKS_EASY: readonly Link[] = [
  { wA: 1, c: 2 }, // B = 2
  { wA: 1, c: 3 }, // B = 3
  { wA: 2, c: 2 }, // B = 4
]
const LINKS_HARD: readonly Link[] = [
  { wA: 1, c: 2 },
  { wA: 1, c: 3 },
  { wA: 2, c: 2 },
  { wA: 2, c: 3 }, // B = 6
  { wA: 3, c: 2 }, // B = 6
]

// balance-group: A (heavy) is exactly k times B (light), so swapping a group of
// A for B always comes out whole.
type Ratio = { wB: 1 | 2 | 3; k: 2 | 3 | 4 }
const RATIOS_SMALL: readonly Ratio[] = [
  { wB: 1, k: 2 },
  { wB: 1, k: 3 },
  { wB: 1, k: 4 },
  { wB: 2, k: 2 },
]

function valueOfOne(rng: Rng, link: Link, a: 1 | 2): Params {
  const kinds = rng.shuffle(SHAPE_KINDS)
  const wA = link.wA
  const wB = link.c * wA
  const scales: [ScaleData, ScaleData] = [
    { left: { a, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: a * wA } },
    { left: { a: link.c, b: 0, unit: 0 }, right: { a: 0, b: 1, unit: 0 } },
  ]
  return { shapeA: kinds[0], shapeB: kinds[1], wA, wB, scales, ask: 'value-of-one', askShape: 'B', askCount: 1 }
}

function balanceGroup(rng: Rng, ratio: Ratio, p: 1 | 2, r: 1 | 2, askCount: 1 | 2 | 3): Params {
  const kinds = rng.shuffle(SHAPE_KINDS)
  const wB = ratio.wB
  const wA = ratio.k * wB
  const scales: [ScaleData, ScaleData] = [
    { left: { a: p, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: p * wA } },
    { left: { a: 0, b: r, unit: 0 }, right: { a: 0, b: 0, unit: r * wB } },
  ]
  return { shapeA: kinds[0], shapeB: kinds[1], wA, wB, scales, ask: 'balance-group', askShape: 'A', askCount }
}

export function balanceSubstitutionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return valueOfOne(rng, rng.pick(LINKS_EASY), 1)
    case 2: return valueOfOne(rng, rng.pick(LINKS_HARD), 2)
    case 3: return balanceGroup(rng, rng.pick(RATIOS_SMALL), 2, 1, 1)
    case 4: return balanceGroup(rng, rng.pick(RATIOS_SMALL), 2, 1, 2)
    case 5: return balanceGroup(rng, { wB: 2, k: 2 }, 2, 2, rng.pick([2, 3] as const))
  }
}
