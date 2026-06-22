/**
 * IKMC-19-EC-Q7 — "Pia makes shapes with connected sticks. Which shape needs
 * more sticks than Pia has?" (answer D).
 *
 * Stem: 10 connected sticks in a winding chain (the sticks Pia starts with).
 *
 * Co-exports Sticks7ECOption for CHOICE_RENDERERS — renders one of the
 * five shapes A–E as an SVG unit-square polyomino built from matchsticks.
 *
 * Stick counts:
 *   Stem:  10 sticks available
 *   A (T-tromino, 3 cells):  10 sticks — fits (≤ 10)
 *   B (vertical domino, 2 cells):  7 sticks — fits
 *   C (L-tromino, 3 cells):  10 sticks — fits
 *   D (2×2 block, 4 cells):  12 sticks — EXCEEDS (answer)
 *   E (horizontal I-tromino, 3 cells):  10 sticks — fits (trap: "looks large")
 *
 * Pure SVG, no Math.random, no Date, SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

const STICK = '#C8956C' // matchstick body, warm tan
const TIP = '#3B2B20' // matchstick head, dark brown
const STICK_W = 4
const TIP_R = 2.8

// ── Stem: winding chain of 10 sticks ─────────────────────────────────────────
const STEM_NODES: Array<[number, number]> = [
  [20, 65],
  [50, 35],
  [78, 58],
  [62, 88],
  [95, 102],
  [128, 75],
  [158, 92],
  [188, 62],
  [172, 35],
  [215, 22],
  [245, 48],
]

const STEM_VB_W = 265
const STEM_VB_H = 120

// ── Polyomino shapes: cells as [col, row] ────────────────────────────────────
type Cell = [number, number]

const SHAPES: Record<string, Cell[]> = {
  A: [
    [1, 0],
    [0, 1],
    [1, 1],
  ], // T-tromino: top-center + bottom-left + bottom-right
  B: [
    [0, 0],
    [0, 1],
  ], // vertical domino
  C: [
    [0, 1],
    [1, 0],
    [1, 1],
  ], // L/staircase tromino
  D: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ], // 2×2 block (answer!)
  E: [
    [0, 0],
    [1, 0],
    [2, 0],
  ], // horizontal I-tromino (trap: looks large)
}

const SHAPE_ARIA: Record<string, { en: string; id: string }> = {
  A: { en: 'Shape A: three squares in a T-shape.', id: 'Bentuk A: tiga persegi dalam bentuk T.' },
  B: {
    en: 'Shape B: two squares stacked vertically.',
    id: 'Bentuk B: dua persegi tersusun vertikal.',
  },
  C: { en: 'Shape C: three squares in an L-shape.', id: 'Bentuk C: tiga persegi dalam bentuk L.' },
  D: {
    en: 'Shape D: four squares in a 2×2 block.',
    id: 'Bentuk D: empat persegi dalam blok 2×2.',
  },
  E: {
    en: 'Shape E: three squares in a horizontal row.',
    id: 'Bentuk E: tiga persegi dalam satu baris horizontal.',
  },
}

// ── Edge collection + deduplication ──────────────────────────────────────────
function cellEdges(cells: Cell[]): Array<[number, number, number, number]> {
  const seen = new Set<string>()
  const result: Array<[number, number, number, number]> = []

  function key(x1: number, y1: number, x2: number, y2: number) {
    return x1 < x2 || (x1 === x2 && y1 <= y2)
      ? `${x1},${y1};${x2},${y2}`
      : `${x2},${y2};${x1},${y1}`
  }

  function tryAdd(x1: number, y1: number, x2: number, y2: number) {
    const k = key(x1, y1, x2, y2)
    if (!seen.has(k)) {
      seen.add(k)
      result.push([x1, y1, x2, y2])
    }
  }

  for (const [c, r] of cells) {
    tryAdd(c, r, c + 1, r) // top
    tryAdd(c + 1, r, c + 1, r + 1) // right
    tryAdd(c, r + 1, c + 1, r + 1) // bottom
    tryAdd(c, r, c, r + 1) // left
  }

  return result
}

function collectNodes(cells: Cell[]): Array<[number, number]> {
  const seen = new Set<string>()
  const pts: Array<[number, number]> = []
  for (const [c, r] of cells) {
    for (const [x, y] of [
      [c, r],
      [c + 1, r],
      [c + 1, r + 1],
      [c, r + 1],
    ] as Array<[number, number]>) {
      const k = `${x},${y}`
      if (!seen.has(k)) {
        seen.add(k)
        pts.push([x, y])
      }
    }
  }
  return pts
}

const CELL_SIZE = 24
const POLY_PAD = 8

function PolyominoSVG({ cells }: { cells: Cell[] }) {
  const edges = cellEdges(cells)
  const nodes = collectNodes(cells)

  // compute bounds in grid coords
  const xs = cells.flatMap(([c]) => [c, c + 1])
  const ys = cells.flatMap(([, r]) => [r, r + 1])
  const minC = Math.min(...xs)
  const maxC = Math.max(...xs)
  const minR = Math.min(...ys)
  const maxR = Math.max(...ys)

  const w = (maxC - minC) * CELL_SIZE + POLY_PAD * 2
  const h = (maxR - minR) * CELL_SIZE + POLY_PAD * 2

  const sx = (c: number) => POLY_PAD + (c - minC) * CELL_SIZE
  const sy = (r: number) => POLY_PAD + (r - minR) * CELL_SIZE

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {edges.map(([x1, y1, x2, y2], i) => (
        <line
          key={`e${i}`}
          x1={sx(x1)}
          y1={sy(y1)}
          x2={sx(x2)}
          y2={sy(y2)}
          stroke={STICK}
          strokeWidth={STICK_W}
          strokeLinecap="round"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={`n${i}`} cx={sx(x)} cy={sy(y)} r={TIP_R} fill={TIP} />
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

export default function Sticks7ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Ten connected sticks in a winding chain — these are Pia's sticks."
    >
      <svg
        viewBox={`0 0 ${STEM_VB_W} ${STEM_VB_H}`}
        width="100%"
        style={{ maxWidth: STEM_VB_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {STEM_NODES.slice(0, -1).map((n, i) => {
          const [x1, y1] = n
          const [x2, y2] = STEM_NODES[i + 1]
          return (
            <line
              key={`s${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={STICK}
              strokeWidth={STICK_W}
              strokeLinecap="round"
            />
          )
        })}
        {STEM_NODES.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x} cy={y} r={TIP_R} fill={TIP} />
        ))}
      </svg>
    </div>
  )
}

// ── Co-export: choice option renderer ────────────────────────────────────────

export function Sticks7ECOption({ choice }: { choice: WmiChoice }) {
  const cells = SHAPES[choice.label]
  if (!cells) return <span>{choice.text}</span>
  const aria = SHAPE_ARIA[choice.label]
  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <PolyominoSVG cells={cells} />
    </span>
  )
}
