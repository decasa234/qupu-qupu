/**
 * TopViewHK19P2Q19Illustration — HKIMO-19-P2H-Q19
 *
 * "At least how many squares can be seen if viewing the figure below from the top?"
 * Answer: 4 (distinct top-view positions).
 *
 * Source: docs/reference/ocr-res/hkimo/heat/primary-2/2019.imgs/004.jpg
 *
 * Structure reconstruction (6 cubes, 4 distinct top-view cells):
 *   (0,1,0)            — single cube, far-left protrusion
 *   (1,1,0), (1,1,1)   — 2-high stack, center-back (gray top visible)
 *   (1,0,0)            — single cube, center-front
 *   (2,0,0), (2,0,1)   — 2-high stack, right-front (gray top visible)
 *
 *   Top-view footprint: (0,1), (1,1), (1,0), (2,0) = 4 distinct cells ✓
 *   Answer 4 confirmed.
 *
 * Primitive: IsoCubes (./primitives/IsoCubes). SSR-safe.
 * Stem illustration — does NOT reveal the answer.
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — exported for reuse in the explainer
// ---------------------------------------------------------------------------

/** 6-cube figure with 4 distinct top-view (x,y) positions */
export const HK19P2Q19_CUBES: IsoCube[] = [
  { x: 0, y: 1, z: 0 }, // far-left protrusion (single)
  { x: 1, y: 1, z: 0 }, // center-back, ground
  { x: 1, y: 1, z: 1 }, // center-back, top (gray top face)
  { x: 1, y: 0, z: 0 }, // center-front (single)
  { x: 2, y: 0, z: 0 }, // right-front, ground
  { x: 2, y: 0, z: 1 }, // right-front, top (gray top face)
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TopViewHK19P2Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Isometric figure of six unit cubes: one cube at far left, a two-cube stack ' +
        'in the center-back, one cube in center-front, and a two-cube stack at right-front. ' +
        'Count how many squares are visible from the top.'
      }
    >
      <IsoCubes
        cubes={HK19P2Q19_CUBES}
        size={26}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Isometric cube figure — count squares visible from the top"
      />
    </div>
  )
}
