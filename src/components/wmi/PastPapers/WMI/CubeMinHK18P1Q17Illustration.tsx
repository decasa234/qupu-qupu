/**
 * CubeMinHK18P1Q17Illustration — HKIMO-18-P1H-Q17
 *
 * "At least how many cube(s) is / are there in the figure below?"
 * Answer: 9 cubes (minimum).
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-1/2018.imgs/003.jpg
 * The figure shows an L-shaped voxel structure in isometric projection:
 *
 *   Ground layer (z=0, 7 cubes):
 *     x=0: 2 deep (y=0,1) — left column base
 *     x=1: 2 deep (y=0,1) — middle base
 *     x=2: 2 deep (y=0,1) — right-middle base
 *     x=3: 1 deep (y=0)   — far-right front only
 *
 *   Top layer (z=1, 2 cubes):
 *     x=0: 2 deep (y=0,1) — left column stacked 2-high
 *
 *   Total minimum = 7 + 2 = 9  ✓
 *
 * "At least" = assume no cubes hidden beyond those strictly needed to support
 * the visible shape. All 9 positions are confirmed by the visible figure.
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 9-cube L-shape (minimum count)
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const HKIMO18P1H17_CUBES: IsoCube[] = [
  // Ground layer (z=0): L-shaped base — 7 cubes
  { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, // left column, 2 deep
  { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, // middle, 2 deep
  { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, // right-middle, 2 deep
  { x: 3, y: 0, z: 0 },                          // far-right, front only

  // Top layer (z=1): left column stacked 2-high — 2 cubes
  { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 },
]

export const HKIMO18P1H17_MIN = 9

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeMinHK18P1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric L-shaped figure made of unit cubes. ' +
        'The left column is 2 cubes tall and 2 cubes deep. ' +
        'The rest of the base extends to the right at ground level. ' +
        'Count the minimum number of cubes needed to build this shape.'
      }
    >
      <IsoCubes
        cubes={HKIMO18P1H17_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="L-shaped isometric figure — count the minimum cubes"
      />
    </div>
  )
}
