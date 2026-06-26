// DiagShadedRectSASMO20G3Q21Illustration.tsx
//
// SASMO-20-G3-Q21 — "Jika luas persegi panjang adalah 96 cm², berapakah luas
// (dalam cm²) daerah yang diarsir?"
// Answer: 48
//
// Source figure (2019-2020.imgs/048.jpg): a 6×4 unit-square grid where the
// shaded region is a large triangle with vertices at the bottom-left corner,
// the midpoint of the top edge, and the bottom-right corner. The triangle
// covers exactly half the rectangle (12 out of 24 unit squares = 48 cm²).
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

const COLS = 6
const ROWS = 4
const CELL = 36          // px per unit square
const PAD = 8            // canvas padding
const STROKE = 1.6

const W = COLS * CELL    // 216
const H = ROWS * CELL    // 144
const VW = W + PAD * 2   // 232
const VH = H + PAD * 2   // 160

// Triangle vertices in canvas coordinates (origin = top-left of the grid area)
const TRI_X0 = PAD + 0        // bottom-left  (grid x=0, y=ROWS)
const TRI_Y0 = PAD + H
const TRI_X1 = PAD + W / 2   // top-center   (grid x=COLS/2, y=0)
const TRI_Y1 = PAD + 0
const TRI_X2 = PAD + W        // bottom-right (grid x=COLS, y=ROWS)
const TRI_Y2 = PAD + H

const SHADE = '#b0a4d4'       // purple-lavender fill (house style)
const GRID_STROKE = '#5c4fa0' // darker purple for lines
const RECT_STROKE = '#1a3a6b'

// Shared figure component — reused by the explainer to keep state trivial.
export interface DiagShadedRectFigureProps {
  /** When true, draws a highlight ring over the shaded triangle. */
  highlightShaded?: boolean
  /** When true, draws a faint highlight over the whole grid. */
  highlightAll?: boolean
}

export function DiagShadedRectFigure({
  highlightShaded = false,
  highlightAll = false,
}: DiagShadedRectFigureProps) {
  const triPts = `${TRI_X0},${TRI_Y0} ${TRI_X1},${TRI_Y1} ${TRI_X2},${TRI_Y2}`

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Optional whole-grid highlight */}
      {highlightAll && (
        <rect
          x={PAD} y={PAD} width={W} height={H}
          fill="rgba(99,102,241,0.12)"
        />
      )}

      {/* Shaded triangle */}
      <polygon
        points={triPts}
        fill={SHADE}
      />

      {/* Optional highlight ring on the shaded region */}
      {highlightShaded && (
        <polygon
          points={triPts}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )}

      {/* Grid lines (vertical) */}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line
          key={`v${c}`}
          x1={PAD + c * CELL} y1={PAD}
          x2={PAD + c * CELL} y2={PAD + H}
          stroke={GRID_STROKE}
          strokeWidth={STROKE}
        />
      ))}

      {/* Grid lines (horizontal) */}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line
          key={`h${r}`}
          x1={PAD} y1={PAD + r * CELL}
          x2={PAD + W} y2={PAD + r * CELL}
          stroke={GRID_STROKE}
          strokeWidth={STROKE}
        />
      ))}

      {/* Outer rectangle border (on top) */}
      <rect
        x={PAD} y={PAD} width={W} height={H}
        fill="none"
        stroke={RECT_STROKE}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — static stem illustration (no answer revealed)
// ---------------------------------------------------------------------------

export default function DiagShadedRectSASMO20G3Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Persegi panjang dibagi menjadi kisi 6×4 petak. Daerah yang diarsir ' +
        'adalah segitiga besar dengan titik sudut di pojok kiri bawah, ' +
        'titik tengah tepi atas, dan pojok kanan bawah. Hitung luasnya.'
      }
    >
      <DiagShadedRectFigure />
    </div>
  )
}
