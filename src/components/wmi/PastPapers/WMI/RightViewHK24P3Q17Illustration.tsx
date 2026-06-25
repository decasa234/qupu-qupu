/**
 * RightViewHK24P3Q17Illustration — HKIMO-24-P3H-Q17
 *
 * "At least how many square(s) can be seen if viewing the figure below from
 * the right?" — Answer: 4.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-3/2024.imgs/007.jpg
 *
 * Cube arrangement (x=right, y=depth/back, z=up):
 *   y=0 (front row):  (1,0,0) (2,0,0) (3,0,0) (4,0,0)  — 4 ground cubes
 *   y=1 (back cluster):
 *     (0,1,0)              — isolated left cube
 *     (1,1,0) (1,1,1) (1,1,2) — 3-tall tower
 *     (2,1,0) (2,1,1)     — 2-tall column beside tower
 *     (3,1,0)              — right of cluster
 *
 * Right-side view (y-z silhouette, looking along −x axis):
 *   (y=0, z=0): rightmost cube x=4 → visible
 *   (y=1, z=0): rightmost cube x=3 → visible
 *   (y=1, z=1): rightmost cube x=2 → visible
 *   (y=1, z=2): rightmost cube x=1 → visible
 *   Total = 4 visible squares ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Stem illustration only; the choices are numeric fill-in, not picture options.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — matches the source figure (007.jpg)
// ---------------------------------------------------------------------------

export const HK24P3Q17_CUBES: IsoCube[] = [
  // y=0 front row — ground only
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 4, y: 0, z: 0 },
  // y=1 back cluster
  { x: 0, y: 1, z: 0 }, // isolated left cube
  { x: 1, y: 1, z: 0 }, // tower base
  { x: 1, y: 1, z: 1 }, // tower 2nd
  { x: 1, y: 1, z: 2 }, // tower top (3-high)
  { x: 2, y: 1, z: 0 }, // 2-column base
  { x: 2, y: 1, z: 1 }, // 2-column top
  { x: 3, y: 1, z: 0 }, // right ground
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RightViewHK24P3Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A 3-D arrangement of unit cubes. From the right side, exactly 4 squares are visible: ' +
        'one from the front row (ground level) and three from the back cluster (ground, 2nd, and 3rd level).'
      }
    >
      <div className="flex justify-center">
        <IsoCubes
          cubes={HK24P3Q17_CUBES}
          size={26}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
      </div>
    </div>
  )
}
