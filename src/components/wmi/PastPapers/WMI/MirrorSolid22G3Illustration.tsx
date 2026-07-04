/**
 * MirrorSolid22G3Illustration — WMI-22F3A-Q24
 *
 * A solid built from 1×1×1 cubes is shown in isometric view together with the
 * two mirror reflections from the source figure:
 *   - a LEFT (side) mirror showing the y–z silhouette as a 1-wide × 3-tall strip
 *     coloured white (top), gray (middle), black (bottom);
 *   - a BACK/TOP mirror showing the x–z silhouette as a coloured grid.
 * A legend on the right names the three piece types: 1×1×1, 1×1×2, 1×1×3.
 *
 * This component draws ONLY the setup — the isometric cube stack, the two
 * coloured mirror grids, and the legend. It NEVER reveals which cubes are
 * white / gray / black inside the solid (that is the solution; answer = 6).
 *
 * Reconstruction notes (read from db/seed/wmi/figures/2022-final-g3-a-q24.jpg):
 *
 *   Coordinate convention used below for UNIT_CUBES (grid lattice, each entry
 *   is one drawn 1×1×1 cell of the iso outline):
 *     x — column, 0..2 increasing to the screen-right (matches back-mirror cols)
 *     y — depth,  0 = back row (mirror side), 2 = front-left row
 *     z — height, increasing upward
 *
 *   The drawn solid (13 unit cells):
 *     z=0 — bottom layer, 8 cells: the full 3×3 footprint minus the front-right
 *           corner (2,2). Visible: front-left strip (0,2)(1,2) and the right pair
 *           (2,0)(2,1); the 2×2 under the slab is hidden but geometrically forced
 *           (the slab must be supported).
 *     z=1 — the 2×2 slab: (0,0)(0,1)(1,0)(1,1).
 *     z=2 — one cube on the slab's back-right cell: (1,0).
 *
 *   LEFT (side) mirror — reflection widths 1 : 2 : 3 in the scan, i.e. the actual
 *   faces seen from the left:
 *     z=2: white 1×1 (top cube's face), z=1: gray face 2 long, z=0: black face 3 long.
 *   BACK mirror (x–z grid, 3×3, row 0 = top):
 *     row0:  .      white   .
 *     row1:  gray   gray    .
 *     row2:  black  gray    white
 *
 *   Consistency with "at most 6 white 1×1×1 cubes": every coloured mirror cell
 *   pins the colour of the piece touching that surface. Working it through
 *   (script-verified): the side mirror's 3-long black face forces one black
 *   1×1×3 along (0,y,0); the two mirrors' gray cells force gray at (0,0,1),
 *   (0,1,1), (1,0,1) and (1,0,0) — two gray 1×1×2 blocks (one lying in the slab,
 *   one standing at the back). That's 3 + 4 = 7 cells that can never be white,
 *   so the maximum is 13 − 7 = 6, matching the official key. This exact
 *   colouring also reproduces both mirror images cell-for-cell.
 *
 * Pure render — no Math.random, no Date, no state/effects. SSR-safe & deterministic.
 */

export type PieceColor = 'white' | 'gray' | 'black'

export interface Cube {
  x: number
  y: number
  z: number
}

/** The drawn unit-cube lattice of the iso solid (outline only — no colour). 13 cells. */
export const UNIT_CUBES: Cube[] = [
  // z=0 bottom layer — 3×3 footprint minus the front-right corner (8 cells).
  // The 2×2 under the slab is hidden in the scan but forced (the slab needs support).
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 }, // right pair, back
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 }, // right pair, front
  { x: 0, y: 2, z: 0 }, // front-left strip
  { x: 1, y: 2, z: 0 }, // front-left strip
  // z=1 — the 2×2 slab (4 cells)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
  // z=2 — top cube on the slab's back-right cell
  { x: 1, y: 0, z: 2 },
]

/**
 * Left (side) mirror: 3 tall × 3 deep, top→bottom rows.
 * The scan shows the reflected faces with widths 1 : 2 : 3 —
 * white 1×1 on top, a gray face 2 long, a black face 3 long at the bottom
 * (right-aligned steps, as in the source).
 */
export const SIDE_MIRROR: (PieceColor | null)[][] = [
  [null, null, 'white'],
  [null, 'gray', 'gray'],
  ['black', 'black', 'black'],
]

/** Back mirror: x–z grid, row 0 = top. null = empty cell. */
export const BACK_MIRROR: (PieceColor | null)[][] = [
  [null, 'white', null],
  ['gray', 'gray', null],
  ['black', 'gray', 'white'],
]

// ---------------------------------------------------------------------------
// Design tokens (qupu palette → concrete values for SVG fills)
// ---------------------------------------------------------------------------

const PIECE_FILL: Record<PieceColor, string> = {
  white: '#ffffff',
  gray: '#9ca3af',
  black: '#3a3a3a',
}
const CUBE_FILL = '#ffffff'
const EDGE = '#1f2937' // visible cube edges
const HIDDEN = '#9ca3af' // dashed hidden edges
const MIRROR_FRAME = '#cbd5e1'
const MIRROR_GRID = '#1f2937'
const LABEL = '#1f2937'

// ---------------------------------------------------------------------------
// Isometric projection
// ---------------------------------------------------------------------------

// Unit vectors of the iso lattice, in SVG pixels.
const U = 30 // half-cell horizontal run
const V = 17 // half-cell vertical run (depth tilt)
const H = 34 // cube height in pixels

/** Project a lattice point (x,y,z) → SVG (px,py). */
export function iso(x: number, y: number, z: number): [number, number] {
  // x runs down-right, y runs down-left, z runs up.
  const px = (x - y) * U
  const py = (x + y) * V - z * H
  return [px, py]
}

/**
 * IsoBlocks — primitive shared with the animator.
 *
 * Renders a list of unit cubes as an isometric outline with visible solid edges
 * and dashed hidden edges. The animator can reuse this to re-draw the solid and
 * overlay its own colouring / highlighting after the answer.
 *
 * Props:
 *   cubes   — lattice cubes to draw
 *   fill    — optional per-cube top/face fill (defaults all white outline)
 *   ox, oy  — pixel offset applied to every projected point
 */
export interface IsoBlocksProps {
  cubes: Cube[]
  fill?: (c: Cube) => string
  ox?: number
  oy?: number
}

export function IsoBlocks({ cubes, fill, ox = 0, oy = 0 }: IsoBlocksProps) {
  // Painter's order: draw far cubes first (small x+y, small z), near last.
  const ordered = [...cubes].sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z || a.y - b.y)

  const P = (x: number, y: number, z: number) => {
    const [px, py] = iso(x, y, z)
    return `${(px + ox).toFixed(1)},${(py + oy).toFixed(1)}`
  }

  return (
    <g>
      {/* dashed hidden edges are drawn FIRST so nearer cube faces occlude them —
          with 13 cells, drawing them on top reads as wireframe clutter. */}
      <HiddenEdges cubes={ordered} P={P} />
      {ordered.map((c, i) => {
        const { x, y, z } = c
        const f = fill ? fill(c) : CUBE_FILL
        // Three visible faces of a unit cube: top, left, right.
        const top = `${P(x, y, z + 1)} ${P(x + 1, y, z + 1)} ${P(x + 1, y + 1, z + 1)} ${P(x, y + 1, z + 1)}`
        const left = `${P(x, y, z)} ${P(x, y + 1, z)} ${P(x, y + 1, z + 1)} ${P(x, y, z + 1)}`
        const right = `${P(x, y, z)} ${P(x + 1, y, z)} ${P(x + 1, y, z + 1)} ${P(x, y, z + 1)}`

        return (
          <g key={`${x}-${y}-${z}-${i}`}>
            {/* faces: opaque fills (so nearer cubes occlude farther ones), with a
                translucent dark overlay for the 3D shading instead of face opacity */}
            <polygon points={top} fill={f} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={left} fill={f} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={left} fill="#0f172a" opacity={0.08} stroke="none" />
            <polygon points={right} fill={f} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={right} fill="#0f172a" opacity={0.16} stroke="none" />
          </g>
        )
      })}
    </g>
  )
}

/** Dashed hidden edges along internal seams that the figure shows see-through. */
function HiddenEdges({
  cubes,
  P,
}: {
  cubes: Cube[]
  P: (x: number, y: number, z: number) => string
}) {
  const has = (x: number, y: number, z: number) =>
    cubes.some((c) => c.x === x && c.y === y && c.z === z)

  const segs: [string, string][] = []
  // For each cube, draw the three hidden edges at its far-bottom-inner corner
  // (vertical back edge + two bottom-back edges) when they are interior seams
  // i.e. there is no cube on the far side to occlude them but they sit behind
  // the silhouette — this reproduces the dashed interior grid of the source.
  for (const c of cubes) {
    const { x, y, z } = c
    // vertical hidden edge at the (x+1, y+1) back-bottom corner if a neighbour
    // hides the front but the seam is internal
    const back = [x + 1, y + 1] as const
    const occludedFront = has(x + 1, y, z) || has(x, y + 1, z)
    if (occludedFront) {
      segs.push([P(back[0], back[1], z), P(back[0], back[1], z + 1)])
      segs.push([P(back[0], back[1], z), P(x + 1, y, z)])
      segs.push([P(back[0], back[1], z), P(x, y + 1, z)])
    }
  }

  return (
    <g>
      {segs.map(([a, b], i) => (
        <line
          key={i}
          x1={a.split(',')[0]}
          y1={a.split(',')[1]}
          x2={b.split(',')[0]}
          y2={b.split(',')[1]}
          stroke={HIDDEN}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Mirror grids
// ---------------------------------------------------------------------------

const M_CELL = 26

/** A flat coloured mirror grid (used for both the side and back reflections). */
export function MirrorGrid({
  grid,
  ox,
  oy,
  label,
}: {
  grid: (PieceColor | null)[][]
  ox: number
  oy: number
  label: string
}) {
  const rows = grid.length
  const cols = Math.max(...grid.map((r) => r.length))
  const w = cols * M_CELL
  const h = rows * M_CELL
  const pad = 10
  return (
    <g>
      {/* mirror frame */}
      <rect
        x={ox - pad}
        y={oy - pad}
        width={w + pad * 2}
        height={h + pad * 2}
        fill="none"
        stroke={MIRROR_FRAME}
        strokeWidth={2}
      />
      {grid.map((row, r) =>
        row.map((cell, cidx) => (
          <rect
            key={`${r}-${cidx}`}
            x={ox + cidx * M_CELL}
            y={oy + r * M_CELL}
            width={M_CELL}
            height={M_CELL}
            fill={cell ? PIECE_FILL[cell] : 'none'}
            stroke={cell ? MIRROR_GRID : 'none'}
            strokeWidth={1.2}
          />
        )),
      )}
      <text
        x={ox + w / 2}
        y={oy + h + pad + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={LABEL}
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Legend (three piece types)
// ---------------------------------------------------------------------------

function LegendPiece({
  cubes,
  fill,
  ox,
  oy,
  text,
}: {
  cubes: Cube[]
  fill: string
  ox: number
  oy: number
  text: string
}) {
  return (
    <g>
      <IsoBlocks cubes={cubes} fill={() => fill} ox={ox} oy={oy} />
      <text
        x={ox + 78}
        y={oy}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={LABEL}
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const VIEW_W = 600
const VIEW_H = 360
const DISPLAY_W = Math.min(560, VIEW_W)

export default function MirrorSolid22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah benda padat 13 sel disusun dari kubus 1×1×1 putih, balok 1×1×2 abu-abu, dan balok 1×1×3 hitam, digambar secara isometrik: lapisan bawah 8 sel, lempeng 2×2 di atasnya, dan satu kubus di puncak. Dua cermin menampilkan bayangannya: cermin samping menunjukkan sisi putih 1, abu-abu 2, dan hitam 3 satuan; cermin belakang berupa kisi berwarna. Legend di kanan menampilkan tiga jenis balok berlabel 1×1×1, 1×1×2, dan 1×1×3. Berapa paling banyak kubus 1×1×1 putih yang mungkin terdapat dalam benda itu?"
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={DISPLAY_W} style={{ display: 'block' }} aria-hidden="true">
        {/* BACK mirror — upper centre */}
        <MirrorGrid grid={BACK_MIRROR} ox={210} oy={26} label="Cermin (belakang)" />

        {/* LEFT (side) mirror — left */}
        <MirrorGrid grid={SIDE_MIRROR} ox={40} oy={150} label="Cermin (samping)" />

        {/* The isometric solid — lower centre */}
        <IsoBlocks cubes={UNIT_CUBES} ox={250} oy={245} />

        {/* Legend — right column */}
        <g>
          <LegendPiece cubes={[{ x: 0, y: 0, z: 0 }]} fill={PIECE_FILL.white} ox={440} oy={70} text="1 × 1 × 1" />
          <LegendPiece
            cubes={[
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
            ]}
            fill={PIECE_FILL.gray}
            ox={440}
            oy={160}
            text="1 × 1 × 2"
          />
          <LegendPiece
            cubes={[
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
            ]}
            fill={PIECE_FILL.black}
            ox={440}
            oy={250}
            text="1 × 1 × 3"
          />
        </g>
      </svg>
    </div>
  )
}
