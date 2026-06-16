// "Which solid is piled with 13 cubes?" figure for WMI-20P1A-Q6
// (2020 WMI Semifinal Grade 1 Paper A).
//
// The original options A–D were four isometric cube stacks (images). The scan we
// have, db/seed/wmi/figures/2020-semifinal-g1-a-q6.jpg, shows option (A): a stack
// of unit cubes drawn in isometric. The other three options are not in the scan,
// so we reconstruct FOUR plausible stacks here, choosing cube counts so that only
// option D totals 13 (the seed answer); A, B and C total something else. The
// counts are DERIVED from the cube lists below, so labels and the explainer can
// never drift from what is drawn.
//
//   A = 12 cubes
//   B = 11 cubes
//   C = 10 cubes
//   D = 13 cubes  ← the answer
//
// Each stack is drawn the same isometric way as the real q6 pile. Pure render,
// SSR-safe & deterministic (no Math.random / Date, no state).

export type Cube = [number, number, number] // x = down-right, y = up-right, z = up

/** Build a solid rectangular layer of cubes at height z, spanning x in [0,nx), y in [0,ny). */
function layer(nx: number, ny: number, z: number): Cube[] {
  const out: Cube[] = []
  for (let x = 0; x < nx; x += 1) for (let y = 0; y < ny; y += 1) out.push([x, y, z])
  return out
}

// Four stacked piles. Built so D = 13, the others differ.
export const PILES: Record<'A' | 'B' | 'C' | 'D', Cube[]> = {
  // A: 2×3 base (6) + 2×2 (4) + 1×2 (2) = 12
  A: [...layer(2, 3, 0), ...layer(2, 2, 1), ...layer(1, 2, 2)],
  // B: 2×3 base (6) + 2×2 (4) + 1×1 (1) = 11
  B: [...layer(2, 3, 0), ...layer(2, 2, 1), ...layer(1, 1, 2)],
  // C: 2×2 base (4) + 2×2 (4) + 1×2 (2) = 10
  C: [...layer(2, 2, 0), ...layer(2, 2, 1), ...layer(1, 2, 2)],
  // D: 2×3 base (6) + 2×2 (4) + 1×2 (2) + 1×1 (1) = 13  ← answer
  D: [...layer(2, 3, 0), ...layer(2, 2, 1), ...layer(1, 2, 2), ...layer(1, 1, 3)],
}

export const PILE_COUNT: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: PILES.A.length,
  B: PILES.B.length,
  C: PILES.C.length,
  D: PILES.D.length,
}

export const ANSWER_LABEL: 'A' | 'B' | 'C' | 'D' = 'D'

const INK = '#1F2937'
const CUBE_TOP = '#D6F0DC'
const CUBE_LEFT = '#6FB98A'
const CUBE_RIGHT = '#A9D9BC'
const HI_TOP = '#FDE68A'
const HI_LEFT = '#E0A82E'
const HI_RIGHT = '#F4D06A'

/**
 * One isometric cube pile, projected into a fixed-size box so all four read at
 * the same scale. `highlight` swaps every cube to amber (used by the explainer).
 */
export function CubePile({ cubes, highlight = false }: { cubes: Cube[]; highlight?: boolean }) {
  const size = 22
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = (x: number, y: number, z: number) => ({ sx: (x + y) * cx, sy: (x - y) * cy - z * size })

  // Painter's order: back rows first (high y), then bottom-up (z), then x.
  const order = [...cubes].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])

  const top = highlight ? HI_TOP : CUBE_TOP
  const left = highlight ? HI_LEFT : CUBE_LEFT
  const right = highlight ? HI_RIGHT : CUBE_RIGHT

  return (
    <g>
      {order.map(([x, y, z], i) => {
        const { sx, sy } = proj(x, y, z)
        const topPts = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftPts = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightPts = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={i}>
            <polygon points={topPts} fill={top} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={leftPts} fill={left} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={rightPts} fill={right} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        )
      })}
    </g>
  )
}

// Layout: a 2×2 grid of the four labelled piles. Each pile sits in its own cell,
// shifted to its cell origin. The cell size leaves generous headroom.
const CELL_W = 210
const CELL_H = 170
export const PILE_VIEW_W = CELL_W * 2
export const PILE_VIEW_H = CELL_H * 2

// Per-cell offset that roughly centres each pile (the projected piles grow up-left,
// so we nudge them right/down inside the cell).
const CELL_DX = 70
const CELL_DY = 96

const ORDER: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']

export interface PilesFigureProps {
  /** Which option (A–D) to ring/highlight, or null. */
  highlight?: 'A' | 'B' | 'C' | 'D' | null
  /** Show the cube count under the highlighted pile. */
  showCount?: boolean
}

/** The reusable four-piles primitive. */
export function PilesFigure({ highlight = null, showCount = false }: PilesFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${PILE_VIEW_W} ${PILE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: PILE_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ORDER.map((label, idx) => {
        const col = idx % 2
        const row = Math.floor(idx / 2)
        const ox = col * CELL_W + CELL_DX
        const oy = row * CELL_H + CELL_DY
        const isHi = highlight === label
        return (
          <g key={label}>
            {/* cell label */}
            <text x={col * CELL_W + 18} y={row * CELL_H + 28} fontSize={20} fontWeight={900} fill={INK}>
              {`(${label})`}
            </text>
            <g transform={`translate(${ox} ${oy})`}>
              <CubePile cubes={PILES[label]} highlight={isHi} />
            </g>
            {/* selection ring around the cell */}
            {isHi && (
              <rect
                x={col * CELL_W + 6}
                y={row * CELL_H + 6}
                width={CELL_W - 12}
                height={CELL_H - 12}
                rx={10}
                fill="none"
                stroke="#10B981"
                strokeWidth={3.5}
              />
            )}
            {isHi && showCount && (
              <g>
                <rect
                  x={col * CELL_W + CELL_W - 76}
                  y={row * CELL_H + 14}
                  width={62}
                  height={28}
                  rx={7}
                  fill="#FFFFFF"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <text
                  x={col * CELL_W + CELL_W - 76 + 31}
                  y={row * CELL_H + 14 + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill="#065F46"
                >
                  {`${PILE_COUNT[label]}`}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G1Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four isometric piles of unit cubes labelled A, B, C and D. Find the pile made of 13 cubes."
    >
      <PilesFigure />
    </div>
  )
}
