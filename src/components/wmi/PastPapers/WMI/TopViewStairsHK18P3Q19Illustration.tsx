/**
 * TopViewStairsHK18P3Q19Illustration — HKIMO-18-P3H-Q19
 *
 * "At least how many square(s) can be seen if observing the figure below
 * from the top?" — Answer: 8.
 *
 * Figure: 4-step staircase, 2 cubes deep in y.
 *   x=0 (leftmost, height 4): y=0, y=1
 *   x=1 (height 3):           y=0, y=1
 *   x=2 (height 2):           y=0, y=1
 *   x=3 (rightmost, height 1):y=0, y=1
 *
 * Top-view footprint: 4 columns × 2 rows = 8 cells → answer = 8.
 *
 * Source: docs/reference/ocr-res/hkimo/heat/primary-3/2018.imgs/003.jpg
 * Reuses IsoCubes from ./primitives/IsoCubes.
 * SSR-safe — no hooks, no Math.random, no window/document.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Cube voxels — 4-step staircase, 2 cubes deep in y
// Heights decrease from left (x=0, h=4) to right (x=3, h=1)
// ---------------------------------------------------------------------------

export const HK18P3Q19_CUBES: IsoCube[] = [
  // x=3 (rightmost, height 1)
  { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 },
  // x=2 (height 2)
  { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 },
  { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
  // x=1 (height 3)
  { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 2 },
  { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 2 },
  // x=0 (leftmost, height 4)
  { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }, { x: 0, y: 0, z: 3 },
  { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 2 }, { x: 0, y: 1, z: 3 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (problem only, never shows the answer)
// ---------------------------------------------------------------------------

export default function TopViewStairsHK18P3Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        '3D staircase: 4 steps (heights 1–4 from right to left), each step 2 cubes deep. ' +
        'Count the unit squares visible from directly above.'
      }
    >
      <div className="flex justify-center">
        <IsoCubes
          cubes={HK18P3Q19_CUBES}
          size={24}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
      </div>
    </div>
  )
}
