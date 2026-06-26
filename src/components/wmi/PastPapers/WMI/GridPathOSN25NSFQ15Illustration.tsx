// OSN-25-SD-NAS-SEMIFINAL-Q15 — robot lattice-path grid
//
// STEM ILLUSTRATION: 4 × 3 cell grid (5 × 4 intersections).
// A = (col 0, row 0) bottom-left (blue dot)
// B = (col 4, row 3) top-right  (blue dot)
// P = (col 2, row 2)            (red dot, forbidden)
// Robot moves only East (Timur) or North (Utara).
//
// Math: total paths C(7,3) = 35; through P = C(4,2)×C(3,1) = 18; answer = 17.
//
// Co-exports GridPathGrid (+ GridBubble type) for use in the explainer.
// SSR-safe: no hooks, no framer-motion.

const CELL = 52              // px per grid cell
const COLS = 4
const ROWS = 3
const ML = 44                // left margin
const MT = 38                // top margin
const MB = 44                // bottom margin
const COMPASS_W = 88         // right area for compass rose

export const SVG_W = ML + COLS * CELL + COMPASS_W  // 44 + 208 + 88 = 340
export const SVG_H = MT + ROWS * CELL + MB          // 38 + 156 + 44 = 238

// Convert grid (col, row) to SVG coordinates; row 0 = bottom.
function gx(col: number) { return ML + col * CELL }
function gy(row: number) { return MT + (ROWS - row) * CELL }

const PT_A = { col: 0, row: 0 }
const PT_B = { col: 4, row: 3 }
const PT_P = { col: 2, row: 2 }

// ── types ─────────────────────────────────────────────────────────────────────

export interface GridBubble {
  label: string
  fill?: string
  stroke?: string
  textFill?: string
}

export interface GridPathGridProps {
  /** Bubbles at specific intersections. Key = "col,row". */
  bubbles?: Record<string, GridBubble>
  /** If true, render a red × through P (forbidden). */
  forbiddenP?: boolean
  /** Show compass rose in right margin. Default true. */
  showCompass?: boolean
}

// ── shared grid component ─────────────────────────────────────────────────────

export function GridPathGrid({
  bubbles = {},
  forbiddenP = false,
  showCompass = true,
}: GridPathGridProps) {
  const cx = gx(PT_P.col)
  const cy = gy(PT_P.row)
  // Compass: centred in the right margin, vertically near middle
  const compassX = ML + COLS * CELL + COMPASS_W / 2
  const compassY = MT + ROWS * CELL / 2

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Grid horizontal lines */}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line
          key={'h' + r}
          x1={gx(0)}    y1={gy(r)}
          x2={gx(COLS)} y2={gy(r)}
          stroke="#CBD5E1" strokeWidth={1.5}
        />
      ))}

      {/* Grid vertical lines */}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line
          key={'v' + c}
          x1={gx(c)} y1={gy(0)}
          x2={gx(c)} y2={gy(ROWS)}
          stroke="#CBD5E1" strokeWidth={1.5}
        />
      ))}

      {/* Intersection bubbles */}
      {Object.entries(bubbles).map(([key, bub]) => {
        const [col, row] = key.split(',').map(Number)
        const bx = gx(col)
        const by = gy(row)
        return (
          <g key={key}>
            <circle
              cx={bx} cy={by} r={15}
              fill={bub.fill ?? '#EFF6FF'}
              stroke={bub.stroke ?? '#3B82F6'}
              strokeWidth={1.8}
            />
            <text
              x={bx} y={by}
              textAnchor="middle" dominantBaseline="central"
              fontSize={12} fontWeight={800}
              fontFamily="system-ui, sans-serif"
              fill={bub.textFill ?? '#1D4ED8'}
            >
              {bub.label}
            </text>
          </g>
        )
      })}

      {/* Point P */}
      <circle cx={cx} cy={cy} r={9} fill="#FEE2E2" stroke="#EF4444" strokeWidth={2.5} />
      {forbiddenP && (
        <>
          <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5}
            stroke="#DC2626" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5}
            stroke="#DC2626" strokeWidth={2.2} strokeLinecap="round" />
        </>
      )}
      <text
        x={cx} y={cy - 18}
        textAnchor="middle" fontSize={14} fontWeight={800}
        fontFamily="system-ui, sans-serif" fill="#DC2626"
      >P</text>

      {/* Point A */}
      <circle
        cx={gx(PT_A.col)} cy={gy(PT_A.row)} r={9}
        fill="#1D4ED8" stroke="#1E3A8A" strokeWidth={2}
      />
      <text
        x={gx(PT_A.col)} y={gy(PT_A.row) + 20}
        textAnchor="middle" fontSize={14} fontWeight={800}
        fontFamily="system-ui, sans-serif" fill="#1D4ED8"
      >A</text>

      {/* Point B */}
      <circle
        cx={gx(PT_B.col)} cy={gy(PT_B.row)} r={9}
        fill="#1D4ED8" stroke="#1E3A8A" strokeWidth={2}
      />
      <text
        x={gx(PT_B.col)} y={gy(PT_B.row) - 18}
        textAnchor="middle" fontSize={14} fontWeight={800}
        fontFamily="system-ui, sans-serif" fill="#1D4ED8"
      >B</text>

      {/* Compass rose (right margin) */}
      {showCompass && (
        <g transform={`translate(${compassX}, ${compassY})`}>
          {/* North arrow */}
          <line x1={0} y1={0} x2={0} y2={-26} stroke="#64748B" strokeWidth={2} />
          <polygon points="0,-30 -4,-22 4,-22" fill="#64748B" />
          <text x={0} y={-36}
            textAnchor="middle" fontSize={11} fontWeight={700}
            fontFamily="system-ui, sans-serif" fill="#475569">U</text>
          {/* East arrow */}
          <line x1={0} y1={0} x2={26} y2={0} stroke="#64748B" strokeWidth={2} />
          <polygon points="30,0 22,-4 22,4" fill="#64748B" />
          <text x={38} y={4}
            textAnchor="middle" fontSize={11} fontWeight={700}
            fontFamily="system-ui, sans-serif" fill="#475569">T</text>
          {/* Centre */}
          <circle cx={0} cy={0} r={3} fill="#64748B" />
        </g>
      )}
    </svg>
  )
}

// ── default export: static stem illustration ──────────────────────────────────

export default function GridPathOSN25NSFQ15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Kisi 4×3 dengan titik A di sudut kiri-bawah, B di sudut kanan-atas, dan titik P terlarang di posisi (2,2). Robot hanya bisa bergerak ke Timur atau Utara."
    >
      <GridPathGrid />
    </div>
  )
}
