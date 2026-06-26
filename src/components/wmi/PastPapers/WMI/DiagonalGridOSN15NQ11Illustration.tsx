// OSN-15-SD-NAS-Q11 — "Rectangle ABCD of size 8×6 consists of 48 unit squares.
// Diagonal AC passes through 3 grid lattice points: A, X, and C.
// How many points does the diagonal of a 48×36 rectangle pass through?"
//
// Stem figure: 8×6 grid with corner labels D/A/B/C, diagonal A→C, and dot
// markers at the 3 lattice intersection points (A, X, C). Answer never shown.
//
// Primitive used: GridBoard (./primitives/GridBoard) for the grid background.
// Diagonal line + lattice-point dots overlaid in the same <svg>.
// SSR-safe — no hooks, no framer-motion.

import { GridBoard } from './primitives/GridBoard'

// ── geometry constants (bound to seed: 8×6, GCD=2, points=3) ────────────────
const COLS = 8    // small squares per row
const ROWS = 6    // small squares per column
const CELL = 38   // px per cell

const GW = COLS * CELL   // 304  (grid width)
const GH = ROWS * CELL   // 228  (grid height)
const PAD = 24           // viewBox padding for corner labels

// SVG coordinate system: (0,0)=top-left=D, (GW,0)=C, (0,GH)=A, (GW,GH)=B
// Diagonal from A(0,GH) → C(GW,0)
// Lattice points: GCD(8,6)=2 → A + 1 interior + C = 3 total
// Interior point X = (GW/2, GH/2) = (152, 114)

const LATTICE_PTS: Array<{
  x: number; y: number; label: string; tx: number; ty: number
}> = [
  { x: 0,    y: GH,    label: 'A', tx: -15, ty: 14  },  // bottom-left
  { x: GW/2, y: GH/2,  label: 'X', tx: -16, ty: 0   },  // midpoint
  { x: GW,   y: 0,     label: 'C', tx: 15,  ty: -12 },  // top-right
]

// Non-diagonal corners
const CORNER_D = { x: 0,  y: 0,  label: 'D', tx: -15, ty: -12 }
const CORNER_B = { x: GW, y: GH, label: 'B', tx: 15,  ty: 14  }

const INK   = '#1F2937'
const DOT_R = 4

// ── Shared diagram (used by stem + explainer) ────────────────────────────────

export interface DiagonalGridDiagramProps {
  /** Highlight the X midpoint dot in blue (explainer beat 2). */
  highlightX?: boolean
  /** Show a GCD answer badge on the figure (explainer final beat). */
  showAnswer?: boolean
}

export function DiagonalGridDiagram({
  highlightX = false,
  showAnswer = false,
}: DiagonalGridDiagramProps) {
  const vb = `${-PAD} ${-PAD} ${GW + PAD * 2} ${GH + PAD * 2}`

  return (
    <svg
      viewBox={vb}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── grid ── */}
      <GridBoard rows={ROWS} cols={COLS} cellSize={CELL} gridStroke="#9CA3AF" />

      {/* ── diagonal A→C ── */}
      <line
        x1={0}  y1={GH}
        x2={GW} y2={0}
        stroke={INK}
        strokeWidth={2.4}
        strokeLinecap="round"
      />

      {/* ── lattice point dots ── */}
      {LATTICE_PTS.map(({ x, y, label, tx, ty }) => {
        const isX      = label === 'X'
        const dotColor = isX && highlightX ? '#2563EB' : INK
        const r        = isX && highlightX ? DOT_R + 2.5 : DOT_R

        return (
          <g key={label}>
            {isX && highlightX && (
              <circle cx={x} cy={y} r={r + 5} fill="#DBEAFE" />
            )}
            <circle cx={x} cy={y} r={r} fill={dotColor} />
            <text
              x={x + tx} y={y + ty}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              fontStyle="italic"
              fill={isX && highlightX ? '#1D4ED8' : INK}
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* ── non-diagonal corner labels D, B ── */}
      {[CORNER_D, CORNER_B].map(({ x, y, label, tx, ty }) => (
        <text
          key={label}
          x={x + tx} y={y + ty}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fontStyle="italic"
          fill={INK}
        >
          {label}
        </text>
      ))}

      {/* ── answer badge (final explainer beat) ── */}
      {showAnswer && (
        <g>
          <rect
            x={GW / 2 - 82} y={GH / 2 + 18}
            width={164} height={26}
            rx={9}
            fill="#D1FAE5"
            stroke="#10B981"
            strokeWidth={2}
          />
          <text
            x={GW / 2} y={GH / 2 + 31}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={900}
            fill="#065F46"
          >
            GCD(48,36)=12 → 12+1=13
          </text>
        </g>
      )}
    </svg>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/** OSN-15-SD-NAS-Q11 stem illustration — 8×6 grid + diagonal AC + lattice dots. */
export default function DiagonalGridOSN15NQ11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Persegi panjang ABCD berukuran 8×6 dengan diagonal AC ' +
        'yang melewati titik kisi A, X, dan C.'
      }
    >
      <DiagonalGridDiagram />
    </div>
  )
}
