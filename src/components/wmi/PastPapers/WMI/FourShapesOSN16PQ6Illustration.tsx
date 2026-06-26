/**
 * Illustration – OSN 2016 SD Provinsi Q6
 *
 * Four rectilinear shapes, all in a 5 × 6 bounding box.
 * Q: Which has the largest perimeter?  A: shape 1 (perimeter = 30 units).
 *
 * Pure SVG, SSR-safe (no hooks, no framer-motion).
 * No primitives match directly; paths hand-derived on a 20 px/unit grid.
 */

const CELL = 20 // px per unit

/**
 * Shape 1 — most jagged: 4 corner cuts (1×1) + 4 center side notches
 * (top/bottom 1×1, left/right 1×2).  Perimeter = 30 units.
 */
const PATH_1 =
  'M 20,120 L 40,120 L 40,100 L 60,100 L 60,120 ' +
  'L 80,120 L 80,100 L 100,100 L 100,80 L 80,80 ' +
  'L 80,40 L 100,40 L 100,20 L 80,20 L 80,0 ' +
  'L 60,0 L 60,20 L 40,20 L 40,0 L 20,0 ' +
  'L 20,20 L 0,20 L 0,40 L 20,40 L 20,80 ' +
  'L 0,80 L 0,100 L 20,100 Z'

/**
 * Shape 2 — I-beam: 2 center side notches (left & right, 1×2 each).
 * Perimeter = 26 units.
 */
const PATH_2 =
  'M 0,120 L 100,120 L 100,80 L 80,80 L 80,40 ' +
  'L 100,40 L 100,0 L 0,0 L 0,40 L 20,40 ' +
  'L 20,80 L 0,80 Z'

/**
 * Shape 3 — T-shape: 2 top corner cuts only.
 * Perimeter = 22 units (same as rectangle — corner cuts add zero).
 */
const PATH_3 =
  'M 0,120 L 100,120 L 100,40 L 60,40 L 60,0 ' +
  'L 40,0 L 40,40 L 0,40 Z'

/**
 * Shape 4 — plain 5×6 rectangle.
 * Perimeter = 22 units.
 */
const PATH_4 = 'M 0,0 L 100,0 L 100,120 L 0,120 Z'

const W = CELL * 5  // 100
const H = CELL * 6  // 120
const GAP = 24
const LABEL_H = 28
const PAD = 16

const COL2 = PAD + W + GAP          // x-offset for shapes 2 and 4
const ROW2 = PAD + H + LABEL_H + GAP // y-offset for shapes 3 and 4

const VW = PAD + W + GAP + W + PAD                          // 272
const VH = PAD + H + LABEL_H + GAP + H + LABEL_H + PAD     // 344

interface ShapeCardProps {
  path: string
  label: string
  fill: string
  stroke: string
  tx: number
  ty: number
}

function ShapeCard({ path, label, fill, stroke, tx, ty }: ShapeCardProps) {
  return (
    <g transform={`translate(${tx},${ty})`}>
      {/* Grid guide (faint) */}
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * CELL}
            y={r * CELL}
            width={CELL}
            height={CELL}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />
        ))
      )}
      {/* Shape */}
      <path d={path} fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Numeric label below */}
      <text
        x={W / 2}
        y={H + 20}
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fill={stroke}
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

export default function FourShapesOSN16PQ6Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-label="Empat bangun datar dalam kotak pembatas 6×5. Bangun 1 paling bergerigi."
    >
      <ShapeCard path={PATH_1} label="1" fill="#DBEAFE" stroke="#1D4ED8" tx={PAD}   ty={PAD}   />
      <ShapeCard path={PATH_2} label="2" fill="#DCFCE7" stroke="#15803D" tx={COL2}  ty={PAD}   />
      <ShapeCard path={PATH_3} label="3" fill="#FEF9C3" stroke="#A16207" tx={PAD}   ty={ROW2}  />
      <ShapeCard path={PATH_4} label="4" fill="#F3E8FF" stroke="#7E22CE" tx={COL2}  ty={ROW2}  />
    </svg>
  )
}
