// Stem illustration for OSN-25-SD-NAS-FINAL-Q15
// "3×3 grid with 4 coloured regions; sum of 3 numbers on each side = 10;
//  grey region fixed at (5,5); count valid completions."
//
// Grid layout:
//   [grey ][grey ][ red ]
//   [blue ][ X  ][ red ]
//   [blue ][green][green]
// where X = white centre (no number).
//
// Grey cells are pre-filled with "5"; other coloured cells show "?".
// The illustration shows only the problem, not the answer.
//
// Primitive: GridBoard from './primitives/GridBoard'
// SSR-safe: no hooks, no framer-motion.

import { GridBoard } from './primitives/GridBoard'

const CELL = 68    // SVG units per cell
const PAD  = 20    // padding around grid

// Region fill colours (matches original coloured-square image)
const GREY_FILL  = '#94A3B8'   // slate-400
const RED_FILL   = '#FCA5A5'   // red-300
const BLUE_FILL  = '#93C5FD'   // blue-300
const GREEN_FILL = '#86EFAC'   // green-300
const WHITE_FILL = '#FFFFFF'

function cellFill(r: number, c: number): string {
  if (r === 0 && c <= 1) return GREY_FILL
  if (r === 0 && c === 2) return RED_FILL
  if (r === 1 && c === 0) return BLUE_FILL
  if (r === 1 && c === 1) return WHITE_FILL
  if (r === 1 && c === 2) return RED_FILL
  if (r === 2 && c === 0) return BLUE_FILL
  if (r === 2 && c >= 1) return GREEN_FILL
  return WHITE_FILL
}

function cellLabel(r: number, c: number): string {
  if (r === 0 && c <= 1) return '5'   // grey region: pair (5,5)
  if (r === 1 && c === 1) return ''    // centre: blank
  return '?'                           // other coloured cells
}

const GRID_W = 3 * CELL   // 204
const GRID_H = 3 * CELL   // 204
const VW = GRID_W + PAD * 2   // 244
const VH = GRID_H + PAD * 2   // 244

export default function ColorGridOSN25NFQ15Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[260px]"
      role="img"
      aria-label="Kotak 3×3 empat warna: abu-abu berisi (5,5), petak lain bertanda tanya, pusat kosong"
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-hidden="true">
        {/* outer border to emphasise it is a closed square */}
        <rect
          x={PAD - 1}
          y={PAD - 1}
          width={GRID_W + 2}
          height={GRID_H + 2}
          fill="none"
          stroke="#1E293B"
          strokeWidth={2.5}
          rx={2}
        />
        <g transform={`translate(${PAD},${PAD})`}>
          <GridBoard
            rows={3}
            cols={3}
            cellSize={CELL}
            fill={cellFill}
            label={cellLabel}
            gridStroke="#475569"
          />
        </g>
      </svg>
    </div>
  )
}
