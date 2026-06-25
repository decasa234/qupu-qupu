/**
 * StaircubeX20A8Illustration — SEAMOX-20-A-Q8
 *
 * "How many cubes are there in the figure below?" — answer: 13.
 *
 * Source image: docs/reference/ocr-res/seamo-x/contest/paper-a/2020.imgs/007.jpg
 * The figure shows a 3-step staircase solid in isometric projection:
 *
 *   Layer z=0 (bottom, 9 cubes): full 3 wide × 3 deep base
 *     x=0..2, y=0..2, z=0  → 9 cubes
 *
 *   Layer z=1 (middle, 3 cubes): front row only (y=0)
 *     x=0..2, y=0, z=1     → 3 cubes
 *
 *   Layer z=2 (top, 1 cube): front-left peak
 *     x=0, y=0, z=2        → 1 cube
 *
 *   Total = 9 + 3 + 1 = 13  ✓ (matches answer key)
 *
 * Adapted from CubeStack19A5Illustration (same layer-counting pattern).
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure appears in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 13-cube staircase solid
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const SEAMOX20A8_CUBES: IsoCube[] = [
  // z=0 bottom layer — 3 wide × 3 deep (9 cubes)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 },
  { x: 1, y: 2, z: 0 },
  { x: 2, y: 2, z: 0 },

  // z=1 middle layer — front row only (3 cubes)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 2, y: 0, z: 1 },

  // z=2 top layer — single peak (1 cube)
  { x: 0, y: 0, z: 2 },
]

export const SEAMOX20A8_TOTAL = 13

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function StaircubeX20A8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure made of unit cubes in a staircase arrangement. ' +
        'The bottom layer has 9 cubes (3 wide × 3 deep). ' +
        'The middle layer has 3 cubes stepping up at the front. ' +
        'The top layer has 1 cube at the front-left peak. ' +
        'Count all the cubes to find the total.'
      }
    >
      <IsoCubes
        cubes={SEAMOX20A8_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Staircase isometric solid — count the cubes"
      />
    </div>
  )
}
