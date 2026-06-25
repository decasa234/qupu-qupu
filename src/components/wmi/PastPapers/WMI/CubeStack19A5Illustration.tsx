/**
 * CubeStack19A5Illustration — SEAMO-19-A-Q5
 *
 * "How many cubes are there in the figure below?"
 * Answer: A (12 cubes).
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-a/2019.imgs/003.jpg
 * The figure shows a stepped solid in isometric projection:
 *
 *   Layer z=0 (bottom, 8 cubes): full 4 wide × 2 deep rectangle
 *     x=0..3, y=0..1, z=0  → 8 cubes
 *
 *   Layer z=1 (middle, 3 cubes): staircase step — front-left 3
 *     x=0..2, y=0, z=1     → 3 cubes
 *
 *   Layer z=2 (top, 1 cube): peak — front-left corner
 *     x=0, y=0, z=2        → 1 cube
 *
 *   Total = 8 + 3 + 1 = 12  ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure appears in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 12-cube stepped L-solid
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const SEAMO19A5_CUBES: IsoCube[] = [
  // z=0 bottom layer — 4 wide × 2 deep (8 cubes)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 3, y: 1, z: 0 },

  // z=1 middle layer — front-left 3 cubes (3 cubes)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 2, y: 0, z: 1 },

  // z=2 top layer — single peak (1 cube)
  { x: 0, y: 0, z: 2 },
]

export const SEAMO19A5_TOTAL = 12

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeStack19A5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure made of unit cubes in a stepped arrangement. ' +
        'The bottom layer has 8 cubes (4 wide × 2 deep). ' +
        'The middle layer has 3 cubes stepping up on the left-front. ' +
        'The top layer has 1 cube at the upper-left peak. ' +
        'Count all the cubes to find the total.'
      }
    >
      <IsoCubes
        cubes={SEAMO19A5_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Stepped isometric solid — count the cubes"
      />
    </div>
  )
}
