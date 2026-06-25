/**
 * RightViewHK25P3Q16Illustration — HKIMO-25-P3H-Q16
 *
 * "At least how many square(s) can be seen if viewing the figure below from the right?"
 * Answer: 6
 *
 * Source image: docs/reference/ocr-res/hkimo/heat/primary-3/2025.imgs/008.jpg
 *
 * The figure is a 3D cube structure with:
 *   — A 4-cube tower at back-left  (x=0, y=3, z=0..3)
 *   — A 2-cube step at front-left  (x=0, y=2, z=0..1)
 *   — A 3-cube column at back-right (x=3, y=3, z=0..2)  [same depth as tower]
 *   — Two 2-cube columns at front-right (x=3,4, y=2, z=0..1)
 *
 * Right-side projection (y–z plane, looking from +x):
 *   y=2: z=0, z=1  →  2 visible squares
 *   y=3: z=0,1,2,3  →  4 visible squares (tower reaches z=3)
 *   Total: 2 + 4 = 6 ✓
 *
 * Uses IsoCubes primitive. SSR-safe (no hooks, no motion).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Cube data — exported for reuse in Explainer
// ---------------------------------------------------------------------------

/** Full 3D cube set for the figure in 008.jpg (faithful simplified version). */
export const HK25P3Q16_CUBES: IsoCube[] = [
  // Left tower: 4 cubes high at (x=0, y=3) — back-left
  { x: 0, y: 3, z: 0 },
  { x: 0, y: 3, z: 1 },
  { x: 0, y: 3, z: 2 },
  { x: 0, y: 3, z: 3 },
  // Left step: 2 cubes high at (x=0, y=2) — front-left
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 2, z: 1 },
  // Right staircase back: 3 cubes high at (x=3, y=3) — back-right, same depth as tower
  { x: 3, y: 3, z: 0 },
  { x: 3, y: 3, z: 1 },
  { x: 3, y: 3, z: 2 },
  // Right staircase mid: 2 cubes high at (x=3, y=2) — front-right
  { x: 3, y: 2, z: 0 },
  { x: 3, y: 2, z: 1 },
  // Right staircase front: 2 cubes high at (x=4, y=2) — rightmost front
  { x: 4, y: 2, z: 0 },
  { x: 4, y: 2, z: 1 },
]

// ---------------------------------------------------------------------------
// Component — stem illustration
// ---------------------------------------------------------------------------

export default function RightViewHK25P3Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'A 3D cube arrangement with a 4-cube tower on the back-left and a ' +
        'staircase cluster on the right. Question: how many squares are visible when viewed from the right?'
      }
    >
      <div className="flex flex-col items-center gap-3">
        <IsoCubes
          cubes={HK25P3Q16_CUBES}
          size={26}
          palette={ISO_BLUE_PALETTE}
          viewPadding={10}
        />
        {/* Direction label */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <span>View from right</span>
          <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden="true">
            <line x1="0" y1="7" x2="24" y2="7" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="18,2 24,7 18,12" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>/ Lihat dari kanan</span>
        </div>
      </div>
    </div>
  )
}
