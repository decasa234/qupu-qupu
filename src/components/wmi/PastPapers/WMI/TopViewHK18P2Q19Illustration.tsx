/**
 * TopViewHK18P2Q19Illustration — HKIMO-18-P2H-Q19
 *
 * "At least how many squares can be seen if viewing the figure below from top?"
 * Answer: 5 visible top-faces.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-2/2018.imgs/004.jpg
 * The figure shows a zigzag/staircase voxel structure in isometric projection:
 *
 *   Ground layer (z=0):
 *     (0,0): front-left single cube
 *     (1,0): front-middle cube  [stacked 2-high]
 *     (0,1): back-left cube     [stacked 2-high]
 *     (1,1): back-middle single cube
 *     (2,1): back-right single cube
 *
 *   Top layer (z=1):
 *     (1,0,1): stacked on front-middle
 *     (0,1,1): stacked on back-left
 *
 *   Total cubes = 7.  Distinct (x,y) columns = 5 → 5 top squares visible ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem illustration (figure in the question body).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 7-cube staircase (two 2-high stacks, three single-height)
// Exported so the explainer can import and animate it.
// ---------------------------------------------------------------------------

export const HK18P2Q19_CUBES: IsoCube[] = [
  // Ground layer (z=0) — L-shaped zigzag footprint
  { x: 0, y: 0, z: 0 }, // front-left
  { x: 1, y: 0, z: 0 }, // front-middle
  { x: 0, y: 1, z: 0 }, // back-left
  { x: 1, y: 1, z: 0 }, // back-middle
  { x: 2, y: 1, z: 0 }, // back-right

  // Top layer (z=1) — two stacked columns
  { x: 1, y: 0, z: 1 }, // front-middle top
  { x: 0, y: 1, z: 1 }, // back-left top
]

// Five distinct (x,y) footprint positions → 5 visible squares from top
export const HK18P2Q19_TOP_POSITIONS: [number, number][] = [
  [0, 0], [1, 0], // front row
  [0, 1], [1, 1], [2, 1], // back row
]
export const HK18P2Q19_ANSWER = 5

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function TopViewHK18P2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure of seven unit cubes arranged in a zigzag staircase pattern. ' +
        'Two columns are stacked two cubes high. ' +
        'How many squares are visible when viewed from directly above?'
      }
    >
      <IsoCubes
        cubes={HK18P2Q19_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Isometric staircase figure — count top squares visible from above"
      />
    </div>
  )
}
