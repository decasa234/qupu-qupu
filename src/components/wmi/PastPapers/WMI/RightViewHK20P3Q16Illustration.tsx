/**
 * RightViewHK20P3Q16Illustration — HKIMO-20-P3H-Q16
 *
 * "At least how many square(s) can be seen if viewing the figure below from the right?"
 * Answer: 3.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-3/2020.imgs/006.jpg
 *
 * The figure is an isometric arrangement of 10 unit cubes:
 *   Front row (y=0): four ground cubes side-by-side (x=0..3, z=0)
 *   Back row (y=1): two 2-high stacks (x=0,1; z=0,1) + two ground cubes (x=2,3; z=0)
 *
 * Right-view projection (from +x direction):
 *   Occupied (y,z) cells: (0,0), (1,0), (1,1) → 3 squares ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — shared with explainer
// ---------------------------------------------------------------------------

export const HK20P3Q16_CUBES: IsoCube[] = [
  // y=0 (front row) — four ground-level cubes
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  // y=1 (back row) — left 2-high stack
  { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
  // y=1 (back row) — right 2-high stack
  { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
  // y=1 (back row) — two ground cubes extending right
  { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem, not the answer)
// ---------------------------------------------------------------------------

export default function RightViewHK20P3Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Isometric figure of 10 unit cubes: four cubes in the front row, ' +
        'two 2-high stacks and two ground cubes in the back row. ' +
        'Question: how many squares are visible from the right?'
      }
    >
      <div className="flex justify-center">
        <IsoCubes
          cubes={HK20P3Q16_CUBES}
          size={28}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
      </div>
    </div>
  )
}
