/**
 * PaintedCubes22A20Illustration — SEAMO-22-A-Q20
 *
 * "A cube has 6 faces. The object shown is made up of 8 cubes.
 *  How many cubes will have 4 faces painted if the object is painted yellow?"
 *
 * Answer: B (4 cubes)
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-a/2022.imgs/017.jpg
 *
 * The object is a flat 4-wide × 2-deep rectangular slab at z=0.
 * In isometric projection this appears as a wide L-silhouette shape.
 *
 * Voxel layout (x=right, y=depth, z=up):
 *   y=0 (front row): x=0,1,2,3   ← 4 cubes
 *   y=1 (back row):  x=0,1,2,3   ← 4 cubes
 *   Total: 8 cubes
 *
 * Face-count analysis (all cubes at same height, so top/bottom always exposed):
 *   Corner cubes — (0,0,0),(3,0,0),(0,1,0),(3,1,0): each touches exactly
 *     2 neighbours → 4 painted faces  ← 4 cubes
 *   Edge-interior cubes — (1,0,0),(2,0,0),(1,1,0),(2,1,0): each touches
 *     exactly 3 neighbours → 3 painted faces  ← 4 cubes
 *
 *   → 4 cubes have exactly 4 painted faces.  Answer: B ✓
 *
 * Classification: stem (the figure appears in the question body, not as answer options).
 * Reuses IsoCubes primitive — SSR-safe, no hooks, no framer-motion.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 8-cube flat 4×2 slab
// Exported so the explainer can highlight individual cubes.
// ---------------------------------------------------------------------------

/** All 8 cubes of the painted-cube object. */
export const SEAMO22A20_CUBES: IsoCube[] = [
  // Front row (y=0)
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 3, y: 0, z: 0 },
  // Back row (y=1)
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 },
  { x: 3, y: 1, z: 0 },
]

/**
 * The four corner cubes that will have exactly 4 faces painted.
 * Each shares exactly 2 faces with neighbours.
 */
export const SEAMO22A20_FOUR_PAINTED: IsoCube[] = [
  { x: 0, y: 0, z: 0, color: '#FFD23F' }, // front-left corner
  { x: 3, y: 0, z: 0, color: '#FFD23F' }, // front-right corner
  { x: 0, y: 1, z: 0, color: '#FFD23F' }, // back-left corner
  { x: 3, y: 1, z: 0, color: '#FFD23F' }, // back-right corner
]

// ---------------------------------------------------------------------------
// Component — stem illustration (does NOT highlight answer)
// ---------------------------------------------------------------------------

export default function PaintedCubes22A20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'An isometric object made of 8 unit cubes arranged in a flat 4-wide × 2-deep slab. ' +
        'When painted yellow on all outer faces, count how many cubes will have exactly 4 faces painted.'
      }
    >
      <IsoCubes
        cubes={SEAMO22A20_CUBES}
        size={30}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="8-cube flat slab — count cubes with 4 painted faces"
      />
    </div>
  )
}
