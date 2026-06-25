/**
 * BoxFillOSN07KQ5Illustration — OSN-07-SD-KAB-Q5
 *
 * "Berapa banyak kubus satuan yang masih diperlukan untuk memenuhi kotak berbentuk balok?"
 * Answer: 22  (box 4×3×3 = 36, placed = 14, needed = 36 − 14 = 22)
 *
 * Source: docs/reference/ocr-res/osn/kabupaten/sd/2007.imgs/001.jpg
 * Isometric view of a 4×3×3 box with 14 cubes in a diagonal staircase.
 *
 * Primitives: isoProject from ./primitives/IsoCubes (no re-derivation of math).
 * Custom SVG for box wireframe + manually painted cube polygons in painter order.
 */

import React from 'react'
import { isoProject } from './primitives/IsoCubes'

// ─── Geometry constants ───────────────────────────────────────────────────────
const S  = 22           // cube edge px
const CX = S * 0.866    // ≈ 19.05 — horizontal iso unit
const CY = S * 0.5      // 11 — vertical iso unit

// ─── Placed cubes: 14 in diagonal staircase ──────────────────────────────────
// Back row (y=2):   x=0 → h3, x=1 → h3, x=2 → h2, x=3 → h1  (9 cubes)
// Middle row (y=1): x=0 → h2, x=1 → h1, x=2 → h1             (4 cubes)
// Front row (y=0):  x=0 → h1                                   (1 cube)
// Total placed = 14; box = 4×3×3 = 36; needed = 22  ✓

interface Vox { x: number; y: number; z: number }

export const PLACED_CUBES: Vox[] = [
  // back row
  { x: 0, y: 2, z: 0 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 2, z: 2 },
  { x: 1, y: 2, z: 0 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 2, z: 2 },
  { x: 2, y: 2, z: 0 }, { x: 2, y: 2, z: 1 },
  { x: 3, y: 2, z: 0 },
  // middle row
  { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  // front row
  { x: 0, y: 0, z: 0 },
]

// ─── Painter sort: back-to-front (high y first, then low z, then low x) ──────
function painterSort(cubes: Vox[]): Vox[] {
  return [...cubes].sort((a, b) => b.y - a.y || a.z - b.z || a.x - b.x)
}

// ─── Cube face polygons ───────────────────────────────────────────────────────
function cubePolygons(c: Vox) {
  const { sx, sy } = isoProject(c.x, c.y, c.z, S)
  return {
    top:   `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`,
    left:  `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+S} ${sx},${sy+S}`,
    right: `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+S} ${sx+CX},${sy+CY+S}`,
  }
}

// ─── Box wireframe corners (4×3×3) ────────────────────────────────────────────
const [A, B, C, D, E, F, G, H] = [
  isoProject(0, 0, 0, S), isoProject(4, 0, 0, S),
  isoProject(0, 3, 0, S), isoProject(4, 3, 0, S),
  isoProject(0, 0, 3, S), isoProject(4, 0, 3, S),
  isoProject(0, 3, 3, S), isoProject(4, 3, 3, S),
]

const BOX_EDGES: Array<[typeof A, typeof A]> = [
  // bottom face
  [A, B], [B, D], [C, D], [A, C],
  // top face
  [E, F], [F, H], [G, H], [E, G],
  // vertical pillars
  [A, E], [B, F], [C, G], [D, H],
]

// ─── Shared scene component (also used by the explainer) ─────────────────────
interface BoxFillSceneProps {
  /** When true, show ghost cubes for all 36 empty positions */
  showGhost?: boolean
  /** When true, render placed cubes in gold instead of blue */
  highlightPlaced?: boolean
}

export function BoxFillScene({ showGhost = false, highlightPlaced = false }: BoxFillSceneProps) {
  // Build ghost cubes for all 36 positions, minus placed ones
  const PLACED_SET = new Set(PLACED_CUBES.map(c => `${c.x},${c.y},${c.z}`))
  const ghostCubes: Vox[] = []
  if (showGhost) {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (!PLACED_SET.has(`${x},${y},${z}`)) {
            ghostCubes.push({ x, y, z })
          }
        }
      }
    }
  }

  const allCubes = painterSort([...ghostCubes, ...PLACED_CUBES])

  const placedTop   = highlightPlaced ? '#FFD23F' : '#D6EBF7'
  const placedLeft  = highlightPlaced ? '#F4B400' : '#8FC6E8'
  const placedRight = highlightPlaced ? '#D97706' : '#5BA8D4'
  const placedInk   = '#1F2937'

  return (
    <svg
      viewBox="-15 -112 168 172"
      width="100%"
      style={{ display: 'block', maxWidth: 340, margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Box wireframe — draw first so placed cubes render on top */}
      {BOX_EDGES.map(([p1, p2], i) => (
        <line
          key={`box-${i}`}
          x1={p1.sx} y1={p1.sy}
          x2={p2.sx} y2={p2.sy}
          stroke="#94A3B8"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}

      {/* All cubes in painter order */}
      {allCubes.map((c) => {
        const key = `${c.x},${c.y},${c.z}`
        const isPlaced = PLACED_SET.has(key)
        const { top, left, right } = cubePolygons(c)

        const topFill   = isPlaced ? placedTop   : '#EBF5FB'
        const leftFill  = isPlaced ? placedLeft  : '#D6EAF8'
        const rightFill = isPlaced ? placedRight : '#AED6F1'
        const ink       = isPlaced ? placedInk   : '#94A3B8'
        const sw        = isPlaced ? 1.3         : 0.8

        return (
          <g key={key}>
            <polygon points={top}   fill={topFill}   stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
            <polygon points={left}  fill={leftFill}  stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
            <polygon points={right} fill={rightFill} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Default export: stem illustration ───────────────────────────────────────
export default function BoxFillOSN07KQ5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Kotak balok 4×3×3 yang sebagian terisi kubus satuan dalam pola tangga diagonal. ' +
        'Diperlukan 22 kubus lagi untuk memenuhi kotak.'
      }
    >
      <BoxFillScene />
    </div>
  )
}
