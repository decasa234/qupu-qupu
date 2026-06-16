/**
 * MirrorBlocks22G1Illustration — WMI-22F1A-Q24 (Grade 1)
 *
 * A solid built from white (1×1×1), gray (1×1×2), and black (1×1×3) blocks is
 * shown in isometric view together with the two mirror reflections printed in
 * the source figure:
 *   - a LEFT (side) mirror showing the y–z silhouette as a 2-wide × 3-tall grid
 *     coloured gray/gray (top), gray/white (middle), white/black (bottom);
 *   - a BACK mirror showing the x–z silhouette as a 3-wide × 3-tall coloured grid.
 * A legend on the right names the three piece types: 1×1×1, 1×1×2, 1×1×3.
 *
 * The question asks the EXACT count of white 1×1×1 blocks used — the answer is 3.
 *
 * This default component draws ONLY the setup — the isometric cube stack drawn as
 * a plain outline, the two coloured mirror grids (reproduced from the scan), and
 * the legend. It NEVER reveals which cubes are white / gray / black inside the
 * solid (that is the solution). The animator can call MirrorScene({ highlightWhite })
 * to tint the three white unit cubes post-answer.
 *
 * -------------------------------------------------------------------------------
 * Reconstruction (read from db/seed/wmi/figures/2022-final-g1-a-q24.jpg):
 *
 *   Coordinate convention for UNIT_CUBES (grid lattice, each entry one drawn
 *   1×1×1 cell of the iso outline):
 *     x — column, increasing to the screen-right / front-right
 *     y — depth,  increasing into the screen (back)
 *     z — height, increasing upward
 *
 *   The drawn staircase (iso outline with dashed hidden edges), 8 unit cubes,
 *   gravity-valid (every raised cube is supported):
 *     (0,0,0) (0,0,1) (0,0,2)   ← tall back-left column, height 3 → a BLACK 1×1×3
 *     (1,0,0) (1,0,1)           ← middle column, height 2        → a GRAY 1×1×2
 *     (1,1,0)                   ← cube tucked behind the middle column → WHITE
 *     (2,0,0) (2,1,0)           ← low front-right pair, height 1       → WHITE, WHITE
 *
 *   Decoding the two mirror shadows: a BLACK shadow cell forces a 1×1×3 piece and
 *   a GRAY shadow cell forces a 1×1×2 piece. Placing exactly one black 1×1×3
 *   (the tall back-left column) and one gray 1×1×2 (the middle column) to satisfy
 *   the dark mirror cells leaves three single cells that can only be 1×1×1 cubes.
 *   So WHITE = 3 — matching the answer key.
 *
 *   The mirror grids below are reproduced verbatim from the scan; the iso solid is
 *   drawn as a bare outline (no colour) exactly as the source presents it, so the
 *   static figure never shows the answer.
 *
 * Pure render — no Math.random, no Date, no state/effects. SSR-safe & deterministic.
 */

export type PieceColor = 'white' | 'gray' | 'black'

export interface Cube {
  x: number
  y: number
  z: number
}

/** The drawn unit-cube lattice of the iso solid (8 cubes). */
export const UNIT_CUBES: Cube[] = [
  // tall back-left column (height 3) → BLACK 1×1×3
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: 2 },
  // middle column (height 2) → GRAY 1×1×2
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 },
  // cube tucked behind the middle column → WHITE
  { x: 1, y: 1, z: 0 },
  // low front-right pair → WHITE, WHITE
  { x: 2, y: 0, z: 0 },
  { x: 2, y: 1, z: 0 },
]

/**
 * The three WHITE 1×1×1 cubes in the intended build (answer = 3). Used by
 * MirrorScene({ highlightWhite }) so the animator can reveal them post-answer.
 * The default illustration never references these for colouring.
 */
export const WHITE_CUBES: Cube[] = [
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 2, y: 1, z: 0 },
]

/** The forced long pieces (kept out of the static figure). */
export const BLACK_PIECE: Cube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: 2 },
]
export const GRAY_PIECE: Cube[] = [
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 },
]

/** Number of white 1×1×1 blocks used — the answer key. */
export const WHITE_COUNT = 3

/**
 * Left (side) mirror: 2 wide × 3 tall, top→bottom (reproduced from the scan).
 * Columns are the two depths (near, far).
 */
export const SIDE_MIRROR: (PieceColor | null)[][] = [
  ['gray', 'gray'],
  ['gray', 'white'],
  ['white', 'black'],
]

/** Back mirror: x–z grid, 3 wide × 3 tall, row 0 = top. null = empty cell. */
export const BACK_MIRROR: (PieceColor | null)[][] = [
  [null, 'gray', null],
  ['white', 'gray', 'gray'],
  ['black', 'black', 'black'],
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
const WHITE_TINT = '#FBBF77' // qupu peach-ish wash used to reveal white cubes
const EDGE = '#1f2937' // visible cube edges
const HIDDEN = '#9ca3af' // dashed hidden edges
const MIRROR_FRAME = '#cbd5e1'
const MIRROR_GRID = '#1f2937'
const LABEL = '#1f2937'

// ---------------------------------------------------------------------------
// Isometric projection
// ---------------------------------------------------------------------------

const U = 30 // half-cell horizontal run
const V = 17 // half-cell vertical run (depth tilt)
const H = 34 // cube height in pixels

/** Project a lattice point (x,y,z) → SVG (px,py). */
export function iso(x: number, y: number, z: number): [number, number] {
  const px = (x - y) * U
  const py = (x + y) * V - z * H
  return [px, py]
}

function sameCube(a: Cube, b: Cube) {
  return a.x === b.x && a.y === b.y && a.z === b.z
}

function cubeIn(c: Cube, list: Cube[]) {
  return list.some((p) => sameCube(p, c))
}

// ---------------------------------------------------------------------------
// IsoBlocks — primitive shared with the animator
// ---------------------------------------------------------------------------

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
        const top = `${P(x, y, z + 1)} ${P(x + 1, y, z + 1)} ${P(x + 1, y + 1, z + 1)} ${P(x, y + 1, z + 1)}`
        const left = `${P(x, y, z)} ${P(x, y + 1, z)} ${P(x, y + 1, z + 1)} ${P(x, y, z + 1)}`
        const right = `${P(x, y, z)} ${P(x + 1, y, z)} ${P(x + 1, y, z + 1)} ${P(x, y, z + 1)}`

        return (
          <g key={`${x}-${y}-${z}-${i}`}>
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
  for (const c of cubes) {
    const { x, y, z } = c
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
// MirrorScene — primitive shared with the animator
// ---------------------------------------------------------------------------
//
// Draws the whole scene (back mirror, side mirror, iso solid, legend). When
// `highlightWhite` is true, the three white 1×1×1 cubes are tinted so the
// animator can reveal them after the answer. The static default never sets it.

const SCENE_VIEW_W = 600
const SCENE_VIEW_H = 360

export interface MirrorSceneProps {
  highlightWhite?: boolean
  lang?: 'en' | 'id'
}

export function MirrorScene({ highlightWhite = false, lang = 'id' }: MirrorSceneProps) {
  const backLabel = lang === 'id' ? 'Cermin (belakang)' : 'Back mirror'
  const sideLabel = lang === 'id' ? 'Cermin (samping)' : 'Side mirror'

  const fillFn = highlightWhite
    ? (c: Cube) => (cubeIn(c, WHITE_CUBES) ? WHITE_TINT : CUBE_FILL)
    : undefined

  return (
    <g>
      {/* BACK mirror — upper centre */}
      <MirrorGrid grid={BACK_MIRROR} ox={210} oy={26} label={backLabel} />

      {/* LEFT (side) mirror — left */}
      <MirrorGrid grid={SIDE_MIRROR} ox={40} oy={150} label={sideLabel} />

      {/* The isometric solid — lower centre */}
      <IsoBlocks cubes={UNIT_CUBES} fill={fillFn} ox={250} oy={300} />

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
    </g>
  )
}

export { SCENE_VIEW_W, SCENE_VIEW_H }

// ---------------------------------------------------------------------------
// Default static illustration
// ---------------------------------------------------------------------------

const DISPLAY_W = Math.min(560, SCENE_VIEW_W)

export default function MirrorBlocks22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah benda padat disusun dari kubus 1×1×1 putih, balok 1×1×2 abu-abu, dan balok 1×1×3 hitam, digambar secara isometrik berbentuk tangga. Dua cermin menampilkan bayangannya: cermin samping berupa kisi 2×3 berwarna abu-abu, abu-abu, dan putih, hitam; cermin belakang berupa kisi 3×3 dengan baris bawah hitam dan kolom tengah abu-abu. Legend di kanan menampilkan tiga jenis balok berlabel 1×1×1, 1×1×2, dan 1×1×3. Berapa banyak balok putih 1×1×1 yang digunakan?"
    >
      <svg
        viewBox={`0 0 ${SCENE_VIEW_W} ${SCENE_VIEW_H}`}
        width={DISPLAY_W}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <MirrorScene />
      </svg>
    </div>
  )
}
