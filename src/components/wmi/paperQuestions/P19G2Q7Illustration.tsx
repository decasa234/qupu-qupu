// WMI-19P2A-Q7 (2019 Semifinal Grade 2 Paper A) — "The trapezoid is divided by the
// dashed lines into several pieces. Counting how many of each kind of shape
// (parallelogram, rectangle, trapezoid, triangle) the pieces make, which figure
// (table of counts) is correct?"  Answer: A.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g2-a-q7.jpg (the JPG is
// NOT embedded). The scan shows an isosceles trapezoid divided by DASHED lines:
//   - a central horizontal RECTANGLE in the middle band;
//   - two upper slanted lines from the rectangle's top corners out to the
//     trapezoid's TOP corners;
//   - two lower slanted lines from the rectangle's bottom corners down to the
//     trapezoid's BOTTOM corners, plus a central vertical line from the middle of
//     the rectangle's bottom edge straight down to the bottom base.
//
// The static figure shows ONLY the problem — the trapezoid + its dashed dividers,
// never any count and never any sub-shape highlighted. The explainer tints the
// pieces one shape-kind at a time and lands on the four counts (→ Figure A).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.
// House-style reference: ParaDivide25G3Illustration (divided-quadrilateral count).

const INK = '#1F2937'

/* ------------------------------------------------------------------ *
 * Geometry. Every named point is fixed in viewBox space so both the
 * figure and the explainer address the SAME lattice. The trapezoid is
 * isosceles (top base shorter, centred over the bottom base).
 * ------------------------------------------------------------------ */

export type Pt = { x: number; y: number }

// Outer isosceles trapezoid.
export const TRAP = {
  TL: { x: 120, y: 40 }, // top-left
  TR: { x: 290, y: 40 }, // top-right
  BR: { x: 370, y: 160 }, // bottom-right
  BL: { x: 40, y: 160 }, // bottom-left
} as const

// Central horizontal rectangle (sits in the middle band).
export const RECT = {
  TL: { x: 150, y: 84 },
  TR: { x: 260, y: 84 },
  BR: { x: 260, y: 116 },
  BL: { x: 150, y: 116 },
} as const

// Foot point on the bottom base where the central vertical line lands.
export const FOOT = {
  M: { x: 205, y: 160 }, // central foot (rectangle bottom-mid → base)
} as const

// Midpoint of the rectangle's bottom edge (top of the central vertical line).
export const RECT_BOTTOM_MID: Pt = { x: 205, y: 116 }

export type TrapPointName = keyof typeof TRAP
export type RectPointName = `R_${keyof typeof RECT}`
export type FootName = `F_${keyof typeof FOOT}`
export type NodeName = TrapPointName | RectPointName | FootName | 'RBM'

/** Resolve any named node to viewBox coordinates. */
export function node(name: NodeName): Pt {
  if (name === 'RBM') return RECT_BOTTOM_MID
  if (name.startsWith('R_')) return RECT[name.slice(2) as keyof typeof RECT]
  if (name.startsWith('F_')) return FOOT[name.slice(2) as keyof typeof FOOT]
  return TRAP[name as TrapPointName]
}

// The internal DASHED dividing segments (the outer trapezoid is solid, drawn separately).
export const DIVIDERS: Array<[NodeName, NodeName]> = [
  // central rectangle (four sides)
  ['R_TL', 'R_TR'],
  ['R_TR', 'R_BR'],
  ['R_BR', 'R_BL'],
  ['R_BL', 'R_TL'],
  // upper slants: rectangle top corners → trapezoid top corners
  ['R_TL', 'TL'],
  ['R_TR', 'TR'],
  // lower slants: rectangle bottom corners → trapezoid bottom corners
  ['R_BL', 'BL'],
  ['R_BR', 'BR'],
  // central vertical: rectangle bottom-mid → base centre foot
  ['RBM', 'F_M'],
]

/** A filled polygon addressed by node names — used by the explainer to tint a piece. */
export function Piece({
  pts,
  fill,
  stroke = INK,
  strokeWidth = 2,
  opacity = 1,
}: {
  pts: NodeName[]
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}) {
  const d = pts.map((n) => `${node(n).x},${node(n).y}`).join(' ')
  return <polygon points={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} strokeLinejoin="round" />
}

function Dashed({ a, b }: { a: NodeName; b: NodeName }) {
  const p1 = node(a)
  const p2 = node(b)
  return (
    <line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke={INK}
      strokeWidth={2}
      strokeDasharray="6 4"
      strokeLinecap="round"
    />
  )
}

/** The static problem figure (no piece highlighted). Reusable by the explainer before reveal. */
export function TrapDivideFigure() {
  return (
    <svg viewBox="0 0 410 200" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* outer trapezoid (solid) */}
      <Piece pts={['TL', 'TR', 'BR', 'BL']} fill="none" stroke={INK} strokeWidth={2.6} />
      {/* internal dividing lines (dashed, as in the scan) */}
      {DIVIDERS.map(([a, b], i) => (
        <Dashed key={i} a={a} b={b} />
      ))}
    </svg>
  )
}

export default function P19G2Q7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="An isosceles trapezoid, top base shorter than the bottom base, divided by dashed lines. A small rectangle sits in the middle; two dashed lines run from its top corners out to the trapezoid's top corners, two dashed lines run from its bottom corners down to the bottom base, and a central dashed line drops straight down from the middle of the rectangle to the base. Count how many parallelograms, rectangles, trapezoids and triangles the pieces make, and choose the matching table."
    >
      <TrapDivideFigure />
    </div>
  )
}
