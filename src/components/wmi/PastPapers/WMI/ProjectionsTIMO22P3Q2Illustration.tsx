/**
 * ProjectionsTIMO22P3Q2Illustration — TIMO-22-P3H-Q2
 *
 * "27 transparent boxes arranged in a 3×3×3 cube. Some black marbles are
 *  inserted. Given top/front/right-side projections, find the number of marbles."
 *  Answer: 7
 *
 * Source: docs/reference/ocr-res/timo/bundle/primary-3/2020-2022.md
 *   Heat Round Đề số 1 (2020-2021), Q2.
 *   Crop images: 087.jpg (top), 088.jpg (front), 089.jpg (right).
 *
 * Projection data (filled = black marble visible):
 *   Top view    : cross/diamond (4 cells) — (0,1),(1,0),(1,2),(2,1)
 *   Front view  : bottom full + centre middle (4 cells) — (1,1),(2,0),(2,1),(2,2)
 *   Right view  : staircase left-heavy (6 cells) — (0,0),(1,0),(1,1),(2,0),(2,1),(2,2)
 *
 * Primitive used: GridBoard (import-first from ./primitives/GridBoard).
 * Default export: stem illustration (problem only — does not reveal marble count).
 */

import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'

// ── Projection data ───────────────────────────────────────────────────────────

/** Top view: row = front→back (y), col = left→right (x). */
export const TOP_VIEW: readonly boolean[][] = [
  [false, true,  false],
  [true,  false, true ],
  [false, true,  false],
] as const

/** Front view: row = top→bottom (z), col = left→right (x). */
export const FRONT_VIEW: readonly boolean[][] = [
  [false, false, false],
  [false, true,  false],
  [true,  true,  true ],
] as const

/** Right-side view: row = top→bottom (z), col = front→back (y). */
export const RIGHT_VIEW: readonly boolean[][] = [
  [true,  false, false],
  [true,  true,  false],
  [true,  true,  true ],
] as const

// ── Sub-component ─────────────────────────────────────────────────────────────

const CELL = 46
const GRID_PX = 3 * CELL  // 138

interface ProjectionGridProps {
  data: readonly boolean[][]
  label: string
  /** Amber-highlight filled cells (used by explainer). */
  highlightFilled?: boolean
}

/**
 * One 3×3 projection grid using GridBoard.
 * Each filled cell is a dark square with a white circle glyph (marble silhouette).
 */
export function ProjectionGrid({ data, label, highlightFilled = false }: ProjectionGridProps) {
  const vb = gridBoardViewBox(3, 3, CELL)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox={vb} width={GRID_PX} height={GRID_PX} aria-hidden="true">
        {/* Base grid with per-cell background fill */}
        <GridBoard
          rows={3}
          cols={3}
          cellSize={CELL}
          fill={(r, c) => (data[r][c] ? (highlightFilled ? '#FEF3C7' : '#374151') : '#FFFFFF')}
          gridStroke="#6B7280"
          highlight={(r, c) => {
            if (!data[r][c]) return 'none'
            return highlightFilled ? 'amber' : 'none'
          }}
        />
        {/* Marble circles overlaid on filled cells */}
        {data.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <circle
                key={`m-${r}-${c}`}
                cx={c * CELL + CELL / 2}
                cy={r * CELL + CELL / 2}
                r={CELL * 0.32}
                fill={highlightFilled ? '#D97706' : '#1F2937'}
              />
            ) : null,
          ),
        )}
      </svg>
      {/* Caption below the grid */}
      <span
        className="font-display text-xs font-bold"
        style={{ color: '#374151' }}
      >
        {label}
      </span>
    </div>
  )
}

// ── Default export — stem illustration ────────────────────────────────────────

export default function ProjectionsTIMO22P3Q2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Tiga tampilan proyeksi kubus 3×3×3 berisi bola kelereng hitam. ' +
        'Tampak atas, tampak depan, dan tampak dari kanan. ' +
        'Hitung jumlah kelereng yang dimasukkan.'
      }
    >
      <div className="flex items-start justify-center gap-6">
        <ProjectionGrid data={TOP_VIEW}   label="Tampak Atas"   />
        <ProjectionGrid data={FRONT_VIEW} label="Tampak Depan"  />
        <ProjectionGrid data={RIGHT_VIEW} label="Tampak Kanan"  />
      </div>
    </div>
  )
}
