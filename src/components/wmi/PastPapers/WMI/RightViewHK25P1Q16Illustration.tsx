/**
 * RightViewHK25P1Q16Illustration — HKIMO-25-P1H-Q16
 *
 * "At least how many square(s) can be seen if observing the figure below from the right?"
 * Answer: 7 squares.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-1/2025.imgs/005.jpg
 *
 * Cube layout (8 cubes total):
 *   Tall column back-left (x=0, y=2, z=0..3) — 4 cubes
 *   Middle step            (x=1, y=1, z=0)   — 1 cube
 *   Right step 2-high      (x=2, y=1, z=0,1) — 2 cubes
 *   Front-right single     (x=3, y=0, z=0)   — 1 cube
 *
 * Right-side view projects onto yz plane → 7 distinct (y,z) cells.
 *
 * Reuses IsoCubes primitive — painter-sorted, SSR-safe.
 * Classification: stem illustration (no picture options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — exported so the explainer can reuse + colour-override
// ---------------------------------------------------------------------------

export const HK25P1Q16_CUBES: IsoCube[] = [
  // Tall column — back-left
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 2, z: 1 },
  { x: 0, y: 2, z: 2 },
  { x: 0, y: 2, z: 3 },
  // Middle step
  { x: 1, y: 1, z: 0 },
  // Right step (2 high)
  { x: 2, y: 1, z: 0 },
  { x: 2, y: 1, z: 1 },
  // Front-right single cube
  { x: 3, y: 0, z: 0 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function RightViewHK25P1Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Isometric 3-D arrangement of 8 unit cubes: a column of 4 cubes at the back-left, ' +
        'stepping forward and right with single and stacked cubes. ' +
        'Count the unit squares visible when looking from the right side.'
      }
    >
      <IsoCubes
        cubes={HK25P1Q16_CUBES}
        size={28}
        palette={ISO_BLUE_PALETTE}
        viewPadding={12}
      />
    </div>
  )
}
