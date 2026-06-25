/**
 * RightViewHK23P3SFQ19Illustration — HKIMO-23-P3SF-Q19
 *
 * "At least how many square(s) can be seen if viewing the figure below from the right?"
 * Answer: 7
 *
 * Source image: docs/reference/ocr-res/hkimo/semifinal/primary-3/2023.imgs/007.jpg
 *
 * Cube layout (x=right, y=depth/into-screen, z=up):
 *
 *   Back cluster (y=5):
 *     (0,5,0), (0,5,1) — 2-high stack
 *     (1,5,0)           — adjacent single
 *
 *   Middle row (y=3):
 *     (1,3,0), (2,3,0), (3,3,0), (4,3,0) — 4 flat cubes
 *
 *   Front-left pair (y=1):
 *     (0,1,0), (1,1,0)
 *
 *   Front-right staircase (y=0, x-direction, heights 1→2→3):
 *     (3,0,0)
 *     (4,0,0), (4,0,1)
 *     (5,0,0), (5,0,1), (5,0,2)
 *
 * Right-side view (collapse x, max_z per y-row):
 *   y=5 → max_z=1 → 2 squares
 *   y=3 → max_z=0 → 1 square
 *   y=1 → max_z=0 → 1 square
 *   y=0 → max_z=2 → 3 squares
 *   Minimum total = 7 ✓
 *
 * Uses IsoCubes primitive — SSR-safe, no hooks.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — exported so the explainer can reuse and colour-highlight groups
// ---------------------------------------------------------------------------

/** All cubes in the figure. */
export const HK23P3SFQ19_CUBES: IsoCube[] = [
  // Back cluster (y=5): 2-high stack + adjacent
  { x: 0, y: 5, z: 0 },
  { x: 0, y: 5, z: 1 },
  { x: 1, y: 5, z: 0 },
  // Middle row (y=3)
  { x: 1, y: 3, z: 0 },
  { x: 2, y: 3, z: 0 },
  { x: 3, y: 3, z: 0 },
  { x: 4, y: 3, z: 0 },
  // Front-left pair (y=1)
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  // Front-right staircase (y=0, x-direction)
  { x: 3, y: 0, z: 0 },
  { x: 4, y: 0, z: 0 },
  { x: 4, y: 0, z: 1 },
  { x: 5, y: 0, z: 0 },
  { x: 5, y: 0, z: 1 },
  { x: 5, y: 0, z: 2 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem, not the answer)
// ---------------------------------------------------------------------------

export default function RightViewHK23P3SFQ19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'A 3D arrangement of unit cubes. The question asks for the minimum number ' +
        'of unit squares visible when looking at the figure from the right side.'
      }
    >
      <div className="flex flex-col items-center gap-2">
        <IsoCubes
          cubes={HK23P3SFQ19_CUBES}
          size={22}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
        <span className="font-display text-xs font-bold text-gray-500">
          View from the right / Lihat dari kanan
        </span>
      </div>
    </div>
  )
}
