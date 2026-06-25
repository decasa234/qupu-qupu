// Stem illustration for HKIMO-18-P3H-Q16
// "How many squares are there in the figure below?"
//
// Figure: a 4×4 grid of unit squares.
// Count by size: 1×1→16, 2×2→9, 3×3→4, 4×4→1 → total 30.
//
// Adapted from CountSquares22A8Illustration (same edge-enumeration + highlight
// approach). No picture options (fill_in answer).
// SSR-safe: no hooks, no framer-motion.

// ── Grid constants ────────────────────────────────────────────────────────────

export const GRID_N = 4   // 4×4 grid
const CELL   = 52
const PAD    = 18
export const VIEW_W = PAD * 2 + GRID_N * CELL   // 244
export const VIEW_H = PAD * 2 + GRID_N * CELL   // 244

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

// ── Square enumeration ────────────────────────────────────────────────────────

export interface SquareEntry { size: number; r: number; c: number }

export function allSquares(): SquareEntry[] {
  const out: SquareEntry[] = []
  for (let size = 1; size <= GRID_N; size++) {
    for (let r = 0; r <= GRID_N - size; r++) {
      for (let c = 0; c <= GRID_N - size; c++) {
        out.push({ size, r, c })
      }
    }
  }
  return out
}

export const SQUARES = allSquares()
export const SQUARE_TOTAL = SQUARES.length  // 30

export const SQUARES_BY_SIZE: { size: number; items: SquareEntry[] }[] =
  Array.from({ length: GRID_N }, (_, i) => {
    const size = i + 1
    return { size, items: SQUARES.filter(s => s.size === size) }
  })

// ── Colour palette (one per square size) ─────────────────────────────────────

const SIZE_COLORS: Record<number, { stroke: string; fill: string }> = {
  1: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.18)' },
  2: { stroke: '#D97706', fill: 'rgba(217,119,6,0.18)' },
  3: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.18)' },
  4: { stroke: '#10B981', fill: 'rgba(16,185,129,0.18)' },
}

export function sizeColor(size: number) {
  return SIZE_COLORS[size] ?? SIZE_COLORS[1]
}

// ── Shared figure component ───────────────────────────────────────────────────

export interface GridCountHK18P3Q16FigureProps {
  /** Highlight every square of this size during the tally animation. */
  highlightSize?: number | null
}

export function GridCountHK18P3Q16Figure({
  highlightSize = null,
}: GridCountHK18P3Q16FigureProps) {
  const highlights = highlightSize != null
    ? SQUARES.filter(s => s.size === highlightSize)
    : []

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Highlight fills — drawn beneath grid lines */}
      {highlights.map((s, i) => {
        const col = sizeColor(s.size)
        return (
          <rect
            key={`hl-${i}`}
            x={gx(s.c)}
            y={gy(s.r)}
            width={s.size * CELL}
            height={s.size * CELL}
            fill={col.fill}
            stroke={col.stroke}
            strokeWidth={3}
            rx={1}
          />
        )
      })}

      {/* 4×4 grid: horizontal lines (y = 0..GRID_N) */}
      {Array.from({ length: GRID_N + 1 }, (_, y) => (
        <line
          key={`h-${y}`}
          x1={gx(0)} y1={gy(y)}
          x2={gx(GRID_N)} y2={gy(y)}
          stroke="#1F2937"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      ))}

      {/* 4×4 grid: vertical lines (x = 0..GRID_N) */}
      {Array.from({ length: GRID_N + 1 }, (_, x) => (
        <line
          key={`v-${x}`}
          x1={gx(x)} y1={gy(0)}
          x2={gx(x)} y2={gy(GRID_N)}
          stroke="#1F2937"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      ))}
    </svg>
  )
}

// ── Default export: stem illustration ─────────────────────────────────────────

export default function GridCountHK18P3Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A 4×4 grid of unit squares. Count squares of every size to find the total of ${SQUARE_TOTAL}.`}
    >
      <GridCountHK18P3Q16Figure />
    </div>
  )
}
