/**
 * StairPyramid22B11Illustration — SEAMO-22-B-Q11
 *
 * "The figure shown is made up of 3 layers of 2 × 2 × 2 cm cubes.
 *  Find the total area of the visible surfaces from the top and sides."
 * Answer: E (132 cm²).
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-b/2022.imgs/006.jpg
 * The figure is a stepped-back staircase pyramid in isometric projection:
 *
 *   Layer z=0 (bottom, 9 cubes): full 3 wide × 3 deep base
 *     x=0..2, y=0..2, z=0  → 9 cubes
 *
 *   Layer z=1 (middle, 6 cubes): 3 wide × 2 deep (stepped back 1)
 *     x=0..2, y=1..2, z=1  → 6 cubes
 *
 *   Layer z=2 (top, 3 cubes): 3 wide × 1 deep (back row only)
 *     x=0..2, y=2, z=2     → 3 cubes
 *
 *   Total cubes = 9 + 6 + 3 = 18 cubes
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — SSR-safe.
 * Classification: stem figure (appears in the question body, not as answer choices).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 18-cube stepped-back staircase pyramid
// Exported so the explainer can reuse and highlight faces.
// ---------------------------------------------------------------------------

export const SEAMO22B11_CUBES: IsoCube[] = [
  // z=0 bottom layer — 3 wide × 3 deep (9 cubes)
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },

  // z=1 middle layer — 3 wide × 2 deep, shifted back (y=1..2) (6 cubes)
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
  { x: 0, y: 2, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 2, y: 2, z: 1 },

  // z=2 top layer — 3 wide × 1 deep, back row only (y=2) (3 cubes)
  { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 }, { x: 2, y: 2, z: 2 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function StairPyramid22B11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric staircase pyramid made of 2×2×2 cm cubes. ' +
        'The bottom layer is 3×3 cubes (9 cubes). ' +
        'The middle layer is 3 wide × 2 deep (6 cubes), stepped one row back. ' +
        'The top layer is 3 cubes in a single back row. ' +
        'Find the total visible surface area from the top and sides.'
      }
    >
      <IsoCubes
        cubes={SEAMO22B11_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Staircase pyramid — find visible surface area"
      />
    </div>
  )
}
