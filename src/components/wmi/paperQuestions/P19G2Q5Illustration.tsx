// Cube-pile counting figure for WMI-19P2A-Q5 (2019 Semifinal Grade 2).
//
// Source figure (db/seed/wmi/figures/2019-semifinal-g2-a-q5.jpg): a 3-D pile of
// unit cubes resting in a corner (a gray back wall + floor), stepping up toward
// the back-left. The pile contains hidden cubes that support the visible ones.
// "Total number of cubes = ( )?"  Answer: 21 (choice C); trap 19 = visible only.
//
// We redraw it as a deterministic isometric pile from a HEIGHT-MAP. Cubes are
// drawn back-to-front, left-to-right, bottom-to-top so nearer/higher cubes
// correctly overlap farther/lower ones. The static QUESTION figure draws the
// pile only — no count, no layer tinting. The explainer reuses the co-exported
// CubePile primitive and passes `litLevel` to count one horizontal layer at a
// time, landing on 21.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

import type { ReactNode } from 'react'

const INK = '#1F2937'
const TOP = '#FFFFFF' // top face
const LEFT_FACE = '#EDEFF2' // left/front-left face
const RIGHT_FACE = '#D6DBE1' // right/front-right (shaded) face
const LIT_TOP = '#FFE9A8' // highlighted layer top
const LIT_LEFT = '#FFD773'
const LIT_RIGHT = '#F4C24E'

// ---------------------------------------------------------------------------
// Height-map: HEIGHTS[d][c] = how many cubes stacked at depth-row d, column c.
// d = 0 is the BACK row, increasing toward the viewer; c = 0 is the LEFT column.
// Column sum = total cubes.
//   back : 3 2 2 1   = 8
//   mid  : 2 2 1 1   = 6
//   front: 2 2 2 1   = 7   → total 21
export const HEIGHTS: number[][] = [
  [3, 2, 2, 1],
  [2, 2, 1, 1],
  [2, 2, 2, 1],
]
export const DEPTH = HEIGHTS.length // 3
export const WIDTH = HEIGHTS[0].length // 4
export const MAX_H = Math.max(...HEIGHTS.flat()) // 3
export const TOTAL_CUBES = HEIGHTS.flat().reduce((a, b) => a + b, 0) // 21

/** Cubes in horizontal layer z (0-based): footprint cells with height > z. */
export function cubesInLevel(z: number): number {
  return HEIGHTS.flat().filter((h) => h > z).length
}
// level 0 = 12, level 1 = 8, level 2 = 1  → 12 + 8 + 1 = 21

// ---------------------------------------------------------------------------
// Isometric projection. One cube is a unit; we use a simple 2:1 dimetric look.
const U = 30 // cube edge in screen px (left/right run)
const ISO = 16 // vertical offset of a depth/right step
const RISE = 34 // vertical drop per stacked level

// Screen position of the BOTTOM-FRONT corner of the cube at (d, c, z).
// Column c moves right+down; depth d moves left+down (toward viewer); z moves up.
function project(d: number, c: number, z: number, ox: number, oy: number): [number, number] {
  const x = ox + c * U - d * (U * 0.5)
  const y = oy + c * ISO + d * (ISO + RISE * 0.0) - z * RISE
  return [x, y]
}

/** One isometric cube whose footprint sits at (d, c) on stack level z. */
function Cube({ d, c, z, ox, oy, lit }: { d: number; c: number; z: number; ox: number; oy: number; lit: boolean }) {
  // The "back" direction (decreasing depth) goes RIGHT and UP on screen:
  //   +0.5U in x, -ISO in y. The top + right faces are built from that offset.
  const depX = U * 0.5 // back-step run in x (rightward)
  const depY = ISO // back-step run in y (upward magnitude)
  const [bx, by] = project(d, c, z, ox, oy) // front-bottom-left anchor

  // front face corners (the square facing the viewer)
  const fTL: number[] = [bx, by - RISE]
  const fTR: number[] = [bx + U, by - RISE]
  const fBR: number[] = [bx + U, by]
  const fBL: number[] = [bx, by]

  // top face: front-top edge (fTL,fTR) plus the same edge stepped to the back
  const tTL: number[] = [fTL[0] + depX, fTL[1] - depY]
  const tTR: number[] = [fTR[0] + depX, fTR[1] - depY]
  const top = [fTL, fTR, tTR, tTL]

  // right (side) face: front-right edge (fTR,fBR) stepped to the back
  const rBR: number[] = [fBR[0] + depX, fBR[1] - depY]
  const right = [fTR, tTR, rBR, fBR]

  const pts = (a: number[][]) => a.map((p) => `${p[0]},${p[1]}`).join(' ')
  return (
    <g>
      {/* right/side face (shaded) */}
      <polygon points={pts(right)} fill={lit ? LIT_RIGHT : RIGHT_FACE} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* front face */}
      <polygon
        points={pts([fTL, fTR, fBR, fBL])}
        fill={lit ? LIT_LEFT : LEFT_FACE}
        stroke={INK}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* top face */}
      <polygon points={pts(top)} fill={lit ? LIT_TOP : TOP} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  )
}

export const PILE_VIEW_W = 300
export const PILE_VIEW_H = 270

export interface CubePileProps {
  /**
   * Highlight cubes up to and including this horizontal layer (1-based):
   *   1 = light the bottom layer, 2 = bottom+middle, etc.
   *   0 (default) = none highlighted (pristine question figure).
   */
  litLevel?: number
}

/**
 * Primitive board. At litLevel = 0 it draws the plain pile (the question
 * figure). litLevel > 0 tints every cube in layers z < litLevel so the
 * explainer can count layer by layer.
 */
export function CubePile({ litLevel = 0 }: CubePileProps) {
  // origin chosen so the whole pile is centred with headroom.
  const ox = 96
  const oy = 178

  // Draw order: farthest+lowest+leftmost first so nearer/higher overlap.
  // Painter's order: by d ascending (back→front), z ascending (bottom→top),
  // c ascending (left→right) gives correct overlap for this projection.
  const cubes: ReactNode[] = []
  for (let d = 0; d < DEPTH; d++) {
    for (let z = 0; z < MAX_H; z++) {
      for (let c = 0; c < WIDTH; c++) {
        if (HEIGHTS[d][c] > z) {
          const lit = litLevel > 0 && z < litLevel
          cubes.push(<Cube key={`d${d}z${z}c${c}`} d={d} c={c} z={z} ox={ox} oy={oy} lit={lit} />)
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${PILE_VIEW_W} ${PILE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: PILE_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {cubes}
    </svg>
  )
}

const ARIA =
  'Tumpukan kubus satuan tiga dimensi yang bertingkat naik ke arah kiri-belakang. ' +
  'Beberapa kubus tersembunyi menopang kubus di atasnya. Hitung banyaknya kubus seluruhnya.'

/**
 * Question figure — the plain cube pile. No count, no layer tinting.
 */
export default function P19G2Q5Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <CubePile litLevel={0} />
    </div>
  )
}
