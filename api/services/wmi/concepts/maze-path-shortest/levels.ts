// Level ladder for maze-path-shortest. Same param schema ({cols, rows, walls});
// difficulty climbs on board size and on how far the walls push you off the
// straight route (`extra` = shortest path − Manhattan distance, always even):
//   L1: 4×4, 2–3 walls, no detour — walk right then down
//   L2: 5×4 / 4×5, 4–6 walls, still no detour — more walls to dodge, same route shape
//   L3: 5×5, 5–8 walls, one forced detour (+2 steps)
//   L4: 6×5 / 5×6, 6–9 walls, one forced detour on a bigger board
//   L5: 6×6, 8–12 walls, two or more forced detours (+4 or more)
// Every level rejection-samples against the concept's own `shortestSteps`, so the
// flag is always reachable — the schema does not guarantee that on its own.
import type { Rng } from '../types.js'
import { shortestSteps, type Cell, type Params } from './index.js'

type Spec = {
  dims: [number, number][]
  walls: [number, number] // wall-count range
  extra: [number, number] // detour steps beyond the straight route
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { dims: [[4, 4]], walls: [2, 3], extra: [0, 0] },
  2: { dims: [[5, 4], [4, 5]], walls: [4, 6], extra: [0, 0] },
  3: { dims: [[5, 5]], walls: [5, 8], extra: [2, 2] },
  4: { dims: [[6, 5], [5, 6]], walls: [6, 9], extra: [2, 2] },
  5: { dims: [[6, 6]], walls: [8, 12], extra: [4, 20] },
}

export function mazePathShortestLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  const [cols, rows] = rng.pick(spec.dims)
  const manhattan = cols - 1 + (rows - 1)

  // Every cell that may hold a wall — never the start or the flag.
  const open: Cell[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if ((x === 0 && y === 0) || (x === cols - 1 && y === rows - 1)) continue
      open.push([x, y])
    }
  }

  let best: Cell[] | null = null
  let bestGap = Infinity
  for (let attempt = 0; attempt < 400; attempt++) {
    const walls = rng.shuffle(open).slice(0, rng.int(spec.walls[0], spec.walls[1]))
    const steps = shortestSteps(cols, rows, walls)
    if (!Number.isFinite(steps)) continue // never ship an unreachable flag
    const extra = steps - manhattan
    if (extra >= spec.extra[0] && extra <= spec.extra[1]) return { cols, rows, walls }
    const gap = extra < spec.extra[0] ? spec.extra[0] - extra : extra - spec.extra[1]
    if (gap < bestGap) {
      bestGap = gap
      best = walls
    }
  }
  // Closest reachable maze we saw; an open grid if somehow nothing was reachable.
  return { cols, rows, walls: best ?? [] }
}
