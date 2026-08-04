// Level ladder for same-figure-identify. The params carry a proved invariant —
// the correct option is a true rotation of the target and the three distractors
// are mirror images, unreachable by turning — so every level rejection-samples
// the concept's own `generate` rather than hand-building cells. Difficulty
// climbs on three measurable axes of the produced puzzle:
//   • how many squares the figure has (4 → 5), i.e. how much to hold in mind;
//   • whether the correct option is a HALF turn (upside down, easy to check) or
//     a QUARTER turn (must actually rotate mentally);
//   • whether the figure branches (the Y-pentomino, whose only chirality clue is
//     a single stub on the side) instead of being a simple bent snake.
// Proxy: mental-rotation load = 2 × cells + 1.5 × (quarter turn) + 1 × (branch).
//   L1: 4 cells, half   L2: 4 cells, quarter   L3: 5 cells, half
//   L4: 5 cells, quarter   L5: 5 cells, branching, quarter
import type { Rng } from '../types.js'
import { generate, normalize, type Params } from './index.js'

type Cell = [number, number]

const key = (cells: Cell[]): string => JSON.stringify(normalize(cells))

/** True when the correct option is the target turned a half turn (180°). */
function isHalfTurn(p: Params): boolean {
  const half = p.target.map(([x, y]) => [-x, -y] as Cell)
  return key(half) === key(p.options[p.validIndex] as Cell[])
}

/** True when some square touches three others — the Y-pentomino, the hardest base shape. */
function hasBranch(cells: Cell[]): boolean {
  const set = new Set(cells.map(([x, y]) => `${x},${y}`))
  const around: Cell[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  return cells.some(([x, y]) => around.filter(([dx, dy]) => set.has(`${x + dx},${y + dy}`)).length >= 3)
}

function sample(rng: Rng, accept: (p: Params) => boolean): Params {
  let p = generate(rng)
  for (let i = 0; i < 300 && !accept(p); i++) p = generate(rng)
  return p
}

export function sameFigureIdentifyLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: the 4-square figure, turned upside down — the smallest shape, easiest turn
    case 1: return sample(rng, (p) => p.target.length === 4 && isHalfTurn(p))
    // L2: same small figure, but a quarter turn — real mental rotation starts here
    case 2: return sample(rng, (p) => p.target.length === 4 && !isHalfTurn(p))
    // L3: a 5-square figure, still only a half turn to check
    case 3: return sample(rng, (p) => p.target.length === 5 && isHalfTurn(p))
    // L4: 5 squares AND a quarter turn — more shape to track through the rotation
    case 4: return sample(rng, (p) => p.target.length === 5 && !isHalfTurn(p))
    // L5: the branching figure on a quarter turn — the mirror clue is one small stub
    case 5: return sample(rng, (p) => p.target.length === 5 && !isHalfTurn(p) && hasBranch(p.target as Cell[]))
  }
}
