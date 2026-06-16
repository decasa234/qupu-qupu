// Isometric polycube figure for WMI-19P3A-Q20 (2019 WMI Semifinal Grade 3).
//
// "Which figure is the SAME as the figure below?" The four answer options were
// images in the original paper (the seed stores them as placeholders), and the key
// is A — the option that is the given solid simply turned (rotated), not flipped.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q20.jpg: a solid built
// from unit cubes — a tower of 2 cubes rising from a central junction, a 2-cube arm
// running back-right, a 2-cube wing running front-left (collinear with the arm), and
// a single cube jutting toward the viewer. This static figure shows ONLY the solid;
// the rotation reasoning (landing on A) is the explainer's job.
//
// Pure render: no window/document, no Math.random/Date — SSR-safe & deterministic.

export const Q20_ANSWER = 'A' // the rotated (not mirrored) copy

export interface Cube {
  x: number
  y: number
  z: number
}

// Lattice convention: +x runs front-right (toward the viewer), +y runs back-left,
// +z runs up. The back-right arm is −y; the front-left wing is +y.
export const Q20_SOLID: Cube[] = [
  { x: 0, y: 0, z: 0 }, // central junction
  { x: 0, y: 0, z: 1 }, // tower cube on top of the junction
  { x: 0, y: -1, z: 0 }, // back-right arm 1
  { x: 0, y: -2, z: 0 }, // back-right arm 2
  { x: 0, y: 1, z: 0 }, // front-left wing 1
  { x: 0, y: 2, z: 0 }, // front-left wing 2
  { x: 1, y: 0, z: 0 }, // cube jutting toward the viewer
]

// ---- isometric projection (shared with the explainer) --------------------------
const U = 30 // half-cell horizontal run
const V = 17 // half-cell vertical run (depth tilt)
const H = 34 // cube height in pixels

export function iso(x: number, y: number, z: number): [number, number] {
  return [(x - y) * U, (x + y) * V - z * H]
}

const TOP = '#FCF1D6'
const LEFT = '#F6E3B8'
const RIGHT = '#EBD29B'
const EDGE = '#1F2937'

export interface IsoBlocksProps {
  cubes: Cube[]
  ox?: number
  oy?: number
  /** Optional per-cube top-face fill override (used by the explainer to highlight). */
  topFill?: (c: Cube) => string | undefined
}

/** Draws a list of unit cubes as a solid isometric figure (top/left/right faces). */
export function IsoBlocks({ cubes, ox = 0, oy = 0, topFill }: IsoBlocksProps) {
  // Painter's order: far cubes first (small x+y), then bottom-up, then by depth.
  const ordered = [...cubes].sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z || a.y - b.y)
  const P = (x: number, y: number, z: number) => {
    const [px, py] = iso(x, y, z)
    return `${(px + ox).toFixed(1)},${(py + oy).toFixed(1)}`
  }
  return (
    <g>
      {ordered.map((c, i) => {
        const { x, y, z } = c
        const top = `${P(x, y, z + 1)} ${P(x + 1, y, z + 1)} ${P(x + 1, y + 1, z + 1)} ${P(x, y + 1, z + 1)}`
        const left = `${P(x, y, z)} ${P(x, y + 1, z)} ${P(x, y + 1, z + 1)} ${P(x, y, z + 1)}`
        const right = `${P(x, y, z)} ${P(x + 1, y, z)} ${P(x + 1, y, z + 1)} ${P(x, y, z + 1)}`
        const tf = topFill?.(c) ?? TOP
        return (
          <g key={`${x}-${y}-${z}-${i}`}>
            <polygon points={left} fill={LEFT} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={right} fill={RIGHT} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={top} fill={tf} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        )
      })}
    </g>
  )
}

/** Bounding box of a projected solid, so any caller can center it in a viewBox. */
export function isoBounds(cubes: Cube[]) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const { x, y, z } of cubes) {
    for (const dz of [0, 1]) {
      for (const dx of [0, 1]) {
        for (const dy of [0, 1]) {
          const [px, py] = iso(x + dx, y + dy, z + dz)
          if (px < minX) minX = px
          if (px > maxX) maxX = px
          if (py < minY) minY = py
          if (py > maxY) maxY = py
        }
      }
    }
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY }
}

export function Q20Solid({ cubes = Q20_SOLID }: { cubes?: Cube[] }) {
  const b = isoBounds(cubes)
  const pad = 16
  const ox = pad - b.minX
  const oy = pad - b.minY
  const vbW = b.w + pad * 2
  const vbH = b.h + pad * 2
  return (
    <svg
      viewBox={`0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <IsoBlocks cubes={cubes} ox={ox} oy={oy} />
    </svg>
  )
}

export default function P19G3Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A solid built from unit cubes: a tower of two cubes on a central cube, a two-cube arm to the back-right, a two-cube wing to the front-left, and one cube toward the viewer."
    >
      <Q20Solid />
    </div>
  )
}
