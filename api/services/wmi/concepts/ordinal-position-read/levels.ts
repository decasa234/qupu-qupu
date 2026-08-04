// Level ladder for ordinal-position-read. Same param schema; difficulty climbs
// on three dials the concept already varies: how the anchor points at a place
// (from the left → from the right → next to a landmark → several steps from a
// landmark), how many anchors must be resolved (one → two), and how long the
// row is (6 → 12).
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const PICTURES = ['apple', 'banana', 'cherry', 'star', 'tree', 'house'] as const

/** A row of `n` distinct numbers drawn from 1…max. */
function numberRow(rng: Rng, n: number, max: number): string[] {
  const pool: number[] = []
  for (let v = 1; v <= max; v++) pool.push(v)
  return rng
    .shuffle(pool)
    .slice(0, n)
    .map((v) => String(v))
}

/**
 * A picture row holding exactly one unique landmark glyph plus three repeatable
 * fillers, all seeded away from the two ends so the landmark always has room to
 * step in either direction. Needs n ≥ 6 (four interior slots).
 */
function pictureRow(rng: Rng, n: number): { cells: string[]; landmark: number } {
  const vocab = rng.shuffle(PICTURES)
  const fillers = [vocab[1], vocab[2], vocab[3]]
  const interior: number[] = []
  for (let i = 1; i <= n - 2; i++) interior.push(i)
  const slots = rng.shuffle(interior)
  const cells = new Array<string>(n).fill('')
  cells[slots[0]] = vocab[0]
  cells[slots[1]] = fillers[0]
  cells[slots[2]] = fillers[1]
  cells[slots[3]] = fillers[2]
  for (let i = 0; i < n; i++) if (!cells[i]) cells[i] = rng.pick(fillers)
  return { cells, landmark: slots[0] }
}

/** A `from-right` count (2…5) that does NOT land on the index `avoid`. */
function fromRightK(rng: Rng, n: number, avoid: number): number {
  const ks: number[] = []
  for (let k = 2; k <= 5; k++) if (n - k !== avoid) ks.push(k)
  return rng.pick(ks)
}

export function ordinalPositionReadLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const optionShift = rng.int(0, 3)
  switch (level) {
    // L1: shortest row, count from the LEFT — the direction children read in.
    case 1:
      return {
        kind: 'number',
        cells: numberRow(rng, 6, 20),
        anchors: [{ type: 'from-left', k: rng.int(2, 4) }],
        ask: 'read',
        optionShift,
      }
    // L2: longer row, counted from the RIGHT — the direction slip is the trap.
    case 2: {
      const n = rng.int(7, 8)
      return {
        kind: 'number',
        cells: numberRow(rng, n, 20),
        anchors: [{ type: 'from-right', k: rng.int(2, 5) }],
        ask: 'read',
        optionShift,
      }
    }
    // L3: no counting handed to you — find a landmark picture first, then step off it.
    case 3: {
      const n = rng.int(8, 9)
      const row = pictureRow(rng, n)
      return {
        kind: 'picture',
        cells: row.cells,
        anchors: [
          { type: 'neighbour-of', marker: row.landmark, side: rng.pick(['left', 'right'] as const) },
        ],
        ask: 'read',
        optionShift,
      }
    }
    // L4: TWO places to find — one from each end — then add what they hold.
    case 4: {
      const n = rng.int(9, 10)
      const kL = rng.int(2, 5)
      // Row values stay ≤ 10 so any pair the anchors pick sums inside the G1 ceiling.
      return {
        kind: 'number',
        cells: numberRow(rng, n, 10),
        anchors: [
          { type: 'from-left', k: kL },
          { type: 'from-right', k: fromRightK(rng, n, kL - 1) },
        ],
        ask: 'sum',
        optionShift,
      }
    }
    // L5: longest row, a three-step walk off a landmark plus a count from the
    // right, then subtract — the most lookups and the longest walk on offer.
    case 5: {
      const n = rng.int(11, 12)
      const step = 3 as const
      const dir = rng.pick(['left', 'right'] as const)
      const marker = dir === 'left' ? rng.int(step, n - 2) : rng.int(1, n - 1 - step)
      const target = dir === 'left' ? marker - step : marker + step
      return {
        kind: 'number',
        cells: numberRow(rng, n, 20),
        anchors: [
          { type: 'offset-from-item', marker, dir, step },
          { type: 'from-right', k: fromRightK(rng, n, target) },
        ],
        ask: 'difference',
        optionShift,
      }
    }
  }
}
