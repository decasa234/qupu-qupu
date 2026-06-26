/**
 * CornerCubesSASMO20G3Q6Illustration — SASMO-20-G3-Q6
 *
 * "Diagram menunjukkan beberapa kubus dengan ukuran yang sama yang ditumpuk
 * di sudut sebuah ruangan. Berapa banyak kubus semuanya?"
 * Answer: B (30 cubes).
 *
 * Source: docs/reference/ocr-res/sasmo/contest/g3/2020.imgs/008.jpg
 *
 * The arrangement is a 4-layer staircase pyramid in a room corner (corner = back,
 * two walls visible):
 *   Layer z=0 (bottom): 4 × 4 = 16 cubes
 *   Layer z=1:          3 × 3 =  9 cubes  (occupies back-left 3×3)
 *   Layer z=2:          2 × 2 =  4 cubes  (occupies back-left 2×2)
 *   Layer z=3 (top):    1 × 1 =  1 cube   (corner only)
 *   Total = 16 + 9 + 4 + 1 = 30  ✓  (answer B)
 *
 * Coordinate mapping (IsoCubes: x=right, y=depth/further-back, z=up):
 *   Room corner sits at (x=0, y=3) — top-centre of the iso view.
 *   Right wall runs along y=3 at increasing x.
 *   Left  wall runs along x=0 at decreasing y.
 *
 * Trap: counting only the 20 visible-from-front cubes gives answer A — you must
 * include hidden cubes behind the visible face.
 *
 * Imports IsoCubes from ./primitives/IsoCubes (IMPORT-FIRST).
 */

import React from 'react'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 30-cube staircase pyramid in a room corner
// Exported so the explainer can reuse and highlight layers.
// ---------------------------------------------------------------------------

/** All 30 cubes, listed layer by layer for easy slicing in the explainer. */
export const SASMO20G3Q6_CUBES: IsoCube[] = [
  // z=0  bottom layer — full 4×4 floor (16 cubes)
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
  { x: 0, y: 3, z: 0 }, { x: 1, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 3, y: 3, z: 0 },

  // z=1  second layer — back-left 3×3 (9 cubes)
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
  { x: 0, y: 2, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 2, y: 2, z: 1 },
  { x: 0, y: 3, z: 1 }, { x: 1, y: 3, z: 1 }, { x: 2, y: 3, z: 1 },

  // z=2  third layer — back-left 2×2 (4 cubes)
  { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 },
  { x: 0, y: 3, z: 2 }, { x: 1, y: 3, z: 2 },

  // z=3  top layer — corner only (1 cube)
  { x: 0, y: 3, z: 3 },
]

export const SASMO20G3Q6_TOTAL = 30

/** Number of cubes per horizontal layer (bottom to top). */
export const SASMO20G3Q6_LAYER_COUNTS = [16, 9, 4, 1] as const

// ---------------------------------------------------------------------------
// Component — stem illustration (shows the problem; does NOT reveal the answer)
// ---------------------------------------------------------------------------

export default function CornerCubesSASMO20G3Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Susunan kubus di sudut ruangan — tampak isometrik. ' +
        'Lantai berukuran 4×4 kubus, ditumpuk seperti piramida ke sudut. ' +
        'Hitung semua kubus termasuk yang tersembunyi di balik tumpukan.'
      }
    >
      <IsoCubes
        cubes={SASMO20G3Q6_CUBES}
        size={24}
        palette={ISO_BLUE_PALETTE}
        viewPadding={10}
        label="Kubus ditumpuk di sudut ruangan — hitung semua kubus"
      />
    </div>
  )
}
