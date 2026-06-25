/**
 * IsoCubesTopHK24P2Q17Illustration — HKIMO-24-P2H-Q17
 *
 * "At least how many unit square(s) can be seen if viewing the figure below
 * from the top?" — Answer: 13
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-2/2024.imgs/005.jpg
 *
 * The figure is an irregular isometric cube arrangement. Viewed from the top,
 * exactly 13 grid positions are occupied — each position contributes one unit
 * square regardless of how tall the stack is.
 *
 * Top-view footprint (13 distinct (x, y) positions):
 *   y=0 (front):  x = 0, 2, 3, 4, 5  →  5 positions
 *   y=1 (middle): x = 1, 2, 3, 4, 5  →  5 positions
 *   y=2 (back):   x = 1, 2, 3        →  3 positions
 *                                        ──────────
 *                                        13  ✓
 *
 * Heights: (1,1) and (2,1) are 2-high stacks; (3,1) is the 3-high central
 * tower; all other positions hold one cube.
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — exported so the explainer can reuse and highlight rows.
// ---------------------------------------------------------------------------

export const HK24P2Q17_CUBES: IsoCube[] = [
  // Front row (y=0): 5 footprint positions — includes the lone cube at far-left
  { x: 0, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  { x: 4, y: 0, z: 0 },
  { x: 5, y: 0, z: 0 },

  // Middle row (y=1): 5 footprint positions — 2-high stacks + 3-high tower
  { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
  { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
  { x: 3, y: 1, z: 0 }, { x: 3, y: 1, z: 1 }, { x: 3, y: 1, z: 2 },
  { x: 4, y: 1, z: 0 },
  { x: 5, y: 1, z: 0 },

  // Back row (y=2): 3 footprint positions
  { x: 1, y: 2, z: 0 },
  { x: 2, y: 2, z: 0 },
  { x: 3, y: 2, z: 0 },
]

/** 13 distinct (x, y) pairs → 13 unit squares visible from the top */
export const HK24P2Q17_TOP_COUNT = 13

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem; does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function IsoCubesTopHK24P2Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Isometric figure made of unit cubes in an irregular arrangement. ' +
        'There is a lone cube at the front-left, two 2-high stacks in the middle row, ' +
        'a 3-high tower in the centre, and single cubes on the sides and back. ' +
        'How many unit squares can be seen when viewing the whole figure from directly above?'
      }
    >
      <IsoCubes
        cubes={HK24P2Q17_CUBES}
        size={24}
        palette={ISO_BLUE_PALETTE}
        viewPadding={12}
        label="Irregular isometric cube arrangement — count visible unit squares from the top"
      />
    </div>
  )
}
