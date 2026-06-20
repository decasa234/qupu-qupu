// IKMC-19-PE-Q23 — "Here are nine squares..."
//
// PROBLEM ONLY: shows the static starting 3×3→actually 1×9 strip the student sees:
//   Black, Grey, White, Grey, White, White, Grey, Black, White
//
// Does NOT show the answer or the swaps.
//
// Co-exports ColorSwap23Option (choice renderer for A–E).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

import type { WmiChoice } from '../../../../types/wmi'

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ──────

/** Total SVG width. */
export const SVG_W = 300

/** Total SVG height. */
export const SVG_H = 80

/** Size of each square cell. */
export const CELL_SIZE = 28

/** Gap between cells. */
export const CELL_GAP = 4

/** Y offset for the grid strip (centred vertically). */
export const GRID_Y = (SVG_H - CELL_SIZE) / 2

/** X offset for the left edge of the first cell (centred horizontally). */
export const GRID_X = (SVG_W - 9 * CELL_SIZE - 8 * CELL_GAP) / 2

/** Colour tokens. */
export const COLOR = {
  BLACK_FILL: '#1C1917',
  GREY_FILL: '#9CA3AF',
  WHITE_FILL: '#FFFFFF',
  CELL_STROKE: '#6B7280',
} as const

// ── Cell primitive ────────────────────────────────────────────────────────────

/**
 * A single square cell.
 * `col` is 0-based index (0–8).
 */
export function GridCell({ col, fill }: { col: number; fill: string }) {
  const x = GRID_X + col * (CELL_SIZE + CELL_GAP)
  return (
    <rect
      x={x}
      y={GRID_Y}
      width={CELL_SIZE}
      height={CELL_SIZE}
      fill={fill}
      stroke={COLOR.CELL_STROKE}
      strokeWidth={1.5}
      rx={2}
    />
  )
}

/** Map a CellColor name to its SVG fill value. */
export function colorToFill(c: 'black' | 'grey' | 'white'): string {
  if (c === 'black') return COLOR.BLACK_FILL
  if (c === 'grey') return COLOR.GREY_FILL
  return COLOR.WHITE_FILL
}

// ── Grid strip primitive ──────────────────────────────────────────────────────

/**
 * A horizontal strip of 9 coloured cells.
 * `cells` is an array of 9 color names.
 */
export function GridStrip({ cells }: { cells: Array<'black' | 'grey' | 'white'> }) {
  return (
    <g>
      {cells.map((c, i) => (
        <GridCell key={i} col={i} fill={colorToFill(c)} />
      ))}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * ColorSwap23Illustration
 *
 * Static, problem-only figure for IKMC-19-PE-Q23.
 * Shows the starting 9-square horizontal strip:
 *   Black, Grey, White, Grey, White, White, Grey, Black, White
 * Does NOT reveal the swaps or the answer.
 */
export default function ColorSwap23Illustration() {
  const cells: Array<'black' | 'grey' | 'white'> = [
    'black', 'grey', 'white', 'grey', 'white', 'white', 'grey', 'black', 'white',
  ]

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Nine squares in a row: black, grey, white, grey, white, white, grey, black, white.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the nine starting squares */}
        <GridStrip cells={cells} />
      </svg>
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * The 9-cell colour pattern for each choice A–E.
 *
 * Starting strip: B,G,W,G,W,W,G,B,W
 *
 * Correct answer (D) is the computed end state after all three swaps:
 *   Original Black  → Grey (step1: B→W; step3: W→G)
 *   Original Grey   → Black (step2: G→B)
 *   Original White  → Grey (step3: W→G)
 *   Result: G,B,G,B,G,G,B,G,G  ← matches option D exactly.
 *
 * Options A, B, C, E are plausible distractors from the source paper (OCR crops
 * 040.jpg + 041.jpg):
 *   A: B,W,W,B,G,B,W,B,G  (mixed black/white/grey — wrong order confusion)
 *   B: W,B,G,B,G,G,B,W,B  (mirror-like inversion of D — common wrong path)
 *   C: G,G,G,G,G,G,G,G,G  (all grey — misapply step 3 to everything)
 *   E: B,G,B,G,B,B,G,B,G  (all black dominant — skip step 3)
 */
const OPTION_CELLS: Record<string, Array<'black' | 'grey' | 'white'>> = {
  A: ['black', 'white', 'white', 'black', 'grey',  'black', 'white', 'black', 'grey' ],
  B: ['white', 'black', 'grey',  'black', 'grey',  'grey',  'black', 'white', 'black'],
  C: ['grey',  'grey',  'grey',  'grey',  'grey',  'grey',  'grey',  'grey',  'grey' ],
  D: ['grey',  'black', 'grey',  'black', 'grey',  'grey',  'black', 'grey',  'grey' ],
  E: ['black', 'grey',  'black', 'grey',  'black', 'black', 'grey',  'black', 'grey' ],
}

const OPTION_ARIA: Record<string, string> = {
  A: 'Option A: black, white, white, black, grey, black, white, black, grey',
  B: 'Option B: white, black, grey, black, grey, grey, black, white, black',
  C: 'Option C: all nine squares grey',
  D: 'Option D: grey, black, grey, black, grey, grey, black, grey, grey',
  E: 'Option E: black, grey, black, grey, black, black, grey, black, grey',
}

/**
 * ColorSwap23Option — renders one A/B/C/D/E choice as a 9-square horizontal strip.
 * Registered in CHOICE_RENDERERS for IKMC-19-PE-Q23.
 * Reuses GridStrip + the same layout constants as the stem illustration.
 */
export function ColorSwap23Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const cells = OPTION_CELLS[k]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={OPTION_ARIA[k] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(240, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <GridStrip cells={cells} />
      </svg>
    </span>
  )
}
