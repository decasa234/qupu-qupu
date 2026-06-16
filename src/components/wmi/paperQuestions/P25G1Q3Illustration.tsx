// Static card illustration for WMI-25P1A-Q3 (2025 Grade-1 Semifinal, Q3).
//
// "Which figure counting from the left is a ball?"
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q3.jpg:
// a single horizontal row of 13 solid shapes. Left -> right:
//
//   1 disc (short cylinder)   2 tall box   3 flat box   4 cylinder
//   5 small cube              6 cube       7 large box   8 SPHERE (ball)
//   9 cylinder                10 tall box  11 thin rod   12 small cube
//   13 flat slab
//
// The ball (sphere) sits at position 8 => answer C ("8"). This component draws
// ONLY the row exactly as scanned — it never numbers the ball or otherwise
// reveals which position is the answer.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

const INK = '#3A3A3A'

// pastel palette echoing the scan
const C = {
  disc: '#FBF1B8',
  pinkBox: '#F6C9C9',
  gold: '#F6C500',
  blueCyl: '#CFE6F7',
  greenCube: '#CFE8D6',
  yellowCube: '#FBF1B8',
  bigPink: '#F2B7B7',
  sphere: '#C8C0E2',
  greenCyl: '#CFE8CF',
  blueBox: '#CFE6F7',
  rod: '#FBF1B8',
  orangeCube: '#F7C39B',
  slab: '#CFE8D6',
}

const top = (hex: string) => shade(hex, 1.08)
const side = (hex: string) => shade(hex, 0.86)
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 255) * f))
  const g = Math.min(255, Math.round(((n >> 8) & 255) * f))
  const b = Math.min(255, Math.round((n & 255) * f))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const SW = 1.4

/** A box (rectangular prism) drawn isometric-ish, front face fixed at (x,y,w,h). */
function Box({ x, y, w, h, fill, depth = 12 }: { x: number; y: number; w: number; h: number; fill: string; depth?: number }) {
  const d = depth
  return (
    <g>
      {/* top */}
      <polygon points={`${x},${y} ${x + w},${y} ${x + w + d},${y - d} ${x + d},${y - d}`} fill={top(fill)} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* right side */}
      <polygon points={`${x + w},${y} ${x + w},${y + h} ${x + w + d},${y + h - d} ${x + w + d},${y - d}`} fill={side(fill)} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* front */}
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

/** A cube — a box with equal-ish front face. */
function Cube({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return <Box x={x} y={y} w={s} h={s} fill={fill} depth={s * 0.45} />
}

/** A standing cylinder with an elliptical top. */
function Cylinder({ cx, top: ty, w, h, fill }: { cx: number; top: number; w: number; h: number; fill: string }) {
  const rx = w / 2
  const ry = w * 0.22
  const left = cx - rx
  const bottom = ty + h
  return (
    <g>
      {/* body */}
      <path d={`M ${left} ${ty} L ${left} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L ${cx + rx} ${ty}`} fill={fill} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* top ellipse */}
      <ellipse cx={cx} cy={ty} rx={rx} ry={ry} fill={top(fill)} stroke={INK} strokeWidth={SW} />
    </g>
  )
}

/** A short disc — a flat cylinder. */
function Disc({ cx, top: ty, w, h, fill }: { cx: number; top: number; w: number; h: number; fill: string }) {
  return <Cylinder cx={cx} top={ty} w={w} h={h} fill={fill} />
}

/** A sphere (ball) with a soft highlight. */
function Sphere({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={SW} />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.32} rx={r * 0.34} ry={r * 0.22} fill="#FFFFFF" opacity={0.5} />
    </g>
  )
}

/** A flat slab lying down (thin box seen from a low angle). */
function Slab({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return <Box x={x} y={y} w={w} h={h} fill={fill} depth={w * 0.55} />
}

export const Q3_VIEW_W = 760
export const Q3_VIEW_H = 150
const BASE = 110 // common ground line

// X centre of each slot, evenly spaced
const N = 13
const X0 = 36
const STEP = (Q3_VIEW_W - X0 * 2) / (N - 1)
export function slotX(i: number): number {
  return X0 + i * STEP
}

/** 0-based index of the sphere in the row (the 8th figure). */
export const SPHERE_INDEX = 7

export interface Q3RowProps {
  /** Indices (0-based) to mark with a position numeral above. */
  numbered?: number[]
  /** Index to ring (animator highlight). */
  ringIndex?: number | null
}

/**
 * The 13-shape row. Co-exported so the explainer reuses the exact geometry and
 * adds numerals / a highlight ring per beat.
 */
export function Q3Row({ numbered = [], ringIndex = null }: Q3RowProps) {
  const numSet = new Set(numbered.filter((n) => Number.isInteger(n) && n >= 0 && n < N))

  // each shape drawn so its base roughly sits on BASE
  const shapes: React.ReactNode[] = [
    <Disc key="0" cx={slotX(0)} top={BASE - 16} w={42} h={16} fill={C.disc} />,
    <Box key="1" x={slotX(1) - 18} y={BASE - 58} w={36} h={58} fill={C.pinkBox} />,
    <Box key="2" x={slotX(2) - 20} y={BASE - 28} w={40} h={28} fill={C.gold} />,
    <Cylinder key="3" cx={slotX(3)} top={BASE - 52} w={34} h={52} fill={C.blueCyl} />,
    <Cube key="4" x={slotX(4) - 14} y={BASE - 28} s={28} fill={C.greenCube} />,
    <Cube key="5" x={slotX(5) - 18} y={BASE - 36} s={36} fill={C.yellowCube} />,
    <Box key="6" x={slotX(6) - 26} y={BASE - 44} w={52} h={44} fill={C.bigPink} />,
    <Sphere key="7" cx={slotX(7)} cy={BASE - 21} r={21} fill={C.sphere} />,
    <Cylinder key="8" cx={slotX(8)} top={BASE - 50} w={32} h={50} fill={C.greenCyl} />,
    <Box key="9" x={slotX(9) - 18} y={BASE - 60} w={36} h={60} fill={C.blueBox} />,
    <Cylinder key="10" cx={slotX(10)} top={BASE - 56} w={14} h={56} fill={C.rod} />,
    <Cube key="11" x={slotX(11) - 12} y={BASE - 24} s={24} fill={C.orangeCube} />,
    <Slab key="12" x={slotX(12) - 24} y={BASE - 14} w={48} h={14} fill={C.slab} />,
  ]

  return (
    <svg
      viewBox={`0 0 ${Q3_VIEW_W} ${Q3_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q3_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlight ring (animator) */}
      {ringIndex != null && ringIndex >= 0 && ringIndex < N && (
        <circle cx={slotX(ringIndex)} cy={BASE - 22} r={30} fill="none" stroke="#f0853a" strokeWidth={3} />
      )}

      {shapes}

      {/* position numerals */}
      {[...numSet].map((i) => (
        <text key={`n${i}`} x={slotX(i)} y={BASE + 28} textAnchor="middle" fontSize={15} fontWeight={800} fill="#30598A" className="font-display">
          {i + 1}
        </text>
      ))}
    </svg>
  )
}

export default function P25G1Q3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A row of thirteen 3D shapes in a line: discs, boxes, cubes, cylinders, a rod, a slab, and one round ball. The task is to find which position from the left the ball is."
    >
      <Q3Row />
    </div>
  )
}
