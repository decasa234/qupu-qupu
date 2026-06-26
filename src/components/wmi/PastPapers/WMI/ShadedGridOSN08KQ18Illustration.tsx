/**
 * OSN-08-SD-KAB-Q18 — Stem illustration.
 * Grid 4 cols × 5 rows; each unit square = 5 cm².
 * Shaded polygon covers exactly 7.5 unit squares → 37.5 cm².
 *
 * Polygon vertices (grid units):
 *   (0,2) (1,0) (2,1) (4,2) (2,3) (2,5) (1,5) (1,2)
 * Shoelace area = 7.5 → answer 7.5 × 5 = 37.5 cm².
 *
 * Uses GridBoard primitive for the background grid.
 */

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

const CELL = 50
// Polygon points in SVG pixels (vertex col × 50, row × 50):
export const SHADED_PTS = '0,100 50,0 100,50 200,100 100,150 100,250 50,250 50,100'

// ── Shared SVG — reused by the explainer ─────────────────────────────────────

export function ShadedGridFigureOSN08KQ18({
  fillOverride,
}: {
  fillOverride?: string
}) {
  const vb = gridBoardViewBox(5, 4, CELL) // "0 0 200 250"

  return (
    <svg
      viewBox={vb}
      width="200"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <pattern
          id="hatch-q18"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1d3461" strokeWidth="1.5" />
        </pattern>
      </defs>

      {/* Background grid */}
      <GridBoard rows={5} cols={4} cellSize={CELL} gridStroke="#2563EB" />

      {/* Shaded polygon */}
      <polygon
        points={SHADED_PTS}
        fill={fillOverride ?? 'url(#hatch-q18)'}
        stroke="#1d3461"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Default export — stem illustration ───────────────────────────────────────

export default function ShadedGridOSN08KQ18Illustration() {
  return (
    <div className="flex justify-center py-2">
      <ShadedGridFigureOSN08KQ18 />
    </div>
  )
}
