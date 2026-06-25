/**
 * CubeStair19HKP3Q16Illustration — HKIMO-19-P3H-Q16
 *
 * "At least how many square(s) can be seen if observing the figure below from the right?"
 * Answer: 4.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-3/2019.imgs/002.jpg
 *
 * Structure (9 cubes total):
 *   Front staircase (y=0):
 *     x=0: height 3  (z=0,1,2)
 *     x=1: height 2  (z=0,1)
 *     x=2: height 1  (z=0)
 *   Back flat row (y=1):
 *     x=0,1,2: height 1 each (z=0)
 *
 * Right-side view (looking in −X direction → YZ plane):
 *   y=0: z=0,1,2 → 3 squares
 *   y=1: z=0     → 1 square
 *   Total = 4   ✓
 *
 * Stem illustration — does NOT reveal the answer, shows only the 3-D arrangement.
 * Reuses IsoCubes primitive from ./primitives/IsoCubes.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel data — exported so the explainer can reuse and highlight subsets
// ---------------------------------------------------------------------------

/** Front staircase cubes (y=0), heights 3-2-1 at x=0,1,2 */
export const STAIR_FRONT_CUBES: IsoCube[] = [
  { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }, // h=3
  { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 },                          // h=2
  { x: 2, y: 0, z: 0 },                                                   // h=1
]

/** Back flat-row cubes (y=1), all at z=0 */
export const STAIR_BACK_CUBES: IsoCube[] = [
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
]

/** Full 9-cube structure */
export const HKIMO19P3Q16_CUBES: IsoCube[] = [
  ...STAIR_BACK_CUBES,   // back row first (painter-order: y=1 > y=0)
  ...STAIR_FRONT_CUBES,
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CubeStair19HKP3Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric figure made of 9 unit cubes. ' +
        'The front section is a staircase with 3, 2, and 1 cubes tall from left to right. ' +
        'Behind it sits a flat row of 3 cubes. ' +
        'Question: how many unit squares can you see when looking at this from the right side?'
      }
    >
      <IsoCubes
        cubes={HKIMO19P3Q16_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Isometric cube staircase — observe from the right side"
      />
    </div>
  )
}
