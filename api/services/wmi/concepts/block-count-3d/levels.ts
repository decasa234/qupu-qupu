// Level ladder for block-count-3d. Same param schema (2–4 solid monotone
// groups, every stack 2–3 tall); difficulty climbs on TWO staged axes — how
// many separate groups must be totalled, and how many columns each group has:
//   L1: 2 groups, footprints up to 2x2, every stack exactly 2 tall (~7 cubes)
//   L2: 2 groups, up to 2x2 footprints, stacks 2–3        (~12 cubes)
//   L3: 3 groups, up to 2x2 footprints                    (~19 cubes)
//   L4: 3 groups, up to 3x3 footprints — deep rows, so hidden cubes appear
//       under every stepped-down top                      (~28 cubes)
//   L5: 4 groups, up to 3x3 footprints — the most the count stays readable at
//       (~39 cubes), i.e. four sub-totals plus a 4-term addition
// Difficulty proxy: TOTAL CUBES.
//
// Groups are built the same way the concept's own genGroup does (heights
// chosen as rng.int(2, min(up, left)) so the staircase steps down toward the
// front and right); `isMonotone` from index.ts re-checks every group before it
// is returned, so the "every stack top is visible" invariant cannot drift.
import type { Rng } from '../types.js'
import { isMonotone, type Params } from './index.js'

type Group = Params['groups'][number]

function genGroup(rng: Rng, maxDepth: number, maxWidth: number, maxHeight: 2 | 3): Group {
  const depth = rng.int(1, maxDepth)
  const width = rng.int(1, maxWidth)
  const cap = rng.int(2, maxHeight)
  const heights: number[] = []
  const H = (r: number, c: number) => heights[r * width + c]
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      const up = r > 0 ? H(r - 1, c) : cap
      const left = c > 0 ? H(r, c - 1) : cap
      heights.push(rng.int(2, Math.min(up, left))) // 2..min(neighbours) -> monotone, never below 2
    }
  }
  return { depth, width, heights }
}

function cubes(g: Group): number {
  return g.heights.reduce((a, b) => a + b, 0)
}

type Shape = {
  groups: number
  maxDepth: number
  maxWidth: number
  maxHeight: 2 | 3
  min: number
  max: number
  fallback: Group[]
}

const SHAPES: Record<1 | 2 | 3 | 4 | 5, Shape> = {
  1: {
    groups: 2, maxDepth: 2, maxWidth: 2, maxHeight: 2, min: 4, max: 10,
    fallback: [
      { depth: 1, width: 2, heights: [2, 2] },
      { depth: 1, width: 1, heights: [2] },
    ],
  },
  2: {
    groups: 2, maxDepth: 2, maxWidth: 2, maxHeight: 3, min: 8, max: 16,
    fallback: [
      { depth: 2, width: 2, heights: [3, 3, 2, 2] },
      { depth: 1, width: 2, heights: [3, 2] },
    ],
  },
  3: {
    groups: 3, maxDepth: 2, maxWidth: 2, maxHeight: 3, min: 14, max: 24,
    fallback: [
      { depth: 2, width: 2, heights: [3, 3, 2, 2] },
      { depth: 1, width: 2, heights: [3, 2] },
      { depth: 1, width: 2, heights: [2, 2] },
    ],
  },
  4: {
    groups: 3, maxDepth: 3, maxWidth: 3, maxHeight: 3, min: 22, max: 34,
    fallback: [
      { depth: 2, width: 3, heights: [3, 3, 3, 2, 2, 2] },
      { depth: 2, width: 2, heights: [3, 2, 2, 2] },
      { depth: 1, width: 2, heights: [3, 2] },
    ],
  },
  5: {
    groups: 4, maxDepth: 3, maxWidth: 3, maxHeight: 3, min: 32, max: 46,
    fallback: [
      { depth: 3, width: 3, heights: [3, 3, 3, 3, 2, 2, 2, 2, 2] },
      { depth: 2, width: 2, heights: [3, 3, 2, 2] },
      { depth: 1, width: 2, heights: [3, 2] },
      { depth: 1, width: 1, heights: [3] },
    ],
  },
}

export function blockCount3dLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const s = SHAPES[level]
  for (let attempt = 0; attempt < 120; attempt++) {
    const groups = Array.from({ length: s.groups }, () =>
      genGroup(rng, s.maxDepth, s.maxWidth, s.maxHeight),
    )
    const total = groups.reduce((sum, g) => sum + cubes(g), 0)
    const someDepth = groups.some((g) => g.depth >= 2 || g.width >= 2) // keep a 3D feel
    const visible = groups.every((g) => isMonotone(g.depth, g.width, g.heights))
    if (visible && someDepth && total >= s.min && total <= s.max) return { groups }
  }
  return { groups: s.fallback.map((g) => ({ ...g, heights: [...g.heights] })) }
}
