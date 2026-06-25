/**
 * CubeCountX24A1Illustration — SEAMOX-24-A-Q1
 *
 * "Count the number of cubes."
 * Answer: 16 cubes.
 *
 * Source image: docs/reference/ocr-res/seamo-x/contest/paper-a/2024.imgs/002.jpg
 * The figure shows a 3-step staircase in isometric projection, 2 cubes deep:
 *
 *   x=0 (leftmost, tallest): z=0,1,2 — 3 high × 2 deep = 6 cubes
 *   x=1 (middle-left):       z=0,1   — 2 high × 2 deep = 4 cubes
 *   x=2 (middle-right):      z=0,1   — 2 high × 2 deep = 4 cubes
 *   x=3 (rightmost, shortest):z=0    — 1 high × 2 deep = 2 cubes
 *
 *   Bottom layer (z=0): 4 wide × 2 deep = 8 cubes
 *   Top layers  (z≥1):  6 + 2           = 8 cubes
 *   Total = 16 ✓
 *
 * Trap: counting only visible faces misses cubes hidden behind — count full layers.
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (figure in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 16-cube 3-step staircase (depth 2)
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

export const SEAMOX24A1_CUBES: IsoCube[] = [
  // x=0 (leftmost): 3 high, 2 deep — 6 cubes
  { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 },
  { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 2 },

  // x=1 (middle-left): 2 high, 2 deep — 4 cubes
  { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 },
  { x: 1, y: 0, z: 1 }, { x: 1, y: 1, z: 1 },

  // x=2 (middle-right): 2 high, 2 deep — 4 cubes
  { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 },
  { x: 2, y: 0, z: 1 }, { x: 2, y: 1, z: 1 },

  // x=3 (rightmost): 1 high, 2 deep — 2 cubes
  { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 },
]

export const SEAMOX24A1_TOTAL = 16

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeCountX24A1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric staircase made of unit cubes — 3 steps, 2 cubes deep. ' +
        'Left column is 3 cubes tall, middle two columns are 2 cubes tall, right column is 1 cube tall. ' +
        'Count every cube including those hidden behind others to find the total.'
      }
    >
      <IsoCubes
        cubes={SEAMOX24A1_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="3-step isometric staircase — count the cubes"
      />
    </div>
  )
}
