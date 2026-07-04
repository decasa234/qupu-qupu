// WMI-25F1A-Q7 (2025 Grade 1 Final) — "translate the boat" figure.
//
// Several paper-boat figures sit on a grid. One boat (A) is the MOVING boat,
// circled with a dashed ring. The others are fixed. The learner slides
// (translates — no rotation, no flip) boat A across the grid and counts how
// many of the other boats it can land exactly on top of.
//
// A translation preserves orientation AND size, so A can only cover a boat that
// is congruent to it AND oriented the same way. Reading the scan
// (db/seed/wmi/figures/2025-final-g1-a-q7.jpg) the boats are:
//
//   A   — upright boat, sail = right-triangle with the VERTICAL edge on the
//          LEFT (hypotenuse slopes down-right). (the mover, circled top-left)
//   b2  — upright but the sail is MIRRORED (vertical edge on the RIGHT,
//          hypotenuse slopes down-left)     → a slide can't flip  [bottom-left]
//   b3  — rotated (tilted dart)             → wrong orientation   [top]
//   b4  — IDENTICAL to A → a translate of A lands exactly on it   [MATCH, middle]
//   b5  — wider / larger boat               → wrong size          [top, right of centre]
//   b6  — rotated (tilted dart)             → wrong orientation   [bottom]
//   b7  — rotated (points left)             → wrong orientation   [middle right]
//   b8  — IDENTICAL to A → a translate of A lands exactly on it   [MATCH, top-right]
//   b9  — tall narrow sail (2 cells high)   → wrong size          [bottom-right]
//
// So exactly TWO boats (b4, b8) are reachable by a pure slide → answer 2 (B).
//
// This file draws ONLY the problem (the boats on the grid). It never shows the
// slide arrow or marks the answer — that is the animator's job, which it does by
// driving the co-exported BoatTranslate25G1 primitive with litBoats / showSlide.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

/** Orientation/shape families seen on the grid. */
type BoatKind =
  | 'standard' // A's shape: hull 3 wide, sail vertical-edge-left (the mover + its matches)
  | 'mirrored' // A's shape but the sail is flipped (vertical edge on the RIGHT)
  | 'tiltRight' // rotated dart, pointing down-right
  | 'tiltLeft' // rotated dart, pointing down-left
  | 'pointLeft' // small boat rotated to point left
  | 'wide' // larger / wider boat
  | 'tallSail' // upright but a tall narrow sail

interface BoatSpec {
  /** Stable id; index in this array is the litBoats index. */
  id: string
  /** Top-left grid cell the boat's bounding cell anchors to (col, row). */
  col: number
  row: number
  kind: BoatKind
  /** True for the single MOVING boat (gets the dashed ring + "A"). */
  mover?: boolean
}

// Layout transcribed from the scan onto an 18 x 5 grid (col, row are the
// boat's anchor cell; the shape is drawn relative to that anchor in cell units).
const BOATS: ReadonlyArray<BoatSpec> = [
  { id: 'A', col: 1, row: 1.6, kind: 'standard', mover: true },
  { id: 'b2', col: 3.1, row: 2.6, kind: 'mirrored' },
  { id: 'b3', col: 4.6, row: 0.5, kind: 'tiltRight' },
  { id: 'b4', col: 6.5, row: 1.9, kind: 'standard' },
  { id: 'b5', col: 8.6, row: 0.4, kind: 'wide' },
  { id: 'b6', col: 9.3, row: 2.4, kind: 'tiltLeft' },
  { id: 'b7', col: 11.8, row: 1.5, kind: 'pointLeft' },
  { id: 'b8', col: 13.3, row: 0.3, kind: 'standard' },
  { id: 'b9', col: 14.9, row: 1.7, kind: 'tallSail' },
]

/** Indices (into BOATS) of the boats a pure translation of A lands on. */
export const BOAT_MATCHES: ReadonlyArray<number> = [
  BOATS.findIndex((b) => b.id === 'b4'),
  BOATS.findIndex((b) => b.id === 'b8'),
]

export const BOAT_ANSWER = BOAT_MATCHES.length // 2

const GRID_COLS = 18
const GRID_ROWS = 5
const CELL = 22
const PAD = 14
const VIEW_W = GRID_COLS * CELL + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2

// ink for the boat outlines — qupu-brand-blue-shadow ('#263B55') gives the dark
// paper-fold outline without a raw hex literal in the markup.
const INK = '#263B55'

/** Hull + sail polygons (in cell units, relative to the anchor cell top-left). */
function boatPolys(kind: BoatKind): { hull: Array<[number, number]>; sail: Array<[number, number]> } {
  switch (kind) {
    case 'standard':
      return {
        // hull: 3 wide trapezoid, top at y=1, narrowing to a 1-wide base at y=2
        hull: [
          [0, 1],
          [3, 1],
          [2.3, 2],
          [0.7, 2],
        ],
        // sail: right triangle, VERTICAL edge on the left, hypotenuse down-right
        sail: [
          [0.55, 0],
          [0.55, 1],
          [1.85, 1],
        ],
      }
    case 'mirrored':
      return {
        // A's hull, but the sail is FLIPPED: vertical edge on the RIGHT,
        // hypotenuse sloping down-left (a slide can never flip A onto this)
        hull: [
          [0, 1],
          [3, 1],
          [2.3, 2],
          [0.7, 2],
        ],
        sail: [
          [2.45, 0],
          [2.45, 1],
          [1.15, 1],
        ],
      }
    case 'tallSail':
      return {
        // upright but the sail is a TALL narrow triangle (2 cells high) — wrong size
        hull: [
          [0, 2],
          [3, 2],
          [2.3, 3],
          [0.7, 3],
        ],
        sail: [
          [1.1, 0],
          [1.1, 2],
          [2.3, 2],
        ],
      }
    case 'wide':
      return {
        // larger boat: wider hull + taller central sail
        hull: [
          [0, 1.1],
          [3.4, 1.1],
          [2.7, 2.2],
          [0.7, 2.2],
        ],
        sail: [
          [1.5, -0.2],
          [1.5, 1.1],
          [2.7, 1.1],
        ],
      }
    case 'tiltRight':
      return {
        // rotated dart pointing down-right
        hull: [
          [0.2, 1.4],
          [2.6, 0.8],
          [2.9, 1.9],
          [1.4, 2.4],
        ],
        sail: [
          [0.6, 0.2],
          [1.1, 1.5],
          [2.4, 0.7],
        ],
      }
    case 'tiltLeft':
      return {
        // rotated dart pointing down-left
        hull: [
          [0.4, 0.9],
          [2.8, 1.5],
          [2.4, 2.5],
          [0.7, 2.0],
        ],
        sail: [
          [0.3, 0.6],
          [1.6, 1.2],
          [0.9, 2.1],
        ],
      }
    case 'pointLeft':
      return {
        // small boat rotated to point left
        hull: [
          [0.2, 1.0],
          [2.0, 1.0],
          [2.0, 2.2],
          [0.6, 2.0],
        ],
        sail: [
          [2.0, 1.0],
          [2.0, 2.0],
          [0.9, 1.5],
        ],
      }
    default:
      return { hull: [], sail: [] }
  }
}

const ptsToStr = (pts: Array<[number, number]>, ox: number, oy: number) =>
  pts.map(([x, y]) => `${ox + x * CELL},${oy + y * CELL}`).join(' ')

export interface BoatTranslate25G1Props {
  /**
   * Indices (into BOATS) to highlight — the animator passes BOAT_MATCHES after
   * the answer to mark the two boats a slide lands on. Empty by default so the
   * static figure reveals nothing.
   */
  litBoats?: number[]
  /** When true the animator wants the dashed "slide" guide arrow drawn from A. */
  showSlide?: boolean
}

/**
 * Bare primitive: the boats on the grid. Used by the static figure (no props)
 * and by the animator (litBoats / showSlide) to reveal the slide post-answer.
 */
export function BoatTranslate25G1({ litBoats = [], showSlide = false }: BoatTranslate25G1Props) {
  const lit = new Set(litBoats)
  const ox = PAD
  const oy = PAD

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(640, VIEW_W * 1.6)}>
      {/* grid */}
      <rect x={ox} y={oy} width={GRID_COLS * CELL} height={GRID_ROWS * CELL} className="fill-qupu-shell" />
      {Array.from({ length: GRID_COLS + 1 }, (_, c) => (
        <line
          key={`v${c}`}
          x1={ox + c * CELL}
          y1={oy}
          x2={ox + c * CELL}
          y2={oy + GRID_ROWS * CELL}
          className="stroke-qupu-cream-dark"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: GRID_ROWS + 1 }, (_, r) => (
        <line
          key={`h${r}`}
          x1={ox}
          y1={oy + r * CELL}
          x2={ox + GRID_COLS * CELL}
          y2={oy + r * CELL}
          className="stroke-qupu-cream-dark"
          strokeWidth={1}
        />
      ))}

      {/* boats */}
      {BOATS.map((b, i) => {
        const { hull, sail } = boatPolys(b.kind)
        const bx = ox + b.col * CELL
        const by = oy + b.row * CELL
        const isLit = lit.has(i)
        const hullCls = isLit ? 'fill-qupu-brand-orange' : 'fill-qupu-peach'
        const sailCls = isLit ? 'fill-qupu-brand-yellow' : 'fill-qupu-cream'
        const strokeW = isLit ? 2.6 : 1.8
        // bounding centre of the boat (for the mover's dashed ring + label)
        const cx = bx + 1.55 * CELL
        const cy = by + 1.2 * CELL
        return (
          <g key={b.id}>
            {b.mover && (
              <circle
                cx={cx}
                cy={cy}
                r={2.15 * CELL}
                fill="none"
                stroke={INK}
                strokeWidth={1.8}
                strokeDasharray="4 4"
              />
            )}
            <polygon points={ptsToStr(hull, bx, by)} className={hullCls} stroke={INK} strokeWidth={strokeW} strokeLinejoin="round" />
            <polygon points={ptsToStr(sail, bx, by)} className={sailCls} stroke={INK} strokeWidth={strokeW} strokeLinejoin="round" />
            {b.mover && (
              <text
                x={cx - 0.25 * CELL}
                y={cy + 0.62 * CELL}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={CELL * 0.7}
                fontWeight={800}
                fill={INK}
              >
                A
              </text>
            )}
          </g>
        )
      })}

      {/* optional slide guide (animator only) — a dashed arrow from A toward the matches */}
      {showSlide &&
        (() => {
          const mover = BOATS.find((b) => b.mover)
          if (!mover) return null
          const x0 = ox + (mover.col + 1.55) * CELL
          const y0 = oy + (mover.row + 1.2) * CELL
          const x1 = x0 + 4.2 * CELL
          return (
            <g>
              <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y0}
                stroke={INK}
                strokeWidth={2}
                strokeDasharray="5 4"
                markerEnd="url(#bt-arrow)"
              />
              <defs>
                <marker id="bt-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill={INK} />
                </marker>
              </defs>
            </g>
          )
        })()}
    </svg>
  )
}

/**
 * Static in-card figure: the boats on the grid, nothing revealed.
 * Pure function of params (none needed here, but kept SSR-safe & defensive).
 */
export default function BoatTranslate25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah grid berisi sembilan figur perahu kertas. Perahu A (di dalam lingkaran putus-putus) ' +
        'dapat digeser (translasi, tanpa diputar atau dibalik) menyilang grid. Hitung berapa banyak ' +
        'perahu lain yang tepat tertutup oleh perahu A ketika digeser.'
      }
    >
      <BoatTranslate25G1 />
    </div>
  )
}
