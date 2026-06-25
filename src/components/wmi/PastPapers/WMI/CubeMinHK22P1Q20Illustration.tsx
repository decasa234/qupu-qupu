/**
 * CubeMinHK22P1Q20Illustration — HKIMO-22-P1H-Q20
 *
 * "At least how many cube(s) is / are there in the figure below?"
 * Answer: 10 cubes (minimum).
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-1/2022.imgs/006.jpg
 * The figure shows a staircase-S voxel structure in isometric projection:
 *
 *   Step 1 (z=0 and z=1): single column, 2 high — far-left corner
 *     x=0, y=0: ground + elevated (tower)
 *
 *   Ground layer (z=0, 9 cubes — staircase S-shape):
 *     x=0,y=0 · x=1,y=0 · x=1,y=1
 *     x=2,y=1 · x=2,y=2
 *     x=3,y=1 · x=3,y=2 · x=4,y=1 · x=4,y=2
 *
 *   Top layer (z=1, 1 cube):
 *     x=0,y=0 — the tower top
 *
 *   Total minimum = 9 + 1 = 10  ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 10-cube staircase-S (minimum count)
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const HKIMO22P1H20_CUBES: IsoCube[] = [
  // Ground layer (z=0): staircase S-shape — 9 cubes
  { x: 0, y: 0, z: 0 },                          // tower base
  { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 },  // step 1
  { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 },  // step 2
  { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 },  // right block left
  { x: 4, y: 1, z: 0 }, { x: 4, y: 2, z: 0 },  // right block right

  // Top layer (z=1): tower top — 1 cube
  { x: 0, y: 0, z: 1 },
]

export const HKIMO22P1H20_MIN = 10

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeMinHK22P1Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric staircase figure made of unit cubes. ' +
        'A 2-cube-tall column stands at the far left. ' +
        'Steps descend right-and-back, ending in a 2×2 block at the right. ' +
        'Count the minimum number of cubes needed to build this shape.'
      }
    >
      <IsoCubes
        cubes={HKIMO22P1H20_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Staircase-S isometric figure — count the minimum cubes"
      />
    </div>
  )
}
