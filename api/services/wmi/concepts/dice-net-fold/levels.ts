// Level ladder for dice-net-fold. Same param schema ({nets[4], validIndex});
// difficulty climbs on how much the four pictures look alike:
//   • how far apart the two tabs sit on the true net (tabs beside each other read
//     instantly as a cube net; tabs at opposite ends read as a zig-zag), and
//   • how many of the three wrong nets are the sneaky kind — the ones that hide a
//     2×2 block inside an otherwise net-shaped outline, rather than being an
//     obvious 1×6 strip or 2×3 slab.
//   L1: tabs adjacent, no sneaky look-alike at all, true net in the first two slots
//   L2: tabs adjacent, the 3×3 staircase look-alike now in the line-up
//   L3: tabs two apart, one sneaky look-alike
//   L4: tabs two apart, both sneaky look-alikes present
//   L5: tabs at opposite ends, both sneaky look-alikes, true net in the last two slots
// Params come from the concept's own `generate`, so the "exactly one net folds"
// invariant is the concept's and never re-derived here.
import type { Rng } from '../types.js'
import { generate, type Params } from './index.js'

type Cell = [number, number]

function bbox(net: Cell[]): { w: number; h: number } {
  const xs = net.map(([x]) => x)
  const ys = net.map(([, y]) => y)
  return { w: Math.max(...xs) - Math.min(...xs) + 1, h: Math.max(...ys) - Math.min(...ys) + 1 }
}

// 0 = 1×6 strip, 1 = 2×3 slab (both obviously not nets), 2 = 2×2 block with a
// tail, 3 = the 3×3 staircase — the two sneaky ones that read as plausible nets.
function decoyRank(net: Cell[]): number {
  const { w, h } = bbox(net)
  if (w === 6 || h === 6) return 0
  if (w * h === 6) return 1
  if (w === 4 || h === 4) return 2
  return 3
}

// The 1-4-1 net's row of four, and how many columns apart its two tabs sit.
function tabSpread(net: Cell[]): number {
  const byRow = new Map<number, Cell[]>()
  for (const c of net) {
    const row = byRow.get(c[1]) ?? []
    row.push(c)
    byRow.set(c[1], row)
  }
  const tabs: Cell[] = []
  for (const row of byRow.values()) if (row.length !== 4) tabs.push(...row)
  if (tabs.length !== 2) return 0
  return Math.abs(tabs[0][0] - tabs[1][0])
}

type Spec = {
  spread: number
  sneaky: number // decoys with rank >= 2
  hasStaircase: boolean // the rank-3 decoy present
  slots: number[] // allowed validIndex
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { spread: 1, sneaky: 1, hasStaircase: false, slots: [0, 1] },
  2: { spread: 1, sneaky: 1, hasStaircase: true, slots: [0, 1, 2, 3] },
  3: { spread: 2, sneaky: 1, hasStaircase: true, slots: [0, 1, 2, 3] },
  4: { spread: 2, sneaky: 2, hasStaircase: true, slots: [0, 1, 2, 3] },
  5: { spread: 3, sneaky: 2, hasStaircase: true, slots: [2, 3] },
}

export function diceNetFoldLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  let fallback: Params | null = null

  for (let attempt = 0; attempt < 400; attempt++) {
    const params = generate(rng)
    if (fallback === null) fallback = params
    if (!spec.slots.includes(params.validIndex)) continue
    if (tabSpread(params.nets[params.validIndex] as Cell[]) !== spec.spread) continue
    const ranks = params.nets
      .filter((_, i) => i !== params.validIndex)
      .map((net) => decoyRank(net as Cell[]))
    if (ranks.filter((r) => r >= 2).length !== spec.sneaky) continue
    if (ranks.includes(3) !== spec.hasStaircase) continue
    return params
  }
  return fallback ?? generate(rng)
}
