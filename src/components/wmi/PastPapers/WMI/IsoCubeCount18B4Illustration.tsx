/**
 * IsoCubeCount18B4Illustration — SEAMO-18-B-Q4
 *
 * "How many cubes are there in the figure below?"
 * Answer: B (22 cubes).
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-b/2018.imgs/003.jpg
 * The figure shows a 3-level stepped solid in isometric projection:
 *
 *   Layer z=0 (bottom, 12 cubes): 4 wide × 3 deep full base
 *     x=0..3, y=0..2, z=0  → 12 cubes
 *
 *   Layer z=1 (middle, 7 cubes): 3-wide × 2-deep block on the left
 *   plus one extra cube in back-right of row 1:
 *     x=0..2, y=0..1, z=1  → 6 cubes
 *     x=3,    y=0,    z=1  → 1 cube   (right column, front only)
 *
 *   Layer z=2 (top, 3 cubes): left 2 columns, 1 deep (front) + 1 back
 *     x=0,    y=0..1, z=2  → 2 cubes  (leftmost column, 2 deep)
 *     x=1,    y=0,    z=2  → 1 cube   (second column, front)
 *
 *   Total = 12 + 7 + 3 = 22  ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Classification: stem (the figure appears in the question body, not as answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 22-cube stepped solid
// ---------------------------------------------------------------------------

export const SEAMO18B4_CUBES: IsoCube[] = [
  // z=0 bottom layer — 4 wide × 3 deep (12 cubes)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 3, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 },
  { x: 1, y: 2, z: 0 },
  { x: 2, y: 2, z: 0 },
  { x: 3, y: 2, z: 0 },

  // z=1 middle layer — 3 wide × 2 deep + 1 right-front (7 cubes)
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 1 },
  { x: 2, y: 0, z: 1 },
  { x: 3, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: 2, y: 1, z: 1 },

  // z=2 top layer — left column (2 deep) + second column front (3 cubes)
  { x: 0, y: 0, z: 2 },
  { x: 0, y: 1, z: 2 },
  { x: 1, y: 0, z: 2 },
]

export const SEAMO18B4_TOTAL = 22

// ---------------------------------------------------------------------------
// Component — stem illustration
// ---------------------------------------------------------------------------

export default function IsoCubeCount18B4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure made of unit cubes arranged in steps. ' +
        'The bottom layer has 12 cubes (4 wide × 3 deep). ' +
        'The middle layer has 7 cubes stepping up on the left and front. ' +
        'The top layer has 3 cubes on the upper-left column. ' +
        'Total: 22 cubes.'
      }
    >
      <IsoCubes
        cubes={SEAMO18B4_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Stepped solid — count the cubes (answer: 22)"
      />
    </div>
  )
}
