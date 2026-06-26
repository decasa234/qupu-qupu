// SIMOC-23-G1-Q9 — "How many squares are there in the figure?"
//
// Figure: 4 isolated corner squares (no interior lines) + 4×4 centre grid.
//   Corner squares: 4 × 1 = 4
//   Centre 4×4 grid: 16 (1×1) + 9 (2×2) + 4 (3×3) + 1 (4×4) = 30
//   Total: 34 → answer A.
//
// Pure SVG render — no hooks, no framer-motion. SSR-safe.

import { GridBoard } from './primitives/GridBoard'

// ── shared layout constants (re-exported for the explainer) ──────────────────

/** Inner grid cell size (px). */
export const CELL = 40

/** Corner square side length = 2 × CELL (px). */
export const CORNER_SZ = 80

/** White-space gap between corner squares and centre grid (px). */
export const GAP = 10

/** Outer padding (px). */
export const PAD = 10

/** X / Y offset of the centre 4×4 grid origin. */
export const GRID_X = PAD + CORNER_SZ + GAP   // 100
export const GRID_Y = PAD + CORNER_SZ + GAP   // 100

/** Centre grid pixel dimensions. */
export const GRID_W = 4 * CELL   // 160
export const GRID_H = 4 * CELL   // 160

/** Total SVG canvas size. */
export const SVG_W = PAD + CORNER_SZ + GAP + GRID_W + GAP + CORNER_SZ + PAD   // 360
export const SVG_H = SVG_W                                                       // 360

/** Corner square top-left positions [x, y] in SVG coordinates. */
export const CORNERS = [
  { x: PAD,                          y: PAD                          },  // TL
  { x: GRID_X + GRID_W + GAP,       y: PAD                          },  // TR
  { x: PAD,                          y: GRID_Y + GRID_H + GAP        },  // BL
  { x: GRID_X + GRID_W + GAP,       y: GRID_Y + GRID_H + GAP        },  // BR
] as const

export const STROKE = '#374151'
export const FILL   = '#FFFFFF'

// ── Default export ────────────────────────────────────────────────────────────

export default function CountSquaresSIMOC23G1Q9Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Gambar yang terdiri dari empat persegi besar di setiap sudut dan satu kotak berpetak 4×4 di tengah. ' +
        'Berapa banyak persegi yang terdapat pada gambar tersebut?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL} />

        {/* 4 isolated corner squares — no interior grid lines */}
        {CORNERS.map((pos, i) => (
          <rect
            key={`corner-${i}`}
            x={pos.x}
            y={pos.y}
            width={CORNER_SZ}
            height={CORNER_SZ}
            fill={FILL}
            stroke={STROKE}
            strokeWidth={2}
          />
        ))}

        {/* centre 4×4 grid */}
        <g transform={`translate(${GRID_X}, ${GRID_Y})`}>
          <GridBoard
            rows={4}
            cols={4}
            cellSize={CELL}
            gridStroke={STROKE}
          />
        </g>
      </svg>
    </div>
  )
}
