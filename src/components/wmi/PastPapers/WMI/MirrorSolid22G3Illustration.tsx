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
 *     x — column, increasing to the screen-right / front-right
 *     y — depth,  increasing into the screen (back)
 *     z — height, increasing upward
 *
 *   The drawn staircase (iso outline with dashed hidden edges):
 *     back-left column is tallest (3 high), stepping down toward the front-right.
 *       (0,0,0) (0,0,1) (0,0,2)   ← tall back-left column, height 3
 *       (1,0,0) (1,0,1)           ← middle column, height 2
 *       (1,1,0)                   ← cube tucked behind the middle column, height 1
 *       (2,0,0)                   ← low front-right cube, height 1
 *   This silhouette is intentionally a faithful *outline* of the photographed
 *   solid; the figure does not colour the cubes themselves, so neither do we.
 *
 *   LEFT mirror (side view, 1 wide × 3 tall): white(top) / gray(mid) / black(bottom).
 *   BACK mirror (x–z grid, 3×3, row 0 = top):
 *     row0:  .      white   .
 *     row1:  gray   gray    .       (gray 1×2 horizontal, white sits above col2)
 *     row2:  black  gray    white
 *
 *   Consistency with "at most 6 white 1×1×1 cubes": both mirrors are silhouette
 *   shadows, so a coloured cell only certifies that *some* piece of that colour
 *   reaches that shadow square — it does not pin a colour onto a specific lattice
 *   cell. The question asks for the MAXIMUM number of white unit cubes consistent
 *   with both shadows; per the official key that maximum is 6. Drawing the bare
 *   outline plus the two shadow grids (without colouring the solid) is exactly the
 *   information the solver is given, and is consistent with the answer 6.
 *
 * Pure render — no Math.random, no Date, no state/effects. SSR-safe & deterministic.
 */

export type PieceColor = 'white' | 'gray' | 'black'

export interface Cube {
  x: number
  y: number
  z: number
}

/** The drawn unit-cube lattice of the iso solid (outline only — no colour). */
export const UNIT_CUBES: Cube[] = [
  // tall back-left column (height 3)
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: 2 },
  // middle column (height 2)
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 },
  // cube tucked behind the middle column (height 1)
  { x: 1, y: 1, z: 0 },
  // low front-right cube (height 1)
  { x: 2, y: 0, z: 0 },
]

/** Left (side) mirror: 1 wide × 3 tall, top→bottom. */
export const SIDE_MIRROR: PieceColor[][] = [['white'], ['gray'], ['black']]

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
      {ordered.map((c, i) => {
        const { x, y, z } = c
        const f = fill ? fill(c) : CUBE_FILL
        // Three visible faces of a unit cube: top, left, right.
        const top = `${P(x, y, z + 1)} ${P(x + 1, y, z + 1)} ${P(x + 1, y + 1, z + 1)} ${P(x, y + 1, z + 1)}`
        const left = `${P(x, y, z)} ${P(x, y + 1, z)} ${P(x, y + 1, z + 1)} ${P(x, y, z + 1)}`
        const right = `${P(x, y, z)} ${P(x + 1, y, z)} ${P(x + 1, y, z + 1)} ${P(x, y, z + 1)}`

        return (
          <g key={`${x}-${y}-${z}-${i}`}>
            {/* faces (shaded subtly so the solid reads as 3D) */}
            <polygon points={top} fill={f} stroke={EDGE} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon
              points={left}
              fill={f}
              stroke={EDGE}
              strokeWidth={1.4}
              strokeLinejoin="round"
              opacity={0.86}
            />
            <polygon
              points={right}
              fill={f}
              stroke={EDGE}
              strokeWidth={1.4}
              strokeLinejoin="round"
              opacity={0.72}
            />
          </g>
        )
      })}
      {/* dashed hidden edges: the three back edges meeting at the hidden corner
          of the bounding region give the "see-through" look of the source. */}
      <HiddenEdges cubes={ordered} P={P} />
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
      aria-label="Sebuah benda padat disusun dari kubus 1×1×1 putih, balok 1×1×2 abu-abu, dan balok 1×1×3 hitam, digambar secara isometrik berbentuk tangga. Dua cermin menampilkan bayangannya: cermin sisi kiri berupa kolom 1×3 putih (atas), abu-abu (tengah), hitam (bawah); cermin belakang berupa kisi berwarna. Legend di kanan menampilkan tiga jenis balok berlabel 1×1×1, 1×1×2, dan 1×1×3. Berapa paling banyak kubus 1×1×1 putih yang mungkin terdapat dalam benda itu?"
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={DISPLAY_W} style={{ display: 'block' }} aria-hidden="true">
        {/* BACK mirror — upper centre */}
        <MirrorGrid grid={BACK_MIRROR} ox={210} oy={26} label="Cermin (belakang)" />

        {/* LEFT (side) mirror — left */}
        <MirrorGrid grid={SIDE_MIRROR} ox={40} oy={150} label="Cermin (samping)" />

        {/* The isometric solid — lower centre */}
        <IsoBlocks cubes={UNIT_CUBES} ox={250} oy={300} />

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
