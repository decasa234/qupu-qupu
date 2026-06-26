/**
 * CubeCountSIMOC19G2Q4Illustration — SIMOC-19-G2-Q4
 *
 * "The figure below is made up of several 1×1×1 cubes.
 *  How many 1×1×1 cubes make up the entire figure?"
 * Answer: B (27) — three full 3×3 layers = 27 unit cubes.
 *
 * Source crop: docs/reference/ocr-res/simoc/contest/g2/2019.imgs/002.jpg
 * Shows a solid 3×3×3 isometric cube arrangement.
 *
 * Reuses IsoCubes from ./primitives/IsoCubes.
 */

import React from 'react'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// 27 cubes: full 3×3×3 solid block
// ---------------------------------------------------------------------------

export const CUBE_3X3X3: IsoCube[] = []
for (let z = 0; z <= 2; z++) {
  for (let y = 0; y <= 2; y++) {
    for (let x = 0; x <= 2; x++) {
      CUBE_3X3X3.push({ x, y, z })
    }
  }
}

// ---------------------------------------------------------------------------
// Neutral grey palette — shows the problem, not the answer
// ---------------------------------------------------------------------------

export const GREY_PALETTE = {
  top: '#E2E8F0',
  left: '#94A3B8',
  right: '#64748B',
  ink: '#1E293B',
}

// ---------------------------------------------------------------------------
// Component — stem illustration
// ---------------------------------------------------------------------------

export default function CubeCountSIMOC19G2Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Susunan kubus 3×3×3 yang terdiri dari kubus satuan 1×1×1. ' +
        'Hitung berapa banyak kubus yang membentuk seluruh gambar.'
      }
    >
      <IsoCubes
        cubes={CUBE_3X3X3}
        size={24}
        palette={GREY_PALETTE}
        viewPadding={10}
      />
    </div>
  )
}
