// Level ladder for count-rectangles-grid. Same param schema ({cols, rows});
// difficulty climbs on how many SIZES of square the grid can hold — one size is
// pure counting, three sizes means the child has to sweep the board three times
// and add — and then on how wide the board is at that number of sizes.
//   L1: single row — only 1×1 squares exist; the answer is just the cell count
//   L2: 2 wide, 2–3 tall — a second size appears (2×2), on a narrow board
//   L3: 3–4 wide, 2 tall — same two sizes, more of them to sweep
//   L4: 3×3 — a third size (3×3) appears
//   L5: 4×3 — three sizes on the widest board the schema allows (20 squares)
// NOTE: the schema admits only cols 2–4 × rows 1–3 = NINE params in total, so the
// rungs here are lists, not ranges, and L4/L5 are a single param each.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const POOLS: Record<1 | 2 | 3 | 4 | 5, Params[]> = {
  1: [{ cols: 2, rows: 1 }, { cols: 3, rows: 1 }, { cols: 4, rows: 1 }],
  2: [{ cols: 2, rows: 2 }, { cols: 2, rows: 3 }],
  3: [{ cols: 3, rows: 2 }, { cols: 4, rows: 2 }],
  4: [{ cols: 3, rows: 3 }],
  5: [{ cols: 4, rows: 3 }],
}

export function countRectanglesGridLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  return { ...rng.pick(POOLS[level]) }
}
