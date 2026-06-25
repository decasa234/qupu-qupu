// Illustration for SEAMO-2020-Paper-B-Q20 (count all squares in a 4×4 grid).
// The stem shows a plain 4×4 grid — identical to the original figure in the paper
// (OCR crop: docs/reference/ocr-res/seamo/contest/paper-b/2020.imgs/019.jpg).
//
// Primitive used: GridBoard (./primitives/GridBoard) — wraps it in <svg>.
// No answer shown in the stem; the explainer reveals counts per size.

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

const ROWS = 4
const COLS = 4
const CELL = 60

export default function GridCount20B20Illustration() {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Kisi 4 × 4 — hitung semua persegi dari setiap ukuran."
    >
      <svg
        viewBox={vb}
        width="100%"
        style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <GridBoard
          rows={ROWS}
          cols={COLS}
          cellSize={CELL}
          gridStroke="#374151"
        />
      </svg>
    </div>
  )
}

// ── Shared figure primitive for the explainer ────────────────────────────────

export interface GridCount20B20FigureProps {
  /**
   * Which square-size to highlight with a coloured overlay:
   * null = no overlay (intro beat).
   * 1 = all 1×1 cells tinted amber.
   * 2 = one representative 2×2 ring (top-left).
   * 3 = one representative 3×3 ring (top-left).
   * 4 = the whole 4×4 ring.
   */
  highlightSize?: 1 | 2 | 3 | 4 | null
}

/** Plain 4×4 grid with optional size-class overlay — used by the explainer. */
export function GridCount20B20Figure({ highlightSize = null }: GridCount20B20FigureProps) {
  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  const W = COLS * CELL
  const H = ROWS * CELL

  // Overlay rect: top-left corner (0,0) square of given size
  const overlaySize = highlightSize ?? 0
  const overlayPx = overlaySize * CELL

  const AMBER = '#F59E0B'
  const BLUE  = '#3B82F6'
  const GREEN = '#10B981'

  const strokeColor =
    overlaySize === 1 ? AMBER :
    overlaySize === 2 ? '#6366F1' :
    overlaySize === 3 ? BLUE :
    overlaySize === 4 ? GREEN :
    'none'

  const tintFill =
    overlaySize === 1 ? '#FEF3C7' :
    overlaySize === 2 ? '#EEF2FF' :
    overlaySize === 3 ? '#DBEAFE' :
    overlaySize === 4 ? '#D1FAE5' :
    'none'

  return (
    <svg
      viewBox={`-2 -2 ${W + 4} ${H + 4}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* base grid */}
      <GridBoard
        rows={ROWS}
        cols={COLS}
        cellSize={CELL}
        gridStroke="#374151"
        fill={
          overlaySize === 1
            ? () => '#FEF3C7'   // tint ALL cells for 1×1 count
            : undefined
        }
      />

      {/* representative square overlay for size 2, 3, or 4 */}
      {overlaySize >= 2 && overlaySize <= 4 && (
        <rect
          x={1}
          y={1}
          width={overlayPx - 2}
          height={overlayPx - 2}
          fill={tintFill}
          stroke={strokeColor}
          strokeWidth={4}
          rx={3}
          fillOpacity={0.55}
        />
      )}
    </svg>
  )
}
