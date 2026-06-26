/**
 * StackedCubesSIMOC22G1Q9Illustration — SIMOC-22-G1-Q9
 *
 * "The diagram shows some cubes of the same size stacked in a corner of a room.
 *  How many cubes are there altogether?" — Answer: E (24)
 *
 * Arrangement: 4-wide × 3-deep staircase touching the corner (back wall + left wall).
 *   y=0 (front row):  height 1 →  4 cubes
 *   y=1 (middle row): height 2 →  8 cubes
 *   y=2 (back row):   height 3 → 12 cubes
 *   Total = 4 + 8 + 12 = 24 cubes ✓
 *
 * Source crop: docs/reference/ocr-res/simoc/contest/g1/2022.imgs/012.jpg
 * Reuses IsoCubes from ./primitives/IsoCubes — SSR-safe, no hooks.
 */

import React from 'react'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Voxel set — 24 cubes: 4-wide, 3-deep staircase
// ---------------------------------------------------------------------------

export const SIMOC22G1Q9_CUBES: IsoCube[] = [
  // y=0 (frontmost row): 1 cube high × 4 wide = 4 cubes
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
  // y=1 (middle row): 2 cubes high × 4 wide = 8 cubes
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
  { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
  { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 },
  { x: 2, y: 1, z: 1 }, { x: 3, y: 1, z: 1 },
  // y=2 (back row, touching back wall): 3 cubes high × 4 wide = 12 cubes
  { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 },
  { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
  { x: 0, y: 2, z: 1 }, { x: 1, y: 2, z: 1 },
  { x: 2, y: 2, z: 1 }, { x: 3, y: 2, z: 1 },
  { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 },
  { x: 2, y: 2, z: 2 }, { x: 3, y: 2, z: 2 },
]

// ---------------------------------------------------------------------------
// Neutral grey palette — shows the problem, not the answer
// ---------------------------------------------------------------------------

export const SIMOC22G1Q9_PALETTE = {
  top:   '#E2E8F0',
  left:  '#94A3B8',
  right: '#64748B',
  ink:   '#1E293B',
}

// ---------------------------------------------------------------------------
// Component — stem illustration (problem only, no answer)
// ---------------------------------------------------------------------------

export default function StackedCubesSIMOC22G1Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tumpukan kubus-kubus seukuran di sudut ruangan. ' +
        'Baris depan setinggi 1, baris tengah setinggi 2, baris belakang setinggi 3, ' +
        'masing-masing 4 kubus lebar. Hitung total termasuk yang tersembunyi.'
      }
    >
      <IsoCubes
        cubes={SIMOC22G1Q9_CUBES}
        size={26}
        palette={SIMOC22G1Q9_PALETTE}
        viewPadding={10}
      />
    </div>
  )
}
