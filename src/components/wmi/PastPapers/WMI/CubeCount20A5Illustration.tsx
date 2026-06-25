/**
 * CubeCount20A5Illustration — SEAMO-20-A-Q5
 *
 * "How many cubes are there in the model below?"
 * Answer: C (10 cubes).
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-a/2020.imgs/005.jpg
 * The figure shows a stepped pyramid in isometric projection:
 *
 *   Layer z=0 (bottom, 6 cubes): 3 wide × 2 deep rectangle
 *     x=0..2, y=0..1, z=0  → 6 cubes
 *
 *   Layer z=1 (top, 4 cubes): 2 wide × 2 deep square on the back-left
 *     x=0..1, y=0..1, z=1  → 4 cubes
 *
 *   Total = 6 + 4 = 10  ✓  (answer C)
 *
 * Trap: counting only visible cubes from the front gives 9 — one cube is
 * hidden behind in the bottom layer.
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure appears in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 10-cube stepped pyramid
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const SEAMO20A5_CUBES: IsoCube[] = [
  // z=0 bottom layer — 3 wide × 2 deep (6 cubes)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },

  // z=1 top layer — 2 wide × 2 deep (4 cubes)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
]

export const SEAMO20A5_TOTAL = 10

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeCount20A5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure made of unit cubes in a stepped pyramid arrangement. ' +
        'The bottom layer has 6 cubes (3 wide × 2 deep). ' +
        'The top layer has 4 cubes (2 wide × 2 deep) centred on the back-left. ' +
        'Count all the cubes — including hidden ones — to find the total.'
      }
    >
      <IsoCubes
        cubes={SEAMO20A5_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Stepped isometric pyramid — count the cubes"
      />
    </div>
  )
}
