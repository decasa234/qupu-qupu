/**
 * IKMC-20-EC-Q23 — "Which key cannot be cut into three different figures of
 * five shaded squares?"  (answer B)
 *
 * The five answer options ARE the figures — there is no separate stem
 * illustration. This file provides only the option renderer (Keys23ECOption)
 * used by CHOICE_RENDERERS.
 *
 * Each key is a polyomino of exactly 15 shaded squares (= 3 × 5).  The
 * question asks which of the five cannot be partitioned into three *different*
 * pentomino shapes.  Key B is the impossible one.
 *
 * Grid layouts below are read from the original crop images (050-054.jpg).
 * Cells are given as [col, row] pairs, 0-indexed from top-left of each key's
 * own bounding box.
 *
 * Key A  (050.jpg) — vertical cross with "bit" hole at top
 *   •••     row 0
 *   • •     row 1  (hole at col 1)
 *   •••     row 2
 *   •••     row 3
 *    •      row 4  (stem, col 1)
 *   •••     row 5  (bottom bar)
 *   15 squares ✓
 *
 * Key B  (051.jpg) — wide key, "bit" extends left AND right of stem
 *   •••     row 0  cols 0-2
 *   • ••    row 1  cols 0, 2-3  (hole at col 1)
 *   •••     row 2  cols 0-2
 *    ••     row 3  cols 1-2
 *    •      row 4  col 1
 *   •••     row 5  cols 0-2
 *   15 squares ✓
 *
 * Key C  (052.jpg) — similar to B, "bit" extends right but shifted
 *   •••     row 0  cols 0-2
 *   • ••    row 1  cols 0, 2-3  (hole at col 1)
 *   •••     row 2  cols 0-2
 *   ••      row 3  cols 0-1
 *    •      row 4  col 1
 *   •••     row 5  cols 0-2
 *   15 squares ✓
 *
 * Key D  (053.jpg) — taller vertical key, narrower top, 2-cell stem
 *    ••     row 0  cols 1-2
 *   • •     row 1  cols 0, 2  (hole at col 1)
 *   •••     row 2  cols 0-2
 *   •••     row 3  cols 0-2
 *    •      row 4  col 1  (stem cell 1)
 *    •      row 5  col 1  (stem cell 2)
 *   •••     row 6  cols 0-2
 *   15 squares ✓
 *
 * Key E  (054.jpg) — asymmetric, "bit" wider on left side
 *   •••     row 0  cols 0-2
 *   •• •    row 1  cols 0-1, 3  → no: cols 0, hole at 1, cols 2-3 ← wait...
 *
 * Looking at E (054.jpg) more carefully — it is a leftward shifted version:
 *    •••    row 0  cols 1-3
 *   •  •    row 1  cols 0, hole at 1-2, col 3  → only 2 shaded?
 *
 * Re-examining E from the image: the hole is in the upper-left of the "bit"
 * area:
 *    •••    row 0  cols 1-3
 *   ••      row 1  cols 0-1  (left extension + partial hole)
 *   Hmm. Let me use: E is the mirror of B around the vertical axis.
 *
 * Actually from the image (054.jpg):
 *   row 0: cols 1,2,3   — 3 squares (top of bit, right side)
 *   row 1: col 0, hole at col 1, col 2, col 3 → col 0, cols 2-3 = 3 squares
 *   Wait, there seems to be a white square at (1,1). Let me recount:
 *   row 1: col 0 (left extension), hole at 1, col 2, col 3 — 3 squares
 *   row 2: cols 1,2,3  — 3 squares
 *   row 3: cols 1,2    — 2 squares (step)
 *   row 4: col 2       — 1 square (stem)
 *   row 5: cols 1,2,3  — 3 squares (bottom bar)
 *   Total: 3+3+3+2+1+3 = 15 ✓
 *
 * Pure SVG, no Math.random, no Date, SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ─── colour tokens ──────────────────────────────────────────────────────────

const SHADED   = '#9CA3AF'   // grey-400 — shaded cell fill
const GRID_INK = '#374151'   // cell border

// ─── cell size ───────────────────────────────────────────────────────────────

const CS = 16   // cell side length in px

// ─── key shape definitions ────────────────────────────────────────────────────
//
// Each entry is a Set of "col,row" strings. Bounding box is implicit.

type Cell = [number, number]   // [col, row]

/** Key A — vertical cross, bit has a square hole. */
const KEY_A: Cell[] = [
  [0,0],[1,0],[2,0],
  [0,1],      [2,1],
  [0,2],[1,2],[2,2],
  [0,3],[1,3],[2,3],
        [1,4],
  [0,5],[1,5],[2,5],
]

/** Key B — wide bit extending left and right, impossible to cut. */
const KEY_B: Cell[] = [
  [0,0],[1,0],[2,0],
  [0,1],      [2,1],[3,1],
  [0,2],[1,2],[2,2],
        [1,3],[2,3],
        [1,4],
  [0,5],[1,5],[2,5],
]

/** Key C — wide bit extending right-only, hole at upper-middle. */
const KEY_C: Cell[] = [
  [0,0],[1,0],[2,0],
  [0,1],      [2,1],[3,1],
  [0,2],[1,2],[2,2],
  [0,3],[1,3],
        [1,4],
  [0,5],[1,5],[2,5],
]

/** Key D — narrow top (two prongs), taller proportions with a 2-cell stem. */
const KEY_D: Cell[] = [
        [1,0],[2,0],
  [0,1],      [2,1],
  [0,2],[1,2],[2,2],
  [0,3],[1,3],[2,3],
        [1,4],
        [1,5],
  [0,6],[1,6],[2,6],
]

/** Key E — top bit shifted right, left extension below hole. */
const KEY_E: Cell[] = [
        [1,0],[2,0],[3,0],
  [0,1],      [2,1],[3,1],
        [1,2],[2,2],[3,2],
        [1,3],[2,3],
              [2,4],
        [1,5],[2,5],[3,5],
]

const KEY_CELLS: Record<string, Cell[]> = {
  A: KEY_A,
  B: KEY_B,
  C: KEY_C,
  D: KEY_D,
  E: KEY_E,
}

// ─── bounding box helper ─────────────────────────────────────────────────────

function bounds(cells: Cell[]): { cols: number; rows: number } {
  let maxC = 0
  let maxR = 0
  for (const [c, r] of cells) {
    if (c > maxC) maxC = c
    if (r > maxR) maxR = r
  }
  return { cols: maxC + 1, rows: maxR + 1 }
}

// ─── KeyGrid — renders one key shape ─────────────────────────────────────────

interface KeyGridProps {
  cells: Cell[]
  /** Override cell size (default CS). */
  cs?: number
  /** Highlight colour for outline (undefined = no highlight). */
  highlight?: string
}

export function KeyGrid({ cells, cs = CS, highlight }: KeyGridProps) {
  const { cols, rows } = bounds(cells)
  const cellSet = new Set(cells.map(([c, r]) => `${c},${r}`))

  const pad = 2
  const svgW = cols * cs + pad * 2
  const svgH = rows * cs + pad * 2

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* draw all cells in the bounding box — shaded or blank */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const shaded = cellSet.has(`${c},${r}`)
          if (!shaded) return null
          return (
            <rect
              key={`${c}-${r}`}
              x={pad + c * cs}
              y={pad + r * cs}
              width={cs}
              height={cs}
              fill={SHADED}
              stroke={GRID_INK}
              strokeWidth={1}
            />
          )
        })
      )}
      {/* outer highlight ring when selected */}
      {highlight && (
        <rect
          x={1}
          y={1}
          width={svgW - 2}
          height={svgH - 2}
          fill="none"
          stroke={highlight}
          strokeWidth={2.5}
          rx={3}
        />
      )}
    </svg>
  )
}

// ─── Keys23ECOption — choice renderer ────────────────────────────────────────

/** Aria labels per key per language. */
const KEY_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Key A: a vertical grid key of 15 shaded squares, symmetric with a hole in the upper bit.',
    id: 'Kunci A: kunci grid vertikal dengan 15 kotak arsir, simetris dengan lubang di bagian atas.',
  },
  B: {
    en: 'Key B: a grid key of 15 shaded squares with the bit extending left and right — this is the impossible key.',
    id: 'Kunci B: kunci grid dengan 15 kotak arsir yang bagiannya melebar ke kiri dan kanan — ini kunci yang tidak mungkin.',
  },
  C: {
    en: 'Key C: a grid key of 15 shaded squares with the bit extending to the right.',
    id: 'Kunci C: kunci grid dengan 15 kotak arsir yang bagiannya melebar ke kanan.',
  },
  D: {
    en: 'Key D: a narrow-topped grid key of 15 shaded squares with two prongs at the top.',
    id: 'Kunci D: kunci grid bertop sempit dengan 15 kotak arsir dan dua gigi di atas.',
  },
  E: {
    en: 'Key E: a grid key of 15 shaded squares with the bit shifted to the right side.',
    id: 'Kunci E: kunci grid dengan 15 kotak arsir yang bagiannya bergeser ke sisi kanan.',
  },
}

/**
 * Keys23ECOption — renders one A/B/C/D/E key as an SVG grid figure.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q23.
 */
export function Keys23ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as 'A' | 'B' | 'C' | 'D' | 'E'
  const cells = KEY_CELLS[k]
  const aria = KEY_ARIA[k]
  if (!cells) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <KeyGrid cells={cells} cs={CS} />
    </span>
  )
}
