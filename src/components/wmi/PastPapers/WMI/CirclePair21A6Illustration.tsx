// SEAMO-21-A-Q6 — "Which of the following comes next?"
//
// A 3×3 visual matrix where each cell shows two circles (one large, one small;
// one filled/gray, one open/white) connected by a short line. The 9th cell is
// the missing piece. The answer is C (small filled on top, large open below).
//
// Each cell is described by:
//   largeColor: 'filled' | 'open'   — the large circle's fill
//   smallPos:   'top' | 'bottom' | 'left' | 'right'  — where the small circle sits
//   orientation: 'vertical' | 'horizontal'
//   smallFilled: boolean
//
// Pattern read from image 007.jpg:
//   Row 1: [open-large-top,   small-filled-bot-right,  vertical ]   (large open at top-left of pair, small filled below-right)
//          [small-open-left,  large-filled-right,      horizontal]
//          [small-filled-top, large-open-bottom,       vertical  ]  <- col3 row1
//   Row 2: [large-filled-left, small-open-right,       horizontal]
//          [large-filled-top,  small-filled-bottom,    vertical  ]
//          [small-filled-left, large-open-right,       horizontal]
//   Row 3: [small-open-top,   large-filled-bottom,    vertical  ]
//          [large-open-left,  small-filled-right,      horizontal]
//          [?] → answer C = small-filled-top + large-open-bottom (vertical)
//
// Pure SVG, no hooks, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Cell descriptor
// ---------------------------------------------------------------------------

type CellDef = {
  /** Direction the two circles sit relative to each other */
  dir: 'vertical' | 'horizontal'
  /** Which end has the large circle (start = top for vert, left for horiz) */
  largePosIsStart: boolean
  /** Is the large circle filled (gray)? */
  largeFilled: boolean
  /** Is the small circle filled (gray)? */
  smallFilled: boolean
}

// Size constants
const LR = 18   // large circle radius
const SR = 9    // small circle radius
const GAP = 6   // gap between circle edges (line spans this)
const CELL = 70 // cell size in the grid (square)
const PAD_CELL = 4

// Colours
const FILLED_COL = '#6B7280'   // gray-500
const OPEN_COL   = '#FFFFFF'
const STROKE_COL = '#1F2937'   // gray-900
const LINE_COL   = '#1F2937'

// ---------------------------------------------------------------------------
// CirclePair — renders one dumbbell figure in a fixed 70×70 viewBox
// ---------------------------------------------------------------------------

interface CirclePairProps extends CellDef {
  width?: number
  height?: number
  /** If true, render a "?" label instead of circles */
  isQuestion?: boolean
}

function CirclePair({
  dir,
  largePosIsStart,
  largeFilled,
  smallFilled,
  width = CELL,
  height = CELL,
  isQuestion = false,
}: CirclePairProps) {
  const cx = CELL / 2
  const cy = CELL / 2

  if (isQuestion) {
    return (
      <svg viewBox={`0 0 ${CELL} ${CELL}`} width={width} height={height} aria-hidden="true">
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={28}
          fontWeight="bold"
          fill={STROKE_COL}
        >
          ?
        </text>
      </svg>
    )
  }

  // Centre of the large circle and the small circle, based on direction + order
  // Total span along the axis: LR + GAP + SR*2 + LR = LR + GAP + SR + SR
  // We centre the whole group on cx/cy
  // Along axis: LR (half of large) + GAP + SR (half of small)
  const span = LR + GAP + SR   // distance between centres
  let lx: number, ly: number, sx: number, sy: number

  if (dir === 'vertical') {
    // Large is at top (start) or bottom (end)
    const topCY  = cy - span / 2
    const botCY  = cy + span / 2
    lx = cx; ly = largePosIsStart ? topCY : botCY
    sx = cx; sy = largePosIsStart ? botCY : topCY
  } else {
    // Large is at left (start) or right (end)
    const leftCX  = cx - span / 2
    const rightCX = cx + span / 2
    lx = largePosIsStart ? leftCX : rightCX;  ly = cy
    sx = largePosIsStart ? rightCX : leftCX;  sy = cy
  }

  const largeFill = largeFilled ? FILLED_COL : OPEN_COL
  const smallFill = smallFilled ? FILLED_COL : OPEN_COL

  // Line connects edges of the two circles
  // Direction vector from large to small
  const dx = sx - lx
  const dy = sy - ly
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / dist
  const uy = dy / dist

  const lineX1 = lx + ux * LR
  const lineY1 = ly + uy * LR
  const lineX2 = sx - ux * SR
  const lineY2 = sy - uy * SR

  return (
    <svg viewBox={`0 0 ${CELL} ${CELL}`} width={width} height={height} aria-hidden="true">
      {/* connecting line */}
      <line
        x1={lineX1} y1={lineY1}
        x2={lineX2} y2={lineY2}
        stroke={LINE_COL}
        strokeWidth={1.8}
      />
      {/* large circle */}
      <circle
        cx={lx} cy={ly} r={LR}
        fill={largeFill}
        stroke={STROKE_COL}
        strokeWidth={2}
      />
      {/* small circle */}
      <circle
        cx={sx} cy={sy} r={SR}
        fill={smallFill}
        stroke={STROKE_COL}
        strokeWidth={1.8}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Grid data — 9 cells, last one is the question mark
// Reading positions from image 007.jpg (rows top→bottom, cols left→right)
// ---------------------------------------------------------------------------

const CELLS: (CellDef | null)[] = [
  // Row 1
  { dir: 'vertical',   largePosIsStart: true,  largeFilled: false, smallFilled: true  }, // r1c1: large open top, small filled bot
  { dir: 'horizontal', largePosIsStart: false, largeFilled: true,  smallFilled: false }, // r1c2: small open left, large filled right
  { dir: 'vertical',   largePosIsStart: false, largeFilled: false, smallFilled: true  }, // r1c3: small filled top, large open bot
  // Row 2
  { dir: 'horizontal', largePosIsStart: true,  largeFilled: true,  smallFilled: false }, // r2c1: large filled left, small open right
  { dir: 'vertical',   largePosIsStart: true,  largeFilled: true,  smallFilled: true  }, // r2c2: large filled top, small filled bot
  { dir: 'horizontal', largePosIsStart: false, largeFilled: false, smallFilled: true  }, // r2c3: small filled left, large open right
  // Row 3
  { dir: 'vertical',   largePosIsStart: false, largeFilled: true,  smallFilled: false }, // r3c1: small open top, large filled bot
  { dir: 'horizontal', largePosIsStart: true,  largeFilled: false, smallFilled: true  }, // r3c2: large open left, small filled right
  null, // r3c3 = ? (question mark cell)
]

// Grid layout
const COLS = 3
const GRID_PAD = 8
const GRID_GAP = 4
const GRID_W = COLS * CELL + (COLS - 1) * GRID_GAP + 2 * GRID_PAD
const GRID_H = 3 * CELL + 2 * GRID_GAP + 2 * GRID_PAD

// ---------------------------------------------------------------------------
// Stem illustration — 3×3 grid with "?" in the last cell
// ---------------------------------------------------------------------------

/**
 * CirclePair21A6Illustration — 3×3 pattern matrix for SEAMO 2021 A Q6.
 * The bottom-right cell is the "?" to be completed.
 */
export default function CirclePair21A6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 3-by-3 pattern matrix. Each cell shows a large circle and a small circle ' +
        'connected by a line. The bottom-right cell is missing — choose which circle ' +
        'pair comes next (answer C: small filled circle on top, large open circle below).'
      }
    >
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        width={GRID_W}
        height={GRID_H}
        aria-hidden="true"
        style={{ maxWidth: '100%', display: 'block' }}
      >
        {CELLS.map((cell, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const x = GRID_PAD + col * (CELL + GRID_GAP)
          const y = GRID_PAD + row * (CELL + GRID_GAP)
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              {cell === null ? (
                <CirclePair
                  dir="vertical"
                  largePosIsStart={false}
                  largeFilled={false}
                  smallFilled={true}
                  isQuestion={true}
                />
              ) : (
                <CirclePair {...cell} />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option data — A through E
// Read from images 008–012.jpg
// ---------------------------------------------------------------------------

// A (008.jpg): large open circle top, small filled circle bottom (vertical, large-open-start)
// B (009.jpg): small open circle left, large filled circle right (horizontal, large-right = NOT start)
// C (010.jpg): small filled top, large open bottom (vertical, large-NOT-start) ← ANSWER
// D (011.jpg): large filled left, small open right (horizontal, large-left = start)
// E (012.jpg): large filled top, small open bottom (vertical, large-start, BOTH large-filled and small-open)

const OPTION_DEFS: Record<string, CellDef> = {
  A: { dir: 'vertical',   largePosIsStart: true,  largeFilled: false, smallFilled: true  },
  B: { dir: 'horizontal', largePosIsStart: false, largeFilled: true,  smallFilled: false },
  C: { dir: 'vertical',   largePosIsStart: false, largeFilled: false, smallFilled: true  },
  D: { dir: 'horizontal', largePosIsStart: true,  largeFilled: true,  smallFilled: false },
  E: { dir: 'vertical',   largePosIsStart: true,  largeFilled: true,  smallFilled: false },
}

const OPTION_ARIA: Record<string, string> = {
  A: 'Option A: large open circle on top, small filled circle below, connected by a line.',
  B: 'Option B: small open circle on the left, large filled circle on the right, connected by a line.',
  C: 'Option C: small filled circle on top, large open circle below, connected by a line.',
  D: 'Option D: large filled circle on the left, small open circle on the right, connected by a line.',
  E: 'Option E: large filled circle on top, small open circle below, connected by a line.',
}

/**
 * CirclePair21A6Option — renders one A–E choice as a circle-pair figure.
 * Registered in CHOICE_RENDERERS for SEAMO-21-A-Q6.
 */
export function CirclePair21A6Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label?.trim().toUpperCase() ?? ''
  const def = OPTION_DEFS[k]
  if (!def) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={OPTION_ARIA[k] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: PAD_CELL }}
    >
      <CirclePair {...def} width={80} height={80} />
    </span>
  )
}
