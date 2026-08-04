// Level ladder for grid-path-steps. Same param schema (cols 4..6, rows 3..5,
// coordinates within those bounds); difficulty climbs on two real axes — the
// length of the shortest walk, and whether the walk needs BOTH a sideways and an
// up/down leg (a straight line needs no adding at all).
// Proxy: steps = |ex − sx| + |ey − sy|.
//   L1: 2–3, straight line   L2: 3–4   L3: 5–6   L4: 6–7   L5: 8–9 (schema max is 9)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** Two coordinates exactly `d` apart inside a run of `span` cells, in random order. */
function place(rng: Rng, span: number, d: number): [number, number] {
  const a = rng.int(0, span - 1 - d)
  return rng.pick([
    [a, a + d],
    [a + d, a],
  ]) as [number, number]
}

export function gridPathStepsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: small grid, dot and flag on the same row or column — count one straight run
    case 1: {
      const cols = 4
      const rows = 3
      if (rng.int(0, 1) === 0) {
        const [sx, ex] = place(rng, cols, rng.int(2, 3))
        const y = rng.int(0, rows - 1)
        return { cols, rows, sx, sy: y, ex, ey: y }
      }
      const [sy, ey] = place(rng, rows, 2)
      const x = rng.int(0, cols - 1)
      return { cols, rows, sx: x, sy, ex: x, ey }
    }
    // L2: a corner appears — one step each way plus a short leg (3–4 steps)
    case 2: {
      const cols = rng.int(4, 5)
      const rows = 3
      const dx = rng.int(1, 2)
      const dy = dx === 1 ? 2 : rng.int(1, 2)
      const [sx, ex] = place(rng, cols, dx)
      const [sy, ey] = place(rng, rows, dy)
      return { cols, rows, sx, sy, ex, ey }
    }
    // L3: bigger grid, both legs at least 2 — 5 or 6 steps to add
    case 3: {
      const cols = 5
      const rows = 4
      const dx = rng.int(2, 3)
      const dy = dx === 2 ? 3 : rng.int(2, 3)
      const [sx, ex] = place(rng, cols, dx)
      const [sy, ey] = place(rng, rows, dy)
      return { cols, rows, sx, sy, ex, ey }
    }
    // L4: the largest grid, a long sideways leg plus a full-height leg (6–7 steps)
    case 4: {
      const cols = 6
      const rows = 5
      const dx = rng.int(3, 4)
      const dy = dx === 3 ? 3 : rng.int(2, 3)
      const [sx, ex] = place(rng, cols, dx)
      const [sy, ey] = place(rng, rows, dy)
      return { cols, rows, sx, sy, ex, ey }
    }
    // L5: near-opposite corners of a 6×5 grid — 8 or 9 steps, the schema's maximum
    case 5: {
      const cols = 6
      const rows = 5
      const dx = rng.int(4, 5)
      const dy = dx === 4 ? 4 : rng.int(3, 4)
      const [sx, ex] = place(rng, cols, dx)
      const [sy, ey] = place(rng, rows, dy)
      return { cols, rows, sx, sy, ex, ey }
    }
  }
}
