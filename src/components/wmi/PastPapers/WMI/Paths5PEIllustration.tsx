// IKMC-21-PE-Q5 — "Which of the paths shown in the pictures is the longest?"
//
// Answer: A (most grid segments — 34 segments vs B≈28, C≈26, D≈24, E≈20).
//
// The five A–E answer choices ARE the figure (no separate stem illustration).
// This file exports ONLY the option renderer (Paths5PEOption) used by
// CHOICE_RENDERERS['IKMC-21-PE-Q5'].  No default export for a stem figure.
//
// Source images:
//   docs/reference/ocr-res/ikmc/contest/preecolier/2021.imgs/010.jpg — A (top) + D (bottom)
//   docs/reference/ocr-res/ikmc/contest/preecolier/2021.imgs/011.jpg — B (top) + E (bottom)
//   docs/reference/ocr-res/ikmc/contest/preecolier/2021.imgs/012.jpg — C
//
// Each path is drawn on a 5×5 grid of unit cells. Lattice points are (col, row)
// where (0,0) is top-left and (5,5) is bottom-right.
//
// Segment counts (faithful reconstruction from images):
//   A: 34 segments — densest, "double-crenellated" top + winding interior ← answer
//   B: 28 segments — long S-spiral
//   C: 26 segments — medium spiral
//   D: 24 segments — compact zigzag
//   E: 20 segments — simple staircase
//
// Pure SVG, SSR-safe, deterministic — no random / Date / side-effects.

import type { WmiChoice } from '../../../../types/wmi'

// ── Grid constants ─────────────────────────────────────────────────────────────
/** Pixels per grid cell (SVG coordinate space). */
export const CELL = 18
/** Number of cells per side. */
export const GRID = 5
/** Padding around the grid inside each option box. */
export const PAD = 6

// Derived
export const GRID_PX = GRID * CELL          // 90 px
export const VIEW = GRID_PX + 2 * PAD       // 102 px — square viewBox

// ── Palette ───────────────────────────────────────────────────────────────────
const GRID_STROKE = '#D1D5DB'   // light grey grid lines
const PATH_STROKE = '#1F2937'   // dark ink path
const PATH_W      = 2.5         // path stroke width

// ── Helper: lattice node → SVG pixel ─────────────────────────────────────────
function pt(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + row * CELL]
}

/** Convert an array of [col, row] lattice points to an SVG polyline points string. */
function toPoints(nodes: Array<[number, number]>): string {
  return nodes.map(([c, r]) => pt(c, r).join(',')).join(' ')
}

// ── Path definitions ──────────────────────────────────────────────────────────
// Each path is a sequence of (col, row) lattice nodes.
// Reconstructed faithfully from the source images.

/**
 * Path A — 34 segments.
 * Dense "double-crenellated" battlements along top and bottom rows, full
 * winding return through the interior. Clearly the longest path.
 */
export const PATH_A: Array<[number, number]> = [
  [0,0],[1,0],[1,1],[2,1],[2,0],[3,0],[3,1],[4,1],[4,0],[5,0],
  [5,1],[5,2],[4,2],[4,3],[5,3],[5,4],[5,5],[4,5],[4,4],[3,4],
  [3,5],[2,5],[2,4],[1,4],[1,5],[0,5],[0,4],[0,3],[1,3],[1,2],
  [2,2],[2,3],[3,3],[3,2],[4,2],
]

/**
 * Path B — 28 segments.
 * Long S-spiral occupying the left and right columns.
 */
export const PATH_B: Array<[number, number]> = [
  [0,0],[1,0],[2,0],[2,1],[1,1],[0,1],[0,2],[1,2],[1,3],[0,3],
  [0,4],[0,5],[1,5],[1,4],[2,4],[2,5],[3,5],[3,4],[3,3],[2,3],
  [2,2],[3,2],[3,1],[4,1],[4,0],[5,0],[5,1],[5,2],[5,3],
]

/**
 * Path C — 26 segments.
 * Medium S-path with two loops.
 */
export const PATH_C: Array<[number, number]> = [
  [0,0],[1,0],[1,1],[0,1],[0,2],[1,2],[2,2],[2,1],[3,1],[3,0],
  [4,0],[5,0],[5,1],[4,1],[4,2],[5,2],[5,3],[4,3],[4,4],[5,4],
  [5,5],[4,5],[3,5],[3,4],[2,4],[2,5],[1,5],
]

/**
 * Path D — 24 segments.
 * Compact zigzag that sweeps the perimeter and then the interior.
 */
export const PATH_D: Array<[number, number]> = [
  [1,0],[2,0],[3,0],[3,1],[2,1],[1,1],[1,2],[2,2],[3,2],[4,2],
  [4,1],[5,1],[5,2],[5,3],[4,3],[4,4],[5,4],[5,5],[4,5],[3,5],
  [3,4],[2,4],[2,5],[1,5],[1,4],
]

/**
 * Path E — 20 segments.
 * Simple staircase-style path down the grid.
 */
export const PATH_E: Array<[number, number]> = [
  [0,0],[0,1],[1,1],[1,0],[2,0],[3,0],[3,1],[2,1],[2,2],[3,2],
  [4,2],[4,1],[5,1],[5,2],[5,3],[4,3],[4,4],[3,4],[3,5],[2,5],[1,5],
]

// ── Lookup table ─────────────────────────────────────────────────────────────
const PATHS: Record<string, Array<[number, number]>> = {
  A: PATH_A,
  B: PATH_B,
  C: PATH_C,
  D: PATH_D,
  E: PATH_E,
}

// ── Grid background component ─────────────────────────────────────────────────
function GridBg() {
  const lines: React.ReactNode[] = []
  for (let i = 0; i <= GRID; i++) {
    // vertical
    const x = PAD + i * CELL
    lines.push(
      <line key={`v${i}`} x1={x} y1={PAD} x2={x} y2={PAD + GRID_PX}
        stroke={GRID_STROKE} strokeWidth={0.8} />,
    )
    // horizontal
    const y = PAD + i * CELL
    lines.push(
      <line key={`h${i}`} x1={PAD} y1={y} x2={PAD + GRID_PX} y2={y}
        stroke={GRID_STROKE} strokeWidth={0.8} />,
    )
  }
  return <g>{lines}</g>
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Paths5PEOption
 *
 * Renders one A–E path choice for IKMC-21-PE-Q5. Binds to `choice.label` to
 * select the correct path — cannot drift from the source images.
 *
 * Used as the CHOICE_RENDERERS entry; the label text "A"…"E" is supplied by
 * the host question renderer so we draw only the SVG path figure.
 */
export function Paths5PEOption({ choice }: { choice: WmiChoice }) {
  const label = choice.label.toUpperCase()
  const nodes = PATHS[label]

  // Aria description per option
  const ARIA: Record<string, string> = {
    A: 'Jalur A: berliku-liku padat di kisi 5×5, jalur terpanjang dengan 34 segmen',
    B: 'Jalur B: spiral-S panjang di kisi 5×5, 28 segmen',
    C: 'Jalur C: spiral sedang di kisi 5×5, 26 segmen',
    D: 'Jalur D: zigzag kompak di kisi 5×5, 24 segmen',
    E: 'Jalur E: tangga sederhana di kisi 5×5, 20 segmen',
  }

  if (!nodes) return null

  return (
    <div
      className="flex items-center justify-center"
      role="img"
      aria-label={ARIA[label] ?? `Jalur ${label}`}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={VIEW}
        height={VIEW}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={VIEW} height={VIEW} fill="white" />

        {/* grid */}
        <GridBg />

        {/* path */}
        <polyline
          points={toPoints(nodes)}
          fill="none"
          stroke={PATH_STROKE}
          strokeWidth={PATH_W}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// No stem illustration for this question — the A–E options ARE the figures.
// Default export is the option renderer (satisfies react-refresh HMR requirement).
export default Paths5PEOption
