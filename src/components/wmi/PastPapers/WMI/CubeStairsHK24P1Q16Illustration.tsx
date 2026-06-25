/**
 * CubeStairsHK24P1Q16Illustration — HKIMO-24-P1H-Q16
 *
 * "It is known that figure 1 is formed by 8 cubes. How many cube(s) is / are
 * there in figure 2?" — Answer: 40.
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-1/2024.imgs/005.jpg
 *
 * Figure 1: 2×2×2 cube = 8 unit cubes.
 *   x=0..1, y=0..1, z=0..1
 *
 * Figure 2: 4-step staircase, each step 4 wide (x=0..3).
 * Steps go from front (y=0, height 1) to back (y=3, height 4):
 *   y=0: z=0         →  4 cubes
 *   y=1: z=0..1      →  8 cubes
 *   y=2: z=0..2      → 12 cubes
 *   y=3: z=0..3      → 16 cubes
 *   Total            = 40 cubes ✓
 *
 * Reuses IsoCubes from ./primitives/IsoCubes — painter-order sorted, SSR-safe.
 * Stem illustration only (no answer options).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel sets
// ---------------------------------------------------------------------------

/** Figure 1 — 2×2×2 = 8 unit cubes */
export const HK24P1Q16_FIG1_CUBES: IsoCube[] = [
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
]

/** Figure 2 — 4-step staircase = 40 unit cubes */
export const HK24P1Q16_FIG2_CUBES: IsoCube[] = [
  // y=0 (front): height 1 — 4 cubes
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  // y=1: height 2 — 8 cubes
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 }, { x: 3, y: 1, z: 1 },
  // y=2: height 3 — 12 cubes
  { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
  { x: 0, y: 2, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 2, y: 2, z: 1 }, { x: 3, y: 2, z: 1 },
  { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 }, { x: 2, y: 2, z: 2 }, { x: 3, y: 2, z: 2 },
  // y=3 (back): height 4 — 16 cubes
  { x: 0, y: 3, z: 0 }, { x: 1, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 3, y: 3, z: 0 },
  { x: 0, y: 3, z: 1 }, { x: 1, y: 3, z: 1 }, { x: 2, y: 3, z: 1 }, { x: 3, y: 3, z: 1 },
  { x: 0, y: 3, z: 2 }, { x: 1, y: 3, z: 2 }, { x: 2, y: 3, z: 2 }, { x: 3, y: 3, z: 2 },
  { x: 0, y: 3, z: 3 }, { x: 1, y: 3, z: 3 }, { x: 2, y: 3, z: 3 }, { x: 3, y: 3, z: 3 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration
// ---------------------------------------------------------------------------

export default function CubeStairsHK24P1Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Figure 1: a 2×2×2 cube made of 8 unit cubes. ' +
        'Figure 2: a 4-step staircase made of 40 unit cubes (4 wide, steps increase in height from 1 to 4).'
      }
    >
      <div className="flex flex-wrap items-end justify-around gap-6">
        {/* Figure 1 */}
        <div className="flex flex-col items-center gap-1">
          <IsoCubes
            cubes={HK24P1Q16_FIG1_CUBES}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
          <span className="font-display text-xs font-bold text-gray-600">Figure 1 / Gambar 1</span>
        </div>
        {/* Figure 2 */}
        <div className="flex flex-col items-center gap-1">
          <IsoCubes
            cubes={HK24P1Q16_FIG2_CUBES}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
          <span className="font-display text-xs font-bold text-gray-600">Figure 2 / Gambar 2</span>
        </div>
      </div>
    </div>
  )
}
