// Cylinder-cluster figure for WMI-19P1A-Q10 (2019 Semifinal Grade 1 Paper A).
//
// "How many cylinders are there in the cluster shown?"  Choices 15 / 16 / 17 / 18,
// answer C = 17.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g1-a-q10.jpg (the JPG is
// NOT embedded). The scan is a loose 3D pile of identical open cylinders drawn in
// outline. Some cylinders are partly hidden behind front ones and others sit on
// top supporting the upper ones — all of them count. We redraw it as a clean,
// readable isometric stack laid out as three horizontal LAYERS so the total is
// derivable layer by layer:
//
//   bottom layer (z0) = 8 cylinders   (the wide base of the pile)
//   middle layer (z1) = 6 cylinders   (nestled in the gaps above)
//   top    layer (z2) = 3 cylinders   (the few that poke up on top)
//   ----------------------------------------------------------------
//   total              = 17           (answer C)
//
// The static figure shows ONLY the problem: the cluster, no count, no marks.
// Revealing the 17 layer by layer is the explainer's job, via the co-exported
// CylinderCluster primitive (its `litLayer` / `dimAbove` props).
//
// Pure render — no window/document, no Math.random, no Date. SSR-safe + deterministic.

const INK = '#1F2937'

// Cylinder palette (a soft steel-blue so the rounded forms read in 3D).
const BODY = '#CFE6F4'
const TOP_FACE = '#E8F4FB'
const LIT_BODY = '#FFD98A'
const LIT_TOP = '#FFF0CE'

// Each layer's cylinder centres, given as (col, depth) positions in an isometric
// grid. col → right, depth → back. The layers are offset upward by LAYER_RISE.
// Positions are chosen so the cluster reads as a compact pile (back cylinders
// peek between the front ones), exactly mirroring the loose scan.
type Pos = readonly [number, number] // [col, depth]

export const LAYERS: ReadonlyArray<ReadonlyArray<Pos>> = [
  // bottom layer — 8 cylinders (a 4-wide front row + a 4-wide back row, staggered)
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [0.5, 1],
    [1.5, 1],
    [2.5, 1],
    [3.5, 1],
  ],
  // middle layer — 6 cylinders nestled in the gaps
  [
    [0.75, 0.5],
    [1.75, 0.5],
    [2.75, 0.5],
    [1.25, 1.5],
    [2.25, 1.5],
    [3.25, 1.5],
  ],
  // top layer — 3 cylinders poking up
  [
    [1.4, 0.9],
    [2.2, 0.9],
    [2.8, 1.4],
  ],
]

export const LAYER_COUNTS: number[] = LAYERS.map((l) => l.length) // [8, 6, 3]
export const TOTAL_CYLINDERS = LAYER_COUNTS.reduce((a, b) => a + b, 0) // 17

// ─── geometry ──────────────────────────────────────────────────────────────
const RX = 22 // ellipse radius x (cylinder cap)
const RY = 11 // ellipse radius y (cylinder cap)
const BODY_H = 26 // cylinder body height
const STEP_X = 30 // horizontal run per col unit
const STEP_Y = 16 // vertical run per depth unit (back = up the page)
const LAYER_RISE = 30 // how far each layer sits above the one below

/** Project a cylinder centre to its cap-centre (sx, sy) on the SVG plane. */
function project(col: number, depth: number, layer: number): { sx: number; sy: number } {
  return {
    sx: col * STEP_X,
    sy: -depth * STEP_Y - layer * LAYER_RISE,
  }
}

interface Placed {
  sx: number
  sy: number
  layer: number
  /** sort key: lower-front cylinders drawn last so they overlap the back ones. */
  order: number
}

function placedCylinders(): Placed[] {
  const out: Placed[] = []
  LAYERS.forEach((layer, z) => {
    layer.forEach(([col, depth]) => {
      const { sx, sy } = project(col, depth, z)
      // paint order: back-to-front, bottom-to-top. Front (small depth) + low layer
      // is nearest the viewer → largest order → drawn last.
      const order = z * 1000 + (5 - depth) * 100 + col
      out.push({ sx, sy, layer: z, order })
    })
  })
  return out.sort((a, b) => a.order - b.order)
}

/** One open cylinder drawn at cap-centre (sx, sy). */
export function Cylinder({
  sx,
  sy,
  lit = false,
  dim = false,
}: {
  sx: number
  sy: number
  lit?: boolean
  dim?: boolean
}) {
  const topY = sy
  const botY = sy + BODY_H
  return (
    <g opacity={dim ? 0.26 : 1}>
      {/* body: two side strokes + bottom arc + filled rectangle band */}
      <path
        d={`M ${sx - RX} ${topY}
            L ${sx - RX} ${botY}
            A ${RX} ${RY} 0 0 0 ${sx + RX} ${botY}
            L ${sx + RX} ${topY} Z`}
        fill={lit ? LIT_BODY : BODY}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {/* top cap ellipse */}
      <ellipse
        cx={sx}
        cy={topY}
        rx={RX}
        ry={RY}
        fill={lit ? LIT_TOP : TOP_FACE}
        stroke={INK}
        strokeWidth={1.6}
      />
    </g>
  )
}

export interface CylinderClusterProps {
  /** When set, only this layer index glows; layers above it are dimmed. */
  litLayer?: number
  /** When true, layers strictly above `litLayer` are faded out (count build-up). */
  dimAbove?: boolean
}

/**
 * The cylinder cluster. At its defaults it is the pristine question figure: the
 * full pile, no count, no marks. The explainer passes `litLayer` to glow one
 * horizontal layer at a time while it tallies upward.
 */
export function CylinderCluster({ litLayer, dimAbove = false }: CylinderClusterProps) {
  const placed = placedCylinders()
  // tight viewBox from the projected extents + headroom for caps and bodies
  const xs = placed.map((p) => p.sx)
  const ys = placed.map((p) => p.sy)
  const minX = Math.min(...xs) - RX
  const maxX = Math.max(...xs) + RX
  const minY = Math.min(...ys) - RY
  const maxY = Math.max(...ys) + BODY_H + RY
  const pad = 16
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {placed.map((p, i) => {
        const lit = litLayer !== undefined && p.layer === litLayer
        const dim = dimAbove && litLayer !== undefined && p.layer > litLayer
        return <Cylinder key={i} sx={p.sx} sy={p.sy} lit={lit} dim={dim} />
      })}
    </svg>
  )
}

export default function CylinderCount19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3D cluster of identical cylinders piled together, drawn in outline. Some cylinders are partly hidden behind the front ones and others rest on top. How many cylinders are there in all? The count is not shown."
    >
      <CylinderCluster />
    </div>
  )
}
