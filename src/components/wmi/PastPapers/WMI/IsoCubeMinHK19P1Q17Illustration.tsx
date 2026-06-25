/**
 * IsoCubeMinHK19P1Q17Illustration — HKIMO-19-P1H-Q17
 *
 * "At least how many cube(s) is / are there in the figure below?"
 * Answer: 9 (minimum).
 *
 * Source: docs/reference/ocr-res/hkimo/heat/primary-1/2019.imgs/003.jpg
 *
 * Structure reconstruction (minimum = 9):
 *   z=0 (ground, 7 cubes): irregular winding footprint
 *     (0,2,0) — isolated back-left protrusion
 *     (1,2,0), (1,1,0) — left column
 *     (2,1,0), (3,1,0) — middle-right row
 *     (3,0,0), (2,0,0) — front-right row
 *
 *   z=1 (elevated, 2 cubes — each directly supported):
 *     (1,2,1) — on top of (1,2,0)
 *     (3,1,1) — on top of (3,1,0)
 *
 *   Total: 7 + 2 = 9. All elevated cubes rest on ground cubes — no hidden
 *   support cubes are forced. Minimum = 9 ✓
 *
 * Primitive: IsoCubes (./primitives/IsoCubes). SSR-safe.
 * Classification: stem illustration (figure in question body, not as choices).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel sets — exported for reuse in the explainer
// ---------------------------------------------------------------------------

/** Ground layer (z = 0) — 7 cubes */
export const HKIMO19P1Q17_GROUND: IsoCube[] = [
  { x: 0, y: 2, z: 0 }, // isolated back-left protrusion
  { x: 1, y: 2, z: 0 }, // left-back
  { x: 1, y: 1, z: 0 }, // left-center
  { x: 2, y: 1, z: 0 }, // center
  { x: 3, y: 1, z: 0 }, // right
  { x: 3, y: 0, z: 0 }, // front-right
  { x: 2, y: 0, z: 0 }, // front-center
]

/** Elevated layer (z = 1) — 2 cubes, each directly supported */
export const HKIMO19P1Q17_ELEVATED: IsoCube[] = [
  { x: 1, y: 2, z: 1 }, // sits on (1,2,0)
  { x: 3, y: 1, z: 1 }, // sits on (3,1,0)
]

/** Full 9-cube voxel set (minimum configuration) */
export const HKIMO19P1Q17_ALL: IsoCube[] = [
  ...HKIMO19P1Q17_GROUND,
  ...HKIMO19P1Q17_ELEVATED,
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function IsoCubeMinHK19P1Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Isometric figure made of unit cubes in an irregular arrangement. ' +
        'Seven cubes at ground level with two additional cubes stacked on top. ' +
        'Count the minimum number of cubes in the figure.'
      }
    >
      <IsoCubes
        cubes={HKIMO19P1Q17_ALL}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Isometric cube figure — find the minimum cube count"
      />
    </div>
  )
}
